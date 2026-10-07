# Short cut (50 s): narration cues from the measured lines, and a shot map pointing each stretch of the cut
# at a moment in the master (timing.json). Every boundary sits on a narration cue; UI shots show the moment
# that matters at close to real speed rather than racing through a long stretch.
import json, sys, subprocess, soundfile as sf
TARGET=50.0
L=json.load(open('cut40/lines.json'))['c40'][2]
LEAD,TAIL=0.3,1.4
gap_after=[0.6,0.4,0.8,1.0,1.5,0.5,0.6,0]     # breath after the hook; room for the Wellington and Manila screens
raw=[sf.info(f'cut40/vo/vo_c40_{i}.wav').duration for i in range(len(L))]
budget=TARGET-LEAD-TAIL-sum(gap_after); fac=sum(raw)/budget
if '--apply' in sys.argv:   # one gentle, pitch-preserved speed change to land on the target length
    for i in range(len(L)):
        f=f'cut40/vo/vo_c40_{i}.wav'
        subprocess.run(['ffmpeg','-v','error','-y','-i',f,'-af',f'atempo={fac:.4f}','-ar','24000',f+'.tmp.wav'],check=True)
        subprocess.run(['mv',f+'.tmp.wav',f])
    print('voice speed x',round(fac,3))
d=[sf.info(f'cut40/vo/vo_c40_{i}.wav').duration for i in range(len(L))]
c=[LEAD]
for i in range(1,len(L)): c.append(c[-1]+d[i-1]+gap_after[i-1])
total=round(c[-1]+d[-1]+TAIL,3)
T=json.load(open('timing.json'))
M=lambda k,i,off=0: T[k]['win'][0]+T[k]['starts'][i]+off
W=lambda k,off: T[k]['win'][0]+off
segs=[]
def seg(a,b,src,m0,m1): segs.append([round(a,4),round(b,4),src,round(m0,3),round(m1,3)])
# A hook, then the title card
split=c[1]*0.66
seg(0,split,'film',W('s01',0.5),W('s01',4.3)); seg(split,c[1],'film',W('s01',6.4),W('s01',8.6))
# B how we run it: the diagram builds, then the tagline frame
b=c[2]+d[2]*0.45
seg(c[1],b,'film',W('s02',0.3),M('s02',3,4.8)); seg(b,c[3],'film',M('s02',5,-0.1),M('s02',5,3.6))
# C morning in Wellington: feature page, the two questions accepted, the board
s3=(c[4]-c[3])/3
seg(c[3],c[3]+s3,'film',W('s04',2.6),M('s04',1,1.4))
seg(c[3]+s3,c[3]+2*s3,'film',M('s05',3,0.4),M('s05',3,3.6))
seg(c[3]+2*s3,c[4],'film',M('s06',4,3.2),M('s06',4,7.0))
# C afternoon in Manila: six hours later, the ticket, the gate (block then green), the PR
span=c[5]-c[4]; six,gate=0.9,2.2; rest=span-six-gate; tk=rest*0.5
seg(c[4],c[4]+six,'film',W('s07',0.3),W('s07',2.1))
seg(c[4]+six,c[4]+six+tk,'film',W('s08',6.0),W('s08',8.6))
seg(c[4]+six+tk,c[4]+six+tk+gate,'film',M('s08',4,2.0),M('s08',4,6.8))
seg(c[4]+six+tk+gate,c[5],'film',M('s09',1,0.8),M('s09',1,5.8))
# D what it has delivered: the figures, nothing carried forward, 13 of 13
seg(c[5],c[6],'film',M('s10',1,-0.2),M('s10',1,5.2))
h=c[6]+(c[7]-c[6])*0.42
seg(c[6],h,'film',M('s10',3,0.0),M('s10',3,1.85))
seg(h,c[7],'film',M('s10',5,0.1),M('s10',5,4.2))
# E line and logos
seg(c[7],total,'end',0,0)
dl=d[7]; beats=[0.05,dl*0.36,dl*0.70]
json.dump({'total':total,'cues':c,'durs':d,'segs':segs,'beats':beats,'endDur':total-c[7]},open('cut40/map.json','w'),indent=1)
print('total',total,'s | cues',[round(x,2) for x in c])
for s in segs: print(f'{s[0]:6.2f}-{s[1]:6.2f} ({s[1]-s[0]:4.2f}s) {s[2]:4s} master {s[3]:7.2f}-{s[4]:7.2f}  x{(s[4]-s[3])/max(1e-6,s[1]-s[0]):.2f}')
