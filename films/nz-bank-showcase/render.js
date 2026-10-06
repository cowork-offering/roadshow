const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const fs=require('fs'),path=require('path'),{spawn}=require('child_process');
const TM=JSON.parse(fs.readFileSync('timing.json'));
const mode=process.argv[2]; // 'test' times... | 'full' fps
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1920,height:1080}});
  await p.goto('file://'+path.resolve('film.html')); await p.evaluate(x=>setTM(x),TM);
  await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(300);
  if(mode==='test'){
    fs.mkdirSync('test',{recursive:true});
    for(const t of process.argv.slice(3).map(Number)){ await p.evaluate(t=>render(t),t); await p.screenshot({path:`test/t_${t}.png`}); }
  } else {
    const fps=24, N=Math.round(270*fps);
    const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate',String(fps),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-r',String(fps),'picture.mp4'],{stdio:['pipe','inherit','inherit']});
    for(let i=0;i<N;i++){ await p.evaluate(t=>render(t),i/fps); const buf=await p.screenshot({type:'jpeg',quality:94});
      if(!ff.stdin.write(buf)) await new Promise(r=>ff.stdin.once('drain',r)); if(i%240===0) console.log('frame',i,'/',N); }
    ff.stdin.end(); await new Promise(r=>ff.on('close',r));
  }
  await b.close();
})();
