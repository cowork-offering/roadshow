# 60 s cut, setup and benefits. Half one (dark): hook, the three bodies of IP, the engine diagram, why it
# works. Half two (light): the figures, what the 3x is made of, four statements, 13 of 13, the close.
# Then the team card. Cuts snap to the music's beat grid; every shot holds long enough to read.
import json, sys, subprocess, soundfile as sf
MAIN=60.5; TEAM=5.0; BPM=139.6; BEAT=60/BPM; LEAD=0.3; TAIL=1.4
L=json.load(open('short60/lines.json'))['h60'][2]
gap=[0.5,0.3,0.3,0.3,0.8,1.9,0.8,0.6,0.5,2.3]   # after each line; room for the diagram, the tagline, the half break, 13 of 13
raw=[sf.info(f'short60/vo/vo_h60_{i}.wav').duration for i in range(len(L))]
fac=sum(raw)/(MAIN-LEAD-TAIL-sum(gap))
if '--apply' in sys.argv:
    assert 0.95<=fac<=1.15, f'speed {fac:.3f} out of range: trim words or gaps'
    for i in range(len(L)):
        f=f'short60/vo/vo_h60_{i}.wav'
        subprocess.run(['ffmpeg','-v','error','-y','-i',f,'-af',f'atempo={fac:.4f}','-ar','24000',f+'.tmp.wav'],check=True)
        subprocess.run(['mv',f+'.tmp.wav',f])
    print('voice speed x',round(fac,3))
else: print('would need speed x',round(fac,3)); 
d=[sf.info(f'short60/vo/vo_h60_{i}.wav').duration for i in range(len(L))]
c=[LEAD]
for i in range(1,len(L)): c.append(c[-1]+d[i-1]+gap[i-1])
endc=c[10]; main_end=endc+d[10]+TAIL; total=main_end+TEAM
T=json.load(open('timing.json'))
M=lambda k,i,off=0: T[k]['win'][0]+T[k]['starts'][i]+off
W=lambda k,off: T[k]['win'][0]+off
P=[]   # [start, src, m0, m1, group, overlay]; each ends where the next starts
def shot(t,src,m0,m1,g,ov=None): P.append([t,src,m0,m1,g,ov])
# A hook, then the title card
shot(0,'film',W('s01',0.5),W('s01',4.4),0); shot(c[1]-2.2,'film',W('s01',6.4),W('s01',8.6),1)
# B the three bodies of IP: page-local time, panels on their lines, convergence, then cut to the diagram
cutB=c[4]+min(d[4]*0.6,2.6)
shot(c[1],'ip',0,cutB-c[1],2)
ip={'title':0.15,'p1':c[2]-c[1],'p2':c[3]-c[1],'p3':c[4]-c[1],'conv':c[4]-c[1]+0.95}
# C the engine diagram: the MCP lines draw on "at every step", the checkpoints light, the tagline frame
shot(cutB,'film',M('s02',2,-0.2),M('s02',2,2.8),3)
shot(c[5],'film',M('s02',3,-0.2),M('s02',3,3.9),3,{'text':'TWO HUMAN CHECKPOINTS · DISCOVERY · CODE','y':1000,'color':'#C9A8FF','size':17,'delay':0.3})
shot(c[5]+d[5]-0.15,'film',M('s02',5,-0.15),M('s02',5,2.0),3)
# D why it works: partner card
shot(c[6],'partner',0,c[7]-c[6],4)
partner={'head':0.3,'roles':d[6]*0.62}
# E-H what it has delivered (master closing scene)
plan='The bank plans on a 30 to 40 percent gain on design, build and unit test only. The measured uplift is the evidence, not the commitment.'
shot(c[7],'film',M('s10',1,-0.3),M('s10',1,6.0),5,{'text':plan,'y':860,'color':'#5E5A52','size':21,'ls':0,'font':'G','delay':2.0})
shot(c[8],'film',M('s10',2,-0.1),M('s10',2,7.6),6)
shot(c[9],'film',M('s10',3,-0.1),M('s10',4,4.2),7)
shot(c[9]+d[9]+0.05,'film',M('s10',5,0.1),M('s10',5,3.8),8)
# I the close, then J the team card (arrival, then the hold into the fade)
shot(endc,'end',0,main_end-endc,9)
shot(main_end,'film',W('s12',0.2),W('s12',3.0),10); shot(main_end+2.2,'film',W('s12',11.0),W('s12',14.0),10)
snap=lambda t: round(round(t/BEAT)*BEAT,4)
st=[0.0]+[snap(p[0]) for p in P[1:]]; total=snap(total)
segs=[[st[i], st[i+1] if i+1<len(P) else total, P[i][1], P[i][2], P[i][3], P[i][4]]+([P[i][5]] if P[i][5] else []) for i in range(len(P))]
# page-local sources run on cut time from their own start
for s in segs:
    if s[2] in ('ip','partner','end'): s[3]=0.0; s[4]=s[1]-s[0]
for s in segs: assert s[1]-s[0]>=1.8, ('shot too short',s)
e0=[s for s in segs if s[2]=='end'][0][0]; dl=d[10]
beats=[endc-e0+0.05, endc-e0+dl*0.36, endc-e0+dl*0.70]
ip={k:v+(c[1]-[s for s in segs if s[2]=='ip'][0][0]) for k,v in ip.items()}
json.dump({'total':total,'main_end':main_end,'cues':c,'durs':d,'segs':segs,'ip':ip,'partner':partner,'beats':beats,'endDur':[s for s in segs if s[2]=='end'][0][1]-e0},open('short60/map.json','w'),indent=1)
print(f'total {total:.2f} s (main {main_end:.2f}, team {total-main_end:.2f}) | cues',[round(x,2) for x in c])
for s in segs:
    sp=(s[4]-s[3])/(s[1]-s[0])
    print(f'{s[0]:6.2f}-{s[1]:6.2f} ({s[1]-s[0]:4.2f}s) {s[2]:7s} {s[3]:7.2f}-{s[4]:7.2f} x{sp:.2f} g{s[5]}'+(' +caption' if len(s)>6 else ''))
