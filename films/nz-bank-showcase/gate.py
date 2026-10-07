import json, re, subprocess, numpy as np, sys, difflib
from faster_whisper import WhisperModel
m=WhisperModel("base.en",device="cpu",compute_type="int8")
L=json.load(open('lines.json')); fails=[]
norm=lambda s:re.sub(r'[^a-z0-9 ]','',s.lower().replace('-',' ').replace('ncino','encino')).split()
only=set(sys.argv[1:])
for k,v_ in L.items():
    a,b,sents=v_[:3]
    for i,s in enumerate(sents):
        key=f'{k}_{i}'
        if only and key not in only: continue
        raw=subprocess.run(['ffmpeg','-v','error','-i',f'v2/vo_{key}.wav','-ar','16000','-ac','1','-f','f32le','-'],capture_output=True).stdout
        x=np.frombuffer(raw,np.float32)
        segs,_=m.transcribe(x,beam_size=1); txt=' '.join(t.text.strip() for t in segs)
        r=difflib.SequenceMatcher(None,norm(s),norm(txt)).ratio(); dur=len(x)/16000
        wps=len(s.split())/dur
        flag = r<0.85 or wps>4.2 or wps<1.6
        if flag: fails.append(key)
        print(f"{'FAIL' if flag else 'ok  '} {key} match {r:.2f} {wps:.1f} w/s | {txt}")
print('FAILS',' '.join(fails))
