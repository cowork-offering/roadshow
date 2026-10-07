# Narration + music bed. Bed ducks under speech on the known cue windows, sits at -21 dBFS RMS in the
# gaps, head-fades from silence; then two-pass loudnorm of the full mix to -14 LUFS / -1 dBTP.
import json, sys, subprocess, numpy as np, soundfile as sf
VODIR=sys.argv[1] if len(sys.argv)>1 else '.'
SR=48000
import json as _j
TOTAL=max(v['win'][1] for v in _j.load(open('timing.json')).values()); N=int(TOTAL*SR)
def load(path,ch):
    raw=subprocess.run(['ffmpeg','-v','error','-i',path,'-ar',str(SR),'-ac',str(ch),'-f','f32le','-'],capture_output=True,check=True).stdout
    return np.frombuffer(raw,np.float32).reshape(-1,ch).copy()
T=json.load(open('timing.json'))
vo=np.zeros((N,1),np.float32); act=np.zeros(N,np.float32); lines=[]
for k,v in T.items():
    for i,st in enumerate(v['starts']):
        w=load(f'{VODIR}/vo_{k}_{i}.wav',1); p=int((v['win'][0]+st)*SR)
        vo[p:p+len(w)]+=w[:N-p]; act[p:p+len(w)]=1; lines.append((k,p,p+len(w)))
db=lambda x:20*np.log10(np.sqrt(np.mean(np.square(x)))+1e-12)
# voice to a fixed working level
vo*=10**((-20-db(vo[act>0]))/20)
m=load('music/tt_ext.wav',2); mus=np.zeros((N,2),np.float32); mus[:min(N,len(m))]=m[:N]
# activity envelope: 150 ms attack, 600 ms release (one-pole, both directions handled by asym smoothing)
env=np.zeros(N,np.float32); a=np.exp(-1/(0.150*SR)); r=np.exp(-1/(0.600*SR))
# look-ahead so the duck is already down when the first syllable lands
la=int(0.15*SR); tgt=np.concatenate([act[la:],np.zeros(la,np.float32)])
e=0.0
for n in range(0,N,48):  # 1 ms control rate
    t=tgt[n]; c=a if t>e else r; c=c**48; e=t+(e-t)*c; env[n:n+48]=e
GAP=-21.0; DUCK=-9.0
gaps=act==0
mus_gap_db=db(mus[gaps&(np.arange(N)>3*SR)])
g=10**((GAP-mus_gap_db+DUCK*env)/20)
# head fade 2.5 s from -60 dB, tail: follow the picture's fade to black (269.3 -> 270.0)
t=np.arange(N)/SR
g*=np.where(t<2.5,10**((-60+60*np.clip(t/2.5,0,1))/20),1.0)
g*=np.clip((TOTAL-t)/0.7,0,1)
bed=mus*g[:,None]
mix=bed+vo
sf.write('mix_pre.wav',mix,SR)
# level table (pre-loudnorm; the one loudnorm gain applies to every row equally)
print(f"{'scene':6s} {'VO dB':>7s} {'bed under VO':>13s} {'separation':>11s} {'bed in gaps':>12s}")
for k,v in T.items():
    a0,b0=[int(x*SR) for x in v['win']]; sl=slice(a0,b0)
    av=act[sl]>0
    print(f"{k:6s} {db(vo[sl][av]):7.1f} {db(bed[sl][av]):13.1f} {db(vo[sl][av])-db(bed[sl][av]):11.1f} {db(bed[sl][~av]) if (~av).sum()>SR//2 else float('nan'):12.1f}")
m_=subprocess.run(['ffmpeg','-hide_banner','-i','mix_pre.wav','-af','loudnorm=I=-14:TP=-1:LRA=11:print_format=json','-f','null','-'],capture_output=True,text=True).stderr
d=json.loads(m_[m_.rindex('{'):m_.rindex('}')+1])
f=(f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={d['input_i']}:measured_TP={d['input_tp']}:measured_LRA={d['input_lra']}"
   f":measured_thresh={d['input_thresh']}:offset={d['target_offset']}:linear=true")
subprocess.run(['ffmpeg','-v','error','-y','-i','mix_pre.wav','-af',f,'-ar','48000','-c:a','pcm_s24le','mix_master.wav'],check=True)
print('loudnorm gain applied, input', d['input_i'], 'LUFS')
