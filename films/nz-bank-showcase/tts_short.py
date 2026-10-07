# Voice D, cloned from the approved sample itself (voice_ref_D_sample.wav), exaggeration 0.7, cfg 0.4.
# Usage: tts_both.py [all | key ...]  keys like s04_2 (long film) or c40_3 (40 s cut)
import json, sys, torch, numpy as np, soundfile as sf
from chatterbox.tts import ChatterboxTTS
torch.set_num_threads(4)
EX,CFG,REF=0.7,0.4,'voice_ref_D_sample.wav'
SUB=[("Accenture's: forty-five nCino engagements","Accenture's. Forty-five, Encino engagements"),("And nCino's, through","And Encino's own, through"),('nCino','Encino'),("It's eleven forty in Wellington.","It is now eleven forty, in Wellington."),('So her first','So, her first'),
     ('He builds in a cloned dev org. The change is checked against Encino','He builds in a cloned dev org. Next, his change is checked against Encino')]
jobs=[]
for path,out in [('short60/lines.json','short60/vo')]:
    for k,v in json.load(open(path)).items():
        for i,s in enumerate(v[2]): jobs.append((f'{k}_{i}',s,out))
only=set(sys.argv[1:])-{'all'}
m=ChatterboxTTS.from_pretrained(device="cpu")
for key,s,out in jobs:
    if only and key not in only: continue
    say=s
    for a,b in SUB: say=say.replace(a,b)
    if only: torch.manual_seed(abs(hash(key+str(len(only))))%10000+3)
    w=m.generate(say,audio_prompt_path=REF,exaggeration=EX,cfg_weight=CFG).squeeze(0).numpy()
    sr=m.sr; idx=np.where(np.abs(w)>0.01)[0]; w=w[max(0,idx[0]-int(.03*sr)):idx[-1]+int(.12*sr)]
    sf.write(f'{out}/vo_{key}.wav',w,sr); print(key,round(len(w)/sr,2),flush=True)
