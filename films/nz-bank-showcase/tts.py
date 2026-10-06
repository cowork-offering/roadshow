import json, soundfile as sf, numpy as np
from kokoro_onnx import Kokoro
import os
D=os.environ.get('KOKORO_DIR','./kokoro/')
k=Kokoro(os.path.join(D,'kokoro-v1.0.onnx'),os.path.join(D,'voices-v1.0.bin'))
L=json.load(open('lines.json')); res={}
for key,(a,b,sents) in L.items():
    durs=[]
    for i,s in enumerate(sents):
        w,sr=k.create(s,voice='af_heart',speed=1.0,lang='en-us')
        # trim leading/trailing silence
        idx=np.where(np.abs(w)>0.01)[0]; w=w[max(0,idx[0]-int(.03*sr)):idx[-1]+int(.08*sr)]
        sf.write(f'vo_{key}_{i}.wav',w,sr); durs.append(round(len(w)/sr,3))
    tot=sum(durs)+0.35*(len(durs)-1)
    res[key]={'win':[a,b],'durs':durs,'total':round(tot,2),'slack':round(b-a-tot,2)}
    print(key,res[key]['total'],'of',b-a,'slack',res[key]['slack'],flush=True)
json.dump(res,open('vo_timing.json','w'),indent=1)
