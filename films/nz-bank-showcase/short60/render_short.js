// 60 s cut: each frame comes from the master (film.html at a remapped time) or one of the cut's own pages
// (ip, partner, end). One eased camera push per shot group; optional overlay captions on master shots.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const fs=require('fs'),path=require('path'),{spawn}=require('child_process');
const TM=JSON.parse(fs.readFileSync('timing.json')); const MAP=JSON.parse(fs.readFileSync('short60/map.json'));
const mode=process.argv[2]||'full';
(async()=>{
  const b=await chromium.launch(); const P={};
  const open=async(name,file)=>{ const p=await b.newPage({viewport:{width:1920,height:1080}}); await p.goto('file://'+path.resolve(file)); await p.evaluate(()=>document.fonts.ready); P[name]=p; };
  await open('film','film.html'); await open('ip','short60/ip.html'); await open('partner','short60/partner.html'); await open('end','short60/endcard.html');
  await P.film.evaluate(x=>{ setTM(x); render(0);
    const h=document.querySelector('#s12 [data-fx="type"]');                       // team card heading for this cut
    h._segs=[{t:'Talk to the people who ',em:false},{t:'built',em:true},{t:' the solution',em:false}];
    h._len=h._segs.reduce((a,s)=>a+s.t.length,0); h._k=null;
    const sub=document.querySelector('#s01 .sub[data-fx="type"]');                  // title card: where it is proven
    sub._segs=[{t:'Proven',em:true},{t:', live, at a New Zealand bank.',em:false}];
    sub._len=sub._segs.reduce((a,s)=>a+s.t.length,0); sub._k=null;
    document.querySelector('#s02 [data-in="5:1.2"]').style.display='none';         // partner sub-line: said by the next card
    const o=document.createElement('div'); o.id='ovl'; o.style.cssText='position:absolute;left:0;width:1920px;text-align:center;font-family:GM;letter-spacing:3px;opacity:0;z-index:60';
    document.body.appendChild(o); },TM);
  await P.ip.evaluate(c=>setup(c),MAP.ip); await P.partner.evaluate(c=>setup(c),MAP.partner);
  await P.end.evaluate(m=>setBeats(m.beats,m.endDur,false),MAP);
  await P.film.waitForTimeout(300);
  const G={}; for(const s of MAP.segs){ const g=s[5]; G[g]=G[g]?[Math.min(G[g][0],s[0]),Math.max(G[g][1],s[1])]:[s[0],s[1]]; }
  const fps=24, N=Math.round(MAP.total*fps);
  const shot=async(t)=>{
    const s=MAP.segs.find(s=>t>=s[0]&&t<s[1])||MAP.segs[MAP.segs.length-1];
    const u=(t-s[0])/(s[1]-s[0]), m=s[3]+(s[4]-s[3])*u, [g0,g1]=G[s[5]], ug=Math.min(1,Math.max(0,(t-g0)/(g1-g0)));
    const pg=P[s[2]];
    await pg.evaluate(x=>{ render(x.m);
      const e=x.ug<.5?4*x.ug*x.ug*x.ug:1-Math.pow(-2*x.ug+2,3)/2;
      if(x.src!=='end'){ const o=['50% 45%','38% 50%','62% 50%','50% 60%'][x.k%4], dr=[[-1,0],[1,0],[0,-1],[0,1]][x.k%4];
        document.body.style.transformOrigin=o; document.body.style.transform=`translate(${(dr[0]*16*e).toFixed(2)}px,${(dr[1]*10*e).toFixed(2)}px) scale(${(1+0.035*e).toFixed(5)})`; }
      const ov=document.getElementById('ovl');
      if(ov){ if(x.ovl){ ov.textContent=x.ovl.text; ov.style.top=x.ovl.y+'px'; ov.style.fontSize=(x.ovl.size||18)+'px'; ov.style.color=x.ovl.color; ov.style.letterSpacing=(x.ovl.ls!=null?x.ovl.ls:3)+'px'; ov.style.fontFamily=x.ovl.font||'GM';
          const f=Math.min(1,Math.max(0,(x.t-x.s0-(x.ovl.delay||0))/0.45)); ov.style.opacity=1-Math.pow(1-f,3); } else ov.style.opacity=0; }
    },{m,ug,k:s[5],src:s[2],ovl:s[6]||null,t,s0:s[0]});
    return pg; };
  if(mode==='test'){ fs.mkdirSync('short60/test',{recursive:true});
    for(const t of process.argv.slice(3).map(Number)){ const pg=await shot(t); await pg.screenshot({path:`short60/test/t_${t}.png`}); } }
  else {
    const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate',String(fps),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-r',String(fps),'short60/picture.mp4'],{stdio:['pipe','inherit','inherit']});
    for(let i=0;i<N;i++){ const pg=await shot(i/fps); const buf=await pg.screenshot({type:'jpeg',quality:94});
      if(!ff.stdin.write(buf)) await new Promise(r=>ff.stdin.once('drain',r)); if(i%240===0) console.log('frame',i,'/',N); }
    ff.stdin.end(); await new Promise(r=>ff.on('close',r)); }
  await b.close();
})();
