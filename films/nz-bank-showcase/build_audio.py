# Place every narration sentence at its cue, then two-pass loudnorm to -14 LUFS / -1 dBTP (web).
import json, subprocess, numpy as np, soundfile as sf
T=json.load(open('timing.json')); sr=24000; out=np.zeros(int(270*sr),dtype=np.float32)
for k,v in T.items():
    for i,st in enumerate(v['starts']):
        w,r=sf.read(f'vo_{k}_{i}.wav',dtype='float32'); assert r==sr
        p=int((v['win'][0]+st)*sr); out[p:p+len(w)]+=w
sf.write('vo_track.wav',out,sr)
m=subprocess.run(['ffmpeg','-hide_banner','-i','vo_track.wav','-af','loudnorm=I=-14:TP=-1:LRA=11:print_format=json','-f','null','-'],capture_output=True,text=True).stderr
d=json.loads(m[m.rindex('{'):m.rindex('}')+1])
f=(f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={d['input_i']}:measured_TP={d['input_tp']}:measured_LRA={d['input_lra']}"
   f":measured_thresh={d['input_thresh']}:offset={d['target_offset']}:linear=true")
subprocess.run(['ffmpeg','-v','error','-y','-i','vo_track.wav','-af',f,'-ar','48000','-c:a','pcm_s16le','vo_master.wav'],check=True)
