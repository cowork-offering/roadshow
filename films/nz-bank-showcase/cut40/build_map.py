# Build the 40 s cut: narration cue times from the measured lines, and a shot map that points each
# stretch of the cut at a stretch of the master (timing.json), with every boundary on a narration cue.
import json, soundfile as sf
L=json.load(open('cut40/lines.json'))['c40'][2]
d=[sf.info(f'cut40/vo/vo_c40_{i}.wav').duration for i in range(len(L))]
gap_after=[0.45,0.3,0.4,0.25,0.45,0.3,0.4,0]          # beats after the hook, before "One month in", before the tagline
c=[0.3]
for i in range(1,len(L)): c.append(c[-1]+d[i-1]+gap_after[i-1])
end_vo=c[-1]+d[-1]; total=round(end_vo+1.1,3)
T=json.load(open('timing.json'))
M=lambda k,i,off=0: T[k]['win'][0]+T[k]['starts'][i]+off      # master time of sentence i of scene k, plus offset
W=lambda k,off: T[k]['win'][0]+off                               # master time at a local offset in scene k
segs=[]
def seg(a,b,src,m0,m1): segs.append([round(a,4),round(b,4),src,round(m0,3),round(m1,3)])
# A hook: the question typed, then the title card
a0,a1=0,c[1]; split=a0+(a1-a0)*0.68
seg(a0,split,'film',W('s01',0.5),W('s01',4.3)); seg(split,a1,'film',W('s01',6.4),W('s01',8.4))
# B how we run it: the diagram builds (lines 1-2), then the tagline frame
b_split=c[2]+d[2]*0.55
seg(c[1],b_split,'film',W('s02',0.3),M('s02',3,4.8)); seg(b_split,c[3],'film',M('s02',5,-0.1),M('s02',5,3.4))
# C one day, two time zones
s3=(c[4]-c[3])/3
seg(c[3],c[3]+s3,'film',W('s04',3.0),M('s04',1,1.2))
seg(c[3]+s3,c[3]+2*s3,'film',M('s05',1,-0.1),M('s05',3,3.0))
seg(c[3]+2*s3,c[4],'film',M('s06',4,3.3),M('s06',4,7.0))
rest=c[5]-c[4]-0.7-2.0
seg(c[4],c[4]+0.7,'film',W('s07',0.3),W('s07',2.0))
seg(c[4]+0.7,c[4]+0.7+rest/2,'film',W('s08',5.3),W('s08',9.0))
seg(c[4]+0.7+rest/2,c[4]+2.7+rest/2,'film',M('s08',4,2.0),M('s08',4,6.8))      # the gate: block, then green, 2 s
seg(c[4]+2.7+rest/2,c[5],'film',M('s09',1,-0.1),M('s09',1,5.6))
# D what it has delivered
seg(c[5],c[6],'film',M('s10',1,-0.2),M('s10',1,5.0))
h=c[6]+d[6]*0.42
seg(c[6],h,'film',M('s10',3,0.0),M('s10',3,1.8))
seg(h,c[7],'film',M('s10',5,0.1),M('s10',5,4.0))
# E line and logos
seg(c[7],total,'end',0,0)
beats=[0.0+0.05,1.05,2.1]
# tagline beats follow the spoken tagline: three phrases spread over its measured length
dl=d[7]; beats=[0.05,dl*0.36,dl*0.70]
json.dump({'total':total,'cues':c,'durs':d,'segs':segs,'beats':beats,'endDur':total-c[7]},open('cut40/map.json','w'),indent=1)
print('total',total,'s | cues',[round(x,2) for x in c])
for s in segs: print(f'{s[0]:6.2f}-{s[1]:6.2f}  {s[2]:4s} master {s[3]:7.2f}-{s[4]:7.2f}  x{(s[4]-s[3])/max(1e-6,s[1]-s[0]):.2f}')
