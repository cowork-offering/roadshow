# Expressive narration: Chatterbox (MIT), exaggeration 0.7, cfg 0.4. One file per sentence, silence trimmed.
import json, sys, torch, numpy as np, soundfile as sf
from chatterbox.tts import ChatterboxTTS
torch.set_num_threads(4)
EX,CFG=0.7,0.4
L=json.load(open('lines.json')); only=set(sys.argv[1:])
m=ChatterboxTTS.from_pretrained(device="cpu")
for k,v_ in L.items():
    a,b,sents=v_[:3]
    for i,s in enumerate(sents):
        key=f'{k}_{i}'
        if only and key not in only: continue
        say=s.replace('nCino','Encino').replace("It's eleven forty in Wellington.","It is now eleven forty, in Wellington.").replace('So her first','So, her first').replace('He builds in a cloned dev org. The change is checked against Encino','He builds in a cloned dev org. Next, his change is checked against Encino')
        if only: torch.manual_seed(abs(hash(key))%10000+7)
        w=m.generate(say, exaggeration=EX, cfg_weight=0.3 if only else CFG).squeeze(0).numpy()
        idx=np.where(np.abs(w)>0.01)[0]; sr=m.sr
        w=w[max(0,idx[0]-int(.03*sr)):idx[-1]+int(.12*sr)]
        sf.write(f'v2/vo_{key}.wav',w,sr); print(key,round(len(w)/sr,2),flush=True)
