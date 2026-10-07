# 40 s cut mix: narration at its cues, the music bed entering on the downbeat of a full-energy bar,
# ducked under speech, two-pass loudnorm to -14 LUFS / -1 dBTP for social.
import json, subprocess, numpy as np, soundfile as sf
SR=48000; MAP=json.load(open('short60/map.json')); N=int(MAP['total']*SR)
def load(p,ch):
    raw=subprocess.run(['ffmpeg','-v','error','-i',p,'-ar',str(SR),'-ac',str(ch),'-f','f32le','-'],capture_output=True,check=True).stdout
    return np.frombuffer(raw,np.float32).reshape(-1,ch).copy()
vo=np.zeros((N,1),np.float32); act=np.zeros(N,np.float32)
for i,c in enumerate(MAP['cues']):
    w=load(f'short60/vo/vo_h60_{i}.wav',1); p=int(c*SR); vo[p:p+len(w)]+=w[:N-p]; act[p:p+len(w)]=1
db=lambda x:20*np.log10(np.sqrt(np.mean(np.square(x)))+1e-12)
vo*=10**((-20-db(vo[act>0]))/20)
bpm,beat,phase=map(float,open('music/tt_grid.txt').read().split()) if False else (139.6,60/139.6,0.3825)
start=phase+round((30.0-phase)/(4*beat))*4*beat          # a downbeat about 30 s into the track
m=load('music/tt_ext.wav',2)[int(start*SR):]; mus=np.zeros((N,2),np.float32); mus[:min(N,len(m))]=m[:N]
la=int(0.15*SR); tgt=np.concatenate([act[la:],np.zeros(la,np.float32)]); env=np.zeros(N,np.float32)
a=np.exp(-1/(0.150*SR)); r=np.exp(-1/(0.600*SR)); e=0.0
for n in range(0,N,48): t=tgt[n]; c=(a if t>e else r)**48; e=t+(e-t)*c; env[n:n+48]=e
GAP=-19.0; DUCK=-7.0
g=10**((GAP-db(mus)+DUCK*env)/20)
t=np.arange(N)/SR
g*=np.where(t<0.6,10**((-40+40*np.clip(t/0.6,0,1))/20),1.0)
g*=np.clip((MAP['total']-t)/1.5,0,1)
mix=mus*g[:,None]+vo
sf.write('short60/mix_pre.wav',mix,SR)
av=act>0; print(f'voice {db(vo[av]):.1f} dB, bed under voice {db((mus*g[:,None])[av]):.1f} dB, bed in gaps {db((mus*g[:,None])[~av]):.1f} dB')
m_=subprocess.run(['ffmpeg','-hide_banner','-i','short60/mix_pre.wav','-af','loudnorm=I=-14:TP=-1:LRA=11:print_format=json','-f','null','-'],capture_output=True,text=True).stderr
d=json.loads(m_[m_.rindex('{'):m_.rindex('}')+1])
f=(f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={d['input_i']}:measured_TP={d['input_tp']}:measured_LRA={d['input_lra']}"
   f":measured_thresh={d['input_thresh']}:offset={d['target_offset']}:linear=true")
subprocess.run(['ffmpeg','-v','error','-y','-i','short60/mix_pre.wav','-af',f,'-ar','48000','-c:a','pcm_s24le','short60/mix_master.wav'],check=True)
