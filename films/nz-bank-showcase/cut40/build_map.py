# Short cut (60 s), built to the hypevideo grammar: shot changes snapped to the music's beat grid, one
# eased camera push per shot (added in render_cut.js), UI shown at near real speed, narration at natural
# pace with room between lines. Every shot points at a moment in the master (timing.json).
import json, soundfile as sf
TARGET=60.0; BPM=139.6; BEAT=60/BPM
L=json.load(open('cut40/lines.json'))['c40'][2]
d=[sf.info(f'cut40/vo/vo_c40_{i}.wav').duration for i in range(len(L))]
LEAD=0.4
gap=[0.7,0.6,1.4,4.0,4.2,0.9,0.9]              # after each line; Wellington and Manila get room for their screens
c=[LEAD]
for i in range(1,len(L)): c.append(c[-1]+d[i-1]+gap[i-1])
tail=TARGET-(c[-1]+d[-1]); assert tail>=1.5, f'tail {tail:.2f} too short'
T=json.load(open('timing.json'))
M=lambda k,i,off=0: T[k]['win'][0]+T[k]['starts'][i]+off
W=lambda k,off: T[k]['win'][0]+off
snap=lambda t: round(round(t/BEAT)*BEAT,4)      # every cut lands on a beat
plan=[]                                          # (cut start, master from, master to); ends are the next start
def shot(t,m0,m1,src='film'): plan.append([t,src,m0,m1])
# A hook, then the title card
shot(0,W('s01',0.5),W('s01',4.4)); shot(c[1]-1.9,W('s01',6.4),W('s01',8.5))
# B the engine: build-up, then the tagline frame
shot(c[1],W('s02',2.6),M('s02',3,4.6)); shot(c[2]+d[2]*0.55,M('s02',5,-0.1),M('s02',5,3.8))
# C Wellington: feature page, the two questions accepted, story cards, the board (master order, so the clock runs forward)
w=(c[4]-c[3])/4
shot(c[3],W('s04',4.4),M('s04',1,1.8)); shot(c[3]+w,M('s05',3,0.4),M('s05',3,3.8))
shot(c[3]+2*w,W('s06',0.2),W('s06',4.2)); shot(c[3]+3*w,M('s06',4,3.2),M('s06',4,7.2))
# C Manila: six hours later, the ticket, the gate (block then green), the PR approved
m=c[5]-c[4]; six=1.75; rest=m-six; tk,gt=rest*0.28,rest*0.37
shot(c[4],W('s07',0.3),W('s07',2.2)); shot(c[4]+six,W('s08',5.4),W('s08',8.8))
shot(c[4]+six+tk,M('s08',4,1.6),M('s08',4,6.6)); shot(c[4]+six+tk+gt,M('s08',4,6.6) if False else M('s09',1,0.6),M('s09',1,5.9))
# D what it has delivered
shot(c[5],M('s10',1,-0.2),M('s10',1,5.6))
shot(c[6],M('s10',3,0.0),M('s10',3,1.85)); shot(c[6]+(c[7]-c[6])*0.45,M('s10',5,0.1),M('s10',5,4.6))
# E line and logos
shot(c[7],0,0,'end')
starts=[snap(p[0]) for p in plan]; starts[0]=0.0
segs=[[starts[i], starts[i+1] if i+1<len(plan) else TARGET, plan[i][1], plan[i][2], plan[i][3]] for i in range(len(plan))]
for s in segs: assert s[1]-s[0]>=1.3, ('shot too short',s)
dl=d[7]; beats=[0.05,dl*0.36,dl*0.70]
endcard_start=segs[-1][0]; vo_tag_off=c[7]-endcard_start
json.dump({'total':TARGET,'cues':c,'durs':d,'segs':segs,'beats':[b+vo_tag_off for b in beats],'endDur':TARGET-endcard_start,'beat':BEAT},open('cut40/map.json','w'),indent=1)
print('cues',[round(x,2) for x in c],'tail',round(tail,2))
for s in segs:
    sp=(s[4]-s[3])/(s[1]-s[0]) if s[2]=='film' else 0
    print(f'{s[0]:6.2f}-{s[1]:6.2f} ({s[1]-s[0]:4.2f}s, {(s[1]-s[0])/BEAT:4.1f} beats) {s[2]:4s} master {s[3]:7.2f}-{s[4]:7.2f}  x{sp:.2f}')
