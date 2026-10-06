# vo_timing.json (measured line lengths) -> timing.json (cue time of every sentence, per scene)
import json
T=json.load(open('vo_timing.json')); out={}
for k,v in T.items():
    a,b=v['win']; d=v['durs']; n=len(d)
    first=0.4 if k=='s01' else 0.5
    gap=0.35 if n==1 else min(2.2,max(0.35,(b-a-first-1.2-sum(d))/(n-1)))
    st=[];x=first
    for dd in d: st.append(round(x,3)); x+=dd+gap
    out[k]={'win':[a,b],'starts':st,'durs':d,'end':round(x-gap,2)}
    assert x-gap<=b-a-0.3, f'{k} narration overruns its window'
json.dump(out,open('timing.json','w'))
