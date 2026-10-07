// 40 s cut: every frame is the master (film.html) at a remapped master time, or the end card.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const fs=require('fs'),path=require('path'),{spawn}=require('child_process');
const TM=JSON.parse(fs.readFileSync('timing.json')); const MAP=JSON.parse(fs.readFileSync('cut40/map.json'));
const mode=process.argv[2]||'full';
(async()=>{
  const b=await chromium.launch();
  const film=await b.newPage({viewport:{width:1920,height:1080}}); await film.goto('file://'+path.resolve('film.html'));
  await film.evaluate(x=>setTM(x),TM); await film.evaluate(()=>document.fonts.ready);
  const end=await b.newPage({viewport:{width:1920,height:1080}}); await end.goto('file://'+path.resolve('cut40/endcard.html'));
  await end.evaluate(m=>setBeats(m.beats,m.endDur),MAP); await end.evaluate(()=>document.fonts.ready);
  await film.waitForTimeout(300);
  const fps=24, N=Math.round(MAP.total*fps);
  const shot=async(t)=>{ const s=MAP.segs.find(s=>t>=s[0]&&t<s[1])||MAP.segs[MAP.segs.length-1];
    if(s[2]==='end'){ await end.evaluate(x=>render(x),t-s[0]); return end; }
    const u=(t-s[0])/(s[1]-s[0]); const k=MAP.segs.indexOf(s);
    await film.evaluate(x=>{ render(x.mt);
      // hypevideo living camera: one eased push per shot, origin alternating, never reversed
      const e=x.u<.5?4*x.u*x.u*x.u:1-Math.pow(-2*x.u+2,3)/2, o=['50% 45%','38% 50%','62% 50%','50% 60%'][x.k%4];
      const dr=[[-1,0],[1,0],[0,-1],[0,1]][x.k%4];
      document.body.style.transformOrigin=o; document.body.style.transform=`translate(${(dr[0]*16*e).toFixed(2)}px,${(dr[1]*10*e).toFixed(2)}px) scale(${(1+0.035*e).toFixed(5)})`; },
      {mt:s[3]+(s[4]-s[3])*u,u,k}); return film; };
  if(mode==='test'){ fs.mkdirSync('cut40/test',{recursive:true});
    for(const t of process.argv.slice(3).map(Number)){ const pg=await shot(t); await pg.screenshot({path:`cut40/test/t_${t}.png`}); } }
  else {
    const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate',String(fps),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-r',String(fps),'cut40/picture.mp4'],{stdio:['pipe','inherit','inherit']});
    for(let i=0;i<N;i++){ const pg=await shot(i/fps); const buf=await pg.screenshot({type:'jpeg',quality:94});
      if(!ff.stdin.write(buf)) await new Promise(r=>ff.stdin.once('drain',r)); if(i%240===0) console.log('frame',i,'/',N); }
    ff.stdin.end(); await new Promise(r=>ff.on('close',r)); }
  await b.close();
})();
