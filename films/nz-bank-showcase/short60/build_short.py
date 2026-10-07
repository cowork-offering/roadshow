# Short cut, setup and benefits, up to 1:10. Half one (dark): hook, the claim that it is proven at a New Zealand
# bank, the three bodies of IP, the engine diagram, why it works. Half two (light): the figures, what the 3x is
# made of, four statements, 13 of 13 and the packaged asset, the close. Then the team card.
# Every line is voiced in full; the voice is sped uniformly to fit, and every shot holds long enough to read.
# Cuts snap to the music's beat grid. Shots marked 'cont' continue the previous shot (same master, no visual
# cut), so they are neither snapped nor held to the minimum length.
import json, sys, subprocess, soundfile as sf
TOTAL=70.6; TEAM=4.5; BPM=139.6; BEAT=60/BPM; LEAD=0.3; TAIL=1.2
L=json.load(open('short60/lines.json'))['h60'][2]; n=len(L)
# after each line: hook, proven, 3 IP lines, MCP, checkpoints (tagline frame), partner (half break), figures,
# 3x, four statements, packaged asset
gap=[0.45,0.55,0.3,0.3,0.3,0.7,1.5,0.7,0.55,0.5,0.55,0.6]
assert len(gap)==n-1
SPF='short60/vo/speed.json'; spd=json.load(open(SPF))        # speed already applied to each take
f=lambda i: f'short60/vo/vo_h60_{i}.wav'
nat=[sf.info(f(i)).duration*spd[str(i)] for i in range(n)]
fac=sum(nat)/(TOTAL-TEAM-LEAD-TAIL-sum(gap))
if '--apply' in sys.argv:
    assert 0.95<=fac<=1.22, f'speed {fac:.3f} out of range: trim gaps'
    for i in range(n):
        r=fac/spd[str(i)]
        if abs(r-1)<1e-3: continue
        subprocess.run(['ffmpeg','-v','error','-y','-i',f(i),'-af',f'atempo={r:.4f}','-ar','24000',f(i)+'.tmp.wav'],check=True)
        subprocess.run(['mv',f(i)+'.tmp.wav',f(i)]); spd[str(i)]=round(fac,4)
    json.dump(spd,open(SPF,'w'),indent=1); print('voice speed x',round(fac,3))
else: print('voice speed needed x',round(fac,3),'| applied',sorted(set(spd.values())))
d=[sf.info(f(i)).duration for i in range(n)]
c=[LEAD]
for i in range(1,n): c.append(c[-1]+d[i-1]+gap[i-1])
endc=c[12]; main_end=endc+d[12]+TAIL; total=main_end+TEAM
T=json.load(open('timing.json'))
M=lambda k,i,off=0: T[k]['win'][0]+T[k]['starts'][i]+off
W=lambda k,off: T[k]['win'][0]+off
P=[]   # [start, src, m0, m1, group, overlay, cont]; each ends where the next starts
def shot(t,src,m0,m1,g,ov=None,cont=False): P.append([t,src,m0,m1,g,ov,cont])
snap=lambda t: round(round(t/BEAT)*BEAT,4)
def pw(src,anchors,g,ov=None):   # one visual shot as a continuous piecewise map of (cut time, master time) anchors
    anchors=[(snap(anchors[0][0]),anchors[0][1])]+anchors[1:]; assert anchors[1][0]-anchors[0][0]>=0.3, anchors[:2]
    for j in range(len(anchors)-1): shot(anchors[j][0],src,anchors[j][1],anchors[j+1][1],g,ov if j==0 else None,cont=j>0)
# A hook, held at its own pace for the whole question
tT=c[1]-0.25
shot(0,'film',W('s01',0.5),W('s01',min(6.2,0.5+tT)),0)
# B title card: 'AI in Delivery' types, holds, and the proof line types as the voice says "It's proven"
tP=c[1]+d[1]*4.22/7.39-0.1
pw('film',[(tT,W('s01',6.25)),(tT+0.85,W('s01',7.1)),(tP,W('s01',7.12)),(tP+1.6,W('s01',8.72)),(c[2]-0.15,W('s01',9.3))],1)
# C the three bodies of IP: page-local time, panels on their lines, convergence, then cut to the diagram
cutB=c[5]+min(d[5]*0.6,2.6)
shot(c[2]-0.15,'ip',0,0,2)
ip={'title':0.15,'p1':c[3]-c[2],'p2':c[4]-c[2],'p3':c[5]-c[2],'conv':c[5]-c[2]+0.95}
# D the engine diagram: the MCP lines draw on "at every step", the checkpoints light, the tagline frame
shot(cutB,'film',M('s02',2,-0.2),M('s02',2,2.8),3)
shot(c[6],'film',M('s02',3,-0.2),M('s02',3,3.9),3,{'text':'TWO HUMAN CHECKPOINTS · DISCOVERY · CODE','y':1000,'color':'#C9A8FF','size':17,'delay':0.3})
shot(c[6]+d[6]-0.7,'film',M('s02',5,-0.15),M('s02',5,2.0),3)
# E why it works: partner card
shot(c[7],'partner',0,0,4)
partner={'head':0.3,'roles':d[7]*0.62}
# F-I what it has delivered (master closing scene); 13 of 13 carries the packaged-asset line
plan='The bank plans on a 30 to 40 percent gain on design, build and unit test only. The measured uplift is the evidence, not the commitment.'
shot(c[8],'film',M('s10',1,-0.3),M('s10',1,min(6.0,-0.3+1.1*(c[9]-c[8]))),5,{'text':plan,'y':860,'color':'#5E5A52','size':21,'ls':0,'font':'G','delay':2.0})
# halves pop on "twice" and "bug backlog"; the long paragraph (2:4.2) is left out rather than flashed
pw('film',[(c[9]-0.15,M('s10',2,-0.1)),(c[9]+0.45,M('s10',2,0.25)),(c[9]+1.85,M('s10',2,0.35)),(c[9]+3.25,M('s10',2,2.55)),(c[10]-0.15,M('s10',2,4.0))],6)
# cards 1 and 2 on "Nothing carried forward", 3 on "One standard", 4 on "Built on"
pw('film',[(c[10]-0.15,M('s10',3,-0.1)),(c[10]+1.3,M('s10',3,2.3)),(c[10]+1.55,M('s10',4,-0.15)),(c[10]+3.55,M('s10',4,2.05)),(c[11]-0.2,M('s10',4,2.05+c[11]-0.2-c[10]-3.55))],7)
# 13 of 13 types at its own pace, then holds; the planning paragraph (5:3.4) is left out rather than flashed
t13=c[11]-0.2
pw('film',[(t13,M('s10',5,0.1)),(t13+3.0,M('s10',5,3.1)),(endc,M('s10',5,3.3))],8)
# J the close, then K the team card (arrival, then the hold into the fade)
shot(endc,'end',0,0,9)
shot(main_end,'film',W('s12',0.2),W('s12',3.0),10); shot(main_end+2.2,'film',W('s12',11.0),W('s12',14.0),10)
st=[0.0]+[p[0] if p[6] else snap(p[0]) for p in P[1:]]; total=round(int(total/BEAT)*BEAT,4)
segs=[[st[i], st[i+1] if i+1<len(P) else total, P[i][1], P[i][2], P[i][3], P[i][4]]+([P[i][5]] if P[i][5] else []) for i in range(len(P))]
# page-local sources run on cut time from their own start
for s in segs:
    if s[2] in ('ip','partner','end'): s[3]=0.0; s[4]=s[1]-s[0]
for i,s in enumerate(segs):
    nxt_cont=i+1<len(P) and P[i+1][6]
    if not P[i][6] and not nxt_cont: assert s[1]-s[0]>=1.8, ('shot too short',s)
e0=[s for s in segs if s[2]=='end'][0][0]; dl=d[12]
beats=[endc-e0+0.05, endc-e0+dl*0.36, endc-e0+dl*0.70]
ip={k:v+(c[2]-[s for s in segs if s[2]=='ip'][0][0]) for k,v in ip.items()}
json.dump({'total':total,'main_end':main_end,'cues':c,'durs':d,'segs':segs,'ip':ip,'partner':partner,'beats':beats,'endDur':[s for s in segs if s[2]=='end'][0][1]-e0},open('short60/map.json','w'),indent=1)
print(f'total {total:.2f} s (main {main_end:.2f}, team {total-main_end:.2f}) | cues',[round(x,2) for x in c])
for s in segs:
    sp=(s[4]-s[3])/(s[1]-s[0])
    print(f'{s[0]:6.2f}-{s[1]:6.2f} ({s[1]-s[0]:4.2f}s) {s[2]:7s} {s[3]:7.2f}-{s[4]:7.2f} x{sp:.2f} g{s[5]}'+(' +caption' if len(s)>6 else ''))
