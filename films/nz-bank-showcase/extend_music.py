# "Tech Talk" (Kevin MacLeod, incompetech.com, CC BY 4.0) is 4:02. Extend it to the film's 4:30 by
# repeating 16 bars from its middle, spliced on the downbeat where the music matches itself best.
# Download first:  curl -o music/Tech_Talk.mp3 "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Tech%20Talk.mp3"
import subprocess, numpy as np, soundfile as sf
sr=44100
raw=subprocess.run(['ffmpeg','-v','error','-i','music/Tech_Talk.mp3','-ac','2','-ar',str(sr),'-f','f32le','-'],capture_output=True,check=True).stdout
x=np.frombuffer(raw,np.float32).reshape(-1,2).copy(); mono=x.mean(1)
# tempo and phase from onset autocorrelation (measured: 139.62 bpm)
hop=sr//200; m=len(mono)//hop*hop
env=np.sqrt((mono[:m].reshape(-1,hop)**2).mean(1)); o=np.maximum(np.diff(np.log(env+1e-4)),0); o-=o.mean()
seg=o[20*200:140*200]; ac=np.correlate(seg,seg,'full')[len(seg)-1:]; lags=np.arange(len(ac))
sel=(lags>=200*60/180)&(lags<=200*60/80); lag=lags[sel][np.argmax(ac[sel])]
y0,y1,y2=ac[lag-1],ac[lag],ac[lag+1]; beat=(lag+0.5*(y0-y2)/(y0-2*y1+y2))/200
t=np.arange(len(o))/200; ph=np.linspace(0,beat,200,endpoint=False)
phase=ph[int(np.argmax([o[((t-p)%beat)<0.01].sum() for p in ph]))]
import sys
BARS=int(sys.argv[1]) if len(sys.argv)>1 else 16
bar=4*beat; L=BARS*bar
def feat(t):
    a=int(t*sr); w=mono[a:a+int(2*sr)]; S=np.abs(np.fft.rfft(w*np.hanning(len(w))))
    return np.log(np.add.reduceat(S,np.unique(np.geomspace(1,len(S)-1,40).astype(int)))+1e-6)
cands=[(np.corrcoef(np.r_[feat(s-2),feat(s)],np.r_[feat(s+L-2),feat(s+L)])[0,1],s)
       for s in (phase+k*bar for k in range(10,200)) if 40<=s and s+L+4<=len(mono)/sr-20]
c,s=max(cands); xf=int(0.08*sr); p=int((s+L)*sr); q=int(s*sr)
head=x[:p+xf].copy(); tail=x[q:].copy(); r=np.linspace(0,1,xf)[:,None]
head[-xf:]=head[-xf:]*np.cos(r*np.pi/2)+tail[:xf]*np.sin(r*np.pi/2)
y=np.concatenate([head,tail[xf:]]); sf.write('music/tt_ext.wav',y,sr)
print(f'bpm {60/beat:.2f}, splice {s+L:.3f}s -> {s:.3f}s, match {c:.4f}, length {len(y)/sr:.2f}s')
