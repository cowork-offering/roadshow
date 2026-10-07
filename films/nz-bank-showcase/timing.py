# Measured line lengths -> cue time of every sentence. A scene may carry a 4th field in lines.json:
# extra pause (s) after each sentence, used where the picture needs reading time.
import json, soundfile as sf
L=json.load(open('lines.json')); out={}
for k,v in L.items():
    a,b,sents=v[:3]; pauses=v[3] if len(v)>3 else None
    d=[round(sf.info(f'v2/vo_{k}_{i}.wav').duration,3) for i in range(len(sents))]; n=len(d)
    first=0.4 if k=='s01' else 0.5
    if pauses: gaps=[0.35+p for p in pauses]
    else: g=0.35 if n==1 else min(2.2,max(0.35,(b-a-first-1.2-sum(d))/(n-1))); gaps=[g]*n
    st=[];x=first
    for i,dd in enumerate(d): st.append(round(x,3)); x+=dd+gaps[i]
    end=st[-1]+d[-1]
    out[k]={'win':[a,b],'starts':st,'durs':d,'end':round(end,2)}
    assert end<=b-a-0.3, f'{k} narration overruns its window: {end:.2f} of {b-a}'
json.dump(out,open('timing.json','w'))
print(' '.join(f"{k}:{v['end']}/{v['win'][1]-v['win'][0]}" for k,v in out.items()))
