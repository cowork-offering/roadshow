/* ============================================================================
   Roadshow Concierge — custom voice + chat widget (summit roadshow, all 5 pages)
   Proven concierge widget lineage (v14). Self-contained summit tokens
   (dark register + [data-theme=light] override), Graphik. ElevenLabs client SDK.
   Voice = Jessica. Agent knows all four solutions + the hub, site-agnostic.
   Launcher = Accenture-mark pill chip. Voice stage = DNA helix. Reversible.
   ========================================================================== */
/* The ElevenLabs SDK is self-hosted at ./vendor/elevenlabs-client.js (v1.11.2, MIT) so the booth
   never depends on CDN egress at the venue. It is loaded LAZILY via dynamic import: a missing or
   broken bundle can no longer take the whole widget down (a static import would). loadSDK() memoizes
   both success and failure; if it fails, the launcher still renders and the panel shows a
   "voice/chat unavailable, ask booth staff" state, never a dead button. */
const SDK_URL = new URL('./vendor/elevenlabs-client.js', import.meta.url).href;
const AGENT = 'agent_0301kxa0c0ade7atx7350y657m08';
let Conversation=null, sdkFailed=false, _sdkPromise=null;
function loadSDK(){
  if(Conversation) return Promise.resolve(Conversation);
  if(!_sdkPromise) _sdkPromise=import(SDK_URL)
    .then(m=>{ if(!m||!m.Conversation) throw new Error('SDK missing Conversation export'); Conversation=m.Conversation; sdkFailed=false; return Conversation; })
    .catch(e=>{ sdkFailed=true; _sdkPromise=null; throw e; });
  return _sdkPromise;
}

/* Booth teardown hygiene, SCOPED. When a session ends the SDK can call ws.send() on a socket the
   server has already moved to CLOSING; the browser then logs a benign native "WebSocket is already
   in CLOSING or CLOSED state" error. Sending on a non-open socket is a guaranteed no-op, so we skip
   it. Critically this only touches sockets THIS widget created (tagged __bwOwned while bwWiring is
   set around connect/teardown). Every other WebSocket on the page keeps fully native behaviour, so
   the guard is no longer a page-wide, permanent monkey-patch. Installed once, idempotently. */
let bwWiring=false;
if(!WebSocket.__bwSendGuard){
  const NativeWS=WebSocket, _send=NativeWS.prototype.send;
  NativeWS.prototype.send=function(d){ try{ if(this.__bwOwned&&(this.readyState===2||this.readyState===3)) return; }catch(_){} return _send.call(this,d); };
  try{
    const Wrapped=function(url,protocols){ const ws=protocols!==undefined?new NativeWS(url,protocols):new NativeWS(url); if(bwWiring){ try{ ws.__bwOwned=true; }catch(_){} } return ws; };
    Wrapped.prototype=NativeWS.prototype;
    ['CONNECTING','OPEN','CLOSING','CLOSED'].forEach(k=>{ try{ Wrapped[k]=NativeWS[k]; }catch(_){} });
    window.WebSocket=Wrapped;
  }catch(_){ /* if the global can't be replaced, nothing gets tagged → native behaviour everywhere (safe fallback) */ }
  NativeWS.__bwSendGuard=true;
}

/* ----------------------------------------------------------------- styles */
const CSS = `
#bw-bubble,#bw-panel{--sw-font:"Graphik","Hanken Grotesk","Helvetica Neue",Arial,sans-serif;--sw-ink:#F1F1EF;--sw-panel:#141416;--sw-muted:rgba(241,241,239,.62);--sw-accent:#A100FF;--sw-line:rgba(255,255,255,.14)}
html[data-theme="light"] #bw-bubble,html[data-theme="light"] #bw-panel{--sw-ink:#141414;--sw-panel:#FFFFFF;--sw-muted:#5C5C5C;--sw-accent:#A100FF;--sw-line:#E4E3E0}
#bw-bubble{position:fixed;z-index:70;right:clamp(20px,4vw,40px);bottom:clamp(20px,4vw,40px);height:50px;
  border-radius:999px;border:1px solid color-mix(in srgb,var(--sw-ink) 11%,transparent);cursor:pointer;display:inline-flex;align-items:center;gap:10px;padding:0 18px 0 15px;
  background:color-mix(in srgb,var(--sw-panel) 80%,transparent);transform-origin:bottom right;
  backdrop-filter:blur(20px) saturate(150%);-webkit-backdrop-filter:blur(20px) saturate(150%);
  box-shadow:0 10px 28px -10px rgba(16,10,30,.42),inset 0 1px 0 color-mix(in srgb,#fff 12%,transparent);
  transition:transform .3s cubic-bezier(.2,.8,.2,1),box-shadow .3s ease,opacity .3s ease}
#bw-bubble:hover{transform:translateY(-2px);box-shadow:0 15px 36px -10px rgba(16,10,30,.5),inset 0 1px 0 color-mix(in srgb,#fff 16%,transparent)}
#bw-bubble .acc{width:17px;height:18px;flex:0 0 auto;display:block}
#bw-bubble .lbl{font:700 11px/1 var(--sw-font);letter-spacing:.13em;text-transform:uppercase;color:var(--sw-muted);white-space:nowrap}
#bw-bubble.gone{opacity:0;transform:scale(.4);pointer-events:none}

#bw-panel{position:fixed;z-index:71;right:clamp(20px,4vw,40px);bottom:clamp(20px,4vw,40px);
  width:min(362px,92vw);max-height:min(76vh,564px);display:flex;flex-direction:column;overflow:hidden;color:var(--sw-ink);
  background:color-mix(in srgb,var(--sw-panel) 86%,transparent);
  backdrop-filter:blur(40px) saturate(160%);-webkit-backdrop-filter:blur(40px) saturate(160%);
  border:1px solid color-mix(in srgb,var(--sw-ink) 9%,transparent);
  box-shadow:0 30px 80px -22px rgba(12,8,24,.5),0 3px 10px rgba(12,8,24,.16),inset 0 1px 0 color-mix(in srgb,#fff 10%,transparent);
  transform-origin:bottom right;border-radius:42px;opacity:0;transform:scale(.18);pointer-events:none;
  transition:opacity .34s ease,transform .52s cubic-bezier(.16,.86,.2,1),border-radius .52s cubic-bezier(.16,.86,.2,1)}
#bw-panel.open{opacity:1;transform:none;border-radius:24px;pointer-events:auto}

.bw-hd{display:flex;align-items:center;gap:11px;padding:15px 16px 13px;border-bottom:1px solid color-mix(in srgb,var(--sw-ink) 7%,transparent)}
.bw-hd .ic{width:30px;height:30px;border-radius:50%;flex:0 0 auto;display:grid;place-items:center;background:color-mix(in srgb,var(--sw-ink) 5%,transparent)}
.bw-hd .ic .acc{width:16px;height:17px;display:block}
.bw-ti{flex:1;min-width:0}.bw-ti b{display:block;font:700 12px/1.35 var(--sw-font);color:var(--sw-ink);letter-spacing:.13em;text-transform:uppercase}
.bw-ti span{display:block;font:500 10.5px/1.3 var(--sw-font);color:var(--sw-muted);letter-spacing:.01em}
.bw-x{flex:0 0 auto;width:28px;height:28px;border-radius:9px;border:0;background:transparent;color:var(--sw-muted);cursor:pointer;display:grid;place-items:center;transition:.18s}
.bw-x:hover{background:color-mix(in srgb,var(--sw-ink) 7%,transparent);color:var(--sw-ink)}.bw-x svg{width:16px;height:16px}

.bw-seg{display:flex;gap:2px;margin:12px 16px 0;padding:3px;border-radius:999px;background:color-mix(in srgb,var(--sw-ink) 5%,transparent)}
.bw-seg button{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:6px;border:0;background:transparent;cursor:pointer;font:600 11.5px/1 var(--sw-font);color:var(--sw-muted);padding:8px 10px;border-radius:999px;transition:.22s}
.bw-seg button svg{width:13px;height:13px}
.bw-seg button.on{background:color-mix(in srgb,var(--sw-panel) 75%,transparent);color:var(--sw-ink);box-shadow:0 1px 3px rgba(0,0,0,.08)}
.bw-seg.hide{display:none}

.bw-stage{padding:20px 16px 13px;border-bottom:1px solid color-mix(in srgb,var(--sw-ink) 6%,transparent);display:flex;flex-direction:column;align-items:center;gap:10px}
.bw-stage canvas{width:100%;height:142px;display:block}
.bw-vstate{font:600 10.5px/1 var(--sw-font);color:var(--sw-muted);letter-spacing:.16em;text-transform:uppercase;min-height:12px}
.bw-ttog{border:0;background:transparent;color:var(--sw-muted);font:600 9.5px/1 var(--sw-font);letter-spacing:.12em;text-transform:uppercase;cursor:pointer;padding:5px 11px;border-radius:999px;opacity:.65;transition:.18s}
.bw-ttog:hover{opacity:1;color:var(--sw-ink);background:color-mix(in srgb,var(--sw-ink) 5%,transparent)}

.bw-body{flex:1;min-height:0;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;scrollbar-width:thin}
.bw-body::-webkit-scrollbar{width:6px}.bw-body::-webkit-scrollbar-thumb{background:color-mix(in srgb,var(--sw-ink) 11%,transparent);border-radius:4px}

.bw-choice{margin:auto 0;display:flex;flex-direction:column;gap:14px;padding:14px 2px;text-align:center}
.bw-choice h4{font:600 15.5px/1.35 var(--sw-font);color:var(--sw-ink);margin:0;letter-spacing:-.015em}
.bw-choice p{font:500 12px/1.5 var(--sw-font);color:var(--sw-muted);margin:0 0 2px}
.bw-opt{display:flex;gap:12px}
.bw-opt button{flex:1;display:flex;flex-direction:column;align-items:center;gap:10px;padding:20px 8px;border-radius:16px;cursor:pointer;
  border:1px solid color-mix(in srgb,var(--sw-ink) 9%,transparent);color:var(--sw-ink);font:600 12.5px/1 var(--sw-font);
  background:color-mix(in srgb,var(--sw-ink) 3%,transparent);transition:transform .25s cubic-bezier(.2,.8,.2,1),border-color .25s,background .25s}
.bw-opt button:hover{border-color:color-mix(in srgb,var(--sw-ink) 18%,transparent);background:color-mix(in srgb,var(--sw-ink) 6%,transparent);transform:translateY(-2px)}
.bw-opt button svg{width:21px;height:21px;color:var(--sw-muted)}
.bw-switch{font:500 11px/1 var(--sw-font);color:var(--sw-muted);opacity:.8}
.bw-fresh{border:0;background:transparent;color:var(--sw-muted);font:500 11px/1 var(--sw-font);cursor:pointer;text-decoration:underline;text-underline-offset:2px;opacity:.85}
.bw-fresh:hover{color:var(--sw-ink)}

.bw-msg{max-width:84%;padding:10px 13px;border-radius:16px;font:450 13px/1.5 var(--sw-font);white-space:pre-wrap;word-break:break-word}
.bw-msg.ai{align-self:flex-start;background:color-mix(in srgb,var(--sw-ink) 5%,transparent);color:var(--sw-ink);border-bottom-left-radius:6px}
.bw-msg.user{align-self:flex-end;color:var(--sw-ink);border-bottom-right-radius:6px;background:color-mix(in srgb,var(--sw-accent) 9%,color-mix(in srgb,var(--sw-ink) 6%,transparent))}
.bw-typing{align-self:flex-start;display:inline-flex;gap:4px;padding:13px 14px}
.bw-typing i{width:6px;height:6px;border-radius:50%;background:var(--sw-muted);opacity:.45;animation:bwdot 1.1s infinite}
.bw-typing i:nth-child(2){animation-delay:.18s}.bw-typing i:nth-child(3){animation-delay:.36s}
@keyframes bwdot{0%,60%,100%{transform:translateY(0);opacity:.35}30%{transform:translateY(-4px);opacity:.8}}

.bw-ft{padding:12px 14px;border-top:1px solid color-mix(in srgb,var(--sw-ink) 7%,transparent);display:flex;align-items:center;gap:9px}
.bw-ft.hide{display:none}
.bw-in{flex:1;min-width:0;border:1px solid color-mix(in srgb,var(--sw-ink) 10%,transparent);background:color-mix(in srgb,var(--sw-ink) 3%,transparent);
  color:var(--sw-ink);font:450 13px/1.4 var(--sw-font);padding:10px 14px;border-radius:13px;outline:none;resize:none;max-height:84px;transition:border-color .2s}
.bw-in::placeholder{color:var(--sw-muted)}.bw-in:focus{border-color:color-mix(in srgb,var(--sw-ink) 24%,transparent)}
.bw-ic{flex:0 0 auto;width:38px;height:38px;border-radius:12px;border:0;cursor:pointer;display:grid;place-items:center;transition:.18s;background:color-mix(in srgb,var(--sw-ink) 6%,transparent);color:var(--sw-muted)}
.bw-ic:hover{color:var(--sw-ink);background:color-mix(in srgb,var(--sw-ink) 12%,transparent)}
.bw-ic.accent{background:color-mix(in srgb,var(--sw-ink) 13%,transparent);color:var(--sw-ink)}
.bw-ic.accent:hover{background:color-mix(in srgb,var(--sw-ink) 20%,transparent)}
.bw-ic.danger:hover{background:color-mix(in srgb,#ff5c7a 70%,transparent);color:#fff}.bw-ic.on{color:var(--sw-ink)}.bw-ic svg{width:17px;height:17px}
.bw-err{font:500 11.5px/1.4 var(--sw-font);color:#ff6b86;text-align:center;padding:0 16px 8px}
.bw-err.info{color:var(--sw-muted)}

/* Reduced motion: no panel scale/slide, no typing-dot bounce, no launcher bob. The DNA/particle
   canvas is not started at all (see showStage) — a static state mark is drawn instead. */
@media (prefers-reduced-motion: reduce){
  #bw-panel{transition:opacity .2s ease;transform:none}
  #bw-panel.open{transform:none}
  #bw-bubble{transition:opacity .3s ease,box-shadow .3s ease}
  #bw-bubble:hover{transform:none}
  #bw-bubble.gone{transform:none}
  #bw-bubble.bw-preveal{transform:none}
  .bw-opt button:hover{transform:none}
  .bw-typing i{animation:none;opacity:.55}
}
`;

const I={ mic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
  micOff:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 9v2a3 3 0 0 0 5 2M15 9.3V5a3 3 0 0 0-6 0M5 11a7 7 0 0 0 11 5.3M12 18v3M3 3l18 18"/></svg>',
  chat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  send:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/></svg>',
  end:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10.7 13.3a11 11 0 0 0 4 2.6l1.6-1.6a1.5 1.5 0 0 1 1.5-.4 9 9 0 0 0 2.4.5 1.5 1.5 0 0 1 1.3 1.5v2a1.5 1.5 0 0 1-1.6 1.5A18 18 0 0 1 3 5.6 1.5 1.5 0 0 1 4.5 4h2a1.5 1.5 0 0 1 1.5 1.3c.05.8.2 1.6.5 2.4a1.5 1.5 0 0 1-.4 1.5z"/><path d="M22 2 2 22" stroke-width="1.6"/></svg>',
  x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>' };
const ACC='<svg class="acc" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5.4 3 L20 12 L5.4 21" stroke="#a100ff" stroke-width="5.2" stroke-linejoin="miter"/></svg>';

/* ----------------------------------------------------------------- dom */
const style=document.createElement('style'); style.id='bw-style'; style.textContent=CSS; document.head.appendChild(style);
const bubble=document.createElement('button'); bubble.id='bw-bubble'; bubble.setAttribute('aria-label','Ask about the roadshow');
bubble.innerHTML=ACC+'<span class="lbl">Ask about the roadshow</span>';
const panel=document.createElement('div'); panel.id='bw-panel';
panel.setAttribute('role','dialog'); panel.setAttribute('aria-modal','true'); panel.setAttribute('aria-labelledby','bw-title'); panel.tabIndex=-1;
panel.innerHTML=`<div class="bw-hd"><div class="ic">${ACC}</div>
  <div class="bw-ti"><b id="bw-title">Roadshow Concierge</b><span>Accenture · nCino Summit</span></div><button class="bw-x" aria-label="Close">${I.x}</button></div>
  <div class="bw-seg hide"><button data-m="voice">${I.mic}<span>Talk</span></button><button data-m="chat">${I.chat}<span>Chat</span></button></div>
  <div class="bw-stage" style="display:none"><canvas></canvas><div class="bw-vstate"></div><button class="bw-ttog">Show transcript</button></div>
  <div class="bw-body"></div><div class="bw-err" style="display:none"></div>
  <div class="bw-ft hide"><button class="bw-ic" data-act="mic" title="Mute mic" style="display:none">${I.mic}</button>
  <textarea class="bw-in" rows="1" placeholder="Ask about the roadshow..."></textarea>
  <button class="bw-ic accent" data-act="send" title="Send">${I.send}</button>
  <button class="bw-ic danger" data-act="end" title="End" style="display:none">${I.end}</button></div>`;
document.body.appendChild(bubble); document.body.appendChild(panel);
const $=s=>panel.querySelector(s);
const body=$('.bw-body'),seg=$('.bw-seg'),ft=$('.bw-ft'),input=$('.bw-in'),errEl=$('.bw-err'),ttog=$('.bw-ttog');
const micBtn=$('[data-act=mic]'),sendBtn=$('[data-act=send]'),endBtn=$('[data-act=end]');

/* ----------------------------------------------------------------- particle glow (muted; DNA a touch richer) */
let drv=0; const SPEC_N=30; const spec=new Float32Array(SPEC_N);  // spec = per-band levels for the wave peaks
function isLight(){ return document.documentElement.getAttribute('data-theme')==='light'; }
const PAL={ violet:[156,96,222], lavlt:[210,202,232], deep:[118,86,158], rose:[206,118,160] };
const _g={};
function glow(rgb){ const k=rgb.join(); if(_g[k])return _g[k]; const s=48,c=document.createElement('canvas'); c.width=c.height=s; const x=c.getContext('2d');
  const g=x.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2); g.addColorStop(0,`rgba(${rgb[0]},${rgb[1]},${rgb[2]},1)`); g.addColorStop(.4,`rgba(${rgb[0]},${rgb[1]},${rgb[2]},.45)`); g.addColorStop(1,`rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
  x.fillStyle=g; x.fillRect(0,0,s,s); _g[k]=c; return c; }
function dot(ctx,cx,cy,r,rgb,a){ if(a<=0||r<=0)return; ctx.globalAlpha=a>1?1:a; ctx.drawImage(glow(rgb),cx-r,cy-r,r*2,r*2); }

/* ---- DNA helix (voice) — hero-style: twin particle backbones + base-pair rungs, depth + rotation, reactive ---- */
function startDNA(canvas){
  const ctx=canvas.getContext('2d'),d=Math.min(devicePixelRatio||1,2); let raf;
  const size=()=>{const w=canvas.clientWidth||320,hh=canvas.clientHeight||142;canvas.width=w*d;canvas.height=hh*d;ctx.setTransform(d,0,0,d,0,0);}; size();
  const onResize=()=>size(); addEventListener('resize',onResize);   // removed in teardown below — one listener per session, never leaked
  const STEPS=54, turns=2.4, NW=3;   // lighter: 3 woven wires per strand (less main-thread load)
  function tick(t){ const w=canvas.clientWidth||320,h=canvas.clientHeight||142,mid=h/2; ctx.clearRect(0,0,w,h);
    const lt=isLight(); ctx.globalCompositeOperation=lt?'source-over':'lighter';
    const e=drv, gbase=h*(0.085+e*0.05), braid=(0.8+e*1.8), scroll=t*0.0016+e*0.004, bright=(lt?0.92:0.6), psz=0.7+e*0.7;
    const cV=lt?[120,30,206]:[172,114,238], cL=lt?[150,82,202]:[208,198,238], cR=lt?[196,52,128]:[234,112,168];   // richer + visible on light
    function cable(x,cy,ph,phase,wph,col,lb){
      for(let k=0;k<NW;k++){ const wp=ph*3.0 + k*(Math.PI*2/NW) + wph;
        const wx=x+Math.cos(wp)*braid, wy=cy+Math.sin(wp)*braid, front=(Math.cos(wp)+1)/2;
        dot(ctx,wx,wy, psz*(0.5+front*0.85)*(0.85+lb*0.6), col, (bright+lb*(lt?0.7:1.2))*((lt?.10:.055)+phase*(lt?.24:.3))*(0.4+front*0.85)); }
    }
    for(let i=0;i<STEPS;i++){ const f=i/(STEPS-1), x=f*w, ph=f*turns*Math.PI*2+scroll;
      const sv=spec[Math.min(SPEC_N-1,(f*SPEC_N)|0)];                 // local spectral level → this point peaks on its own
      const la=gbase + h*0.215*sv;                                    // helix radius = gentle base + local spectral peak (wave)
      const yA=mid+Math.sin(ph)*la, yB=mid+Math.sin(ph+Math.PI)*la, fA=(Math.cos(ph)+1)/2, fB=(Math.cos(ph+Math.PI)+1)/2, sep=Math.abs(yA-yB);
      if(i%3===0&&sep>5){ for(let j=1;j<=2;j++){ const u=j/3, ry=yA+(yB-yA)*u; dot(ctx,x,ry, 0.8*psz, cR, (lt?.11:.055)+Math.min(fA,fB)*(lt?.10:.1)+sv*.35); } }
      cable(x,yA,ph,fA,0,   cV, sv);
      cable(x,yB,ph,fB,0.7, cL, sv);
    }
    ctx.globalAlpha=1; ctx.globalCompositeOperation='source-over'; raf=requestAnimationFrame(tick); }
  raf=requestAnimationFrame(tick); return ()=>{ cancelAnimationFrame(raf); removeEventListener('resize',onResize); }; }

/* Reduced-motion: honour the OS "reduce motion" setting live (re-checked each call so a mid-session
   toggle is respected). When set, the animated helix is never started; a single static state mark is
   painted instead so the voice stage still reads as "live" without any motion. */
const prefersReduced=()=>{ try{ return matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(_){ return false; } };
function drawStaticMark(canvas){
  const ctx=canvas.getContext('2d'),d=Math.min(devicePixelRatio||1,2);
  const w=canvas.clientWidth||320,h=canvas.clientHeight||142; canvas.width=w*d; canvas.height=h*d; ctx.setTransform(d,0,0,d,0,0);
  ctx.clearRect(0,0,w,h); const cx=w/2,cy=h/2, lt=isLight();
  ctx.strokeStyle=lt?'rgba(120,30,206,.55)':'rgba(172,114,238,.7)'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.arc(cx,cy,26,0,Math.PI*2); ctx.stroke();        // steady ring = "listening", no animation
  ctx.beginPath(); ctx.moveTo(cx-7,cy-11); ctx.lineTo(cx+9,cy); ctx.lineTo(cx-7,cy+11); ctx.stroke();   // Accenture chevron, static
}

/* ----------------------------------------------------------------- conversation (single persistent session + short-term memory) */
const stage=$('.bw-stage'), stageCv=stage.querySelector('canvas');
let convo=null, mode=null, sessionVoice=false, pendingFirst=null, reactRAF=null, lastUser='', typingEl=null, micMuted=false, dnaStop=null, transcriptOpen=false;
let convoLive=false;   // true only while the WebSocket is actually open (set by onConnect/onDisconnect) — gates endSession so we never send on an already-closed socket
const MEM_KEY='bw-mem', MEM_TTL=40*60*1000;
function saveMem(){ try{ const ms=[...body.querySelectorAll('.bw-msg')].slice(-20).map(m=>({r:m.classList.contains('user')?'u':'a',t:m.textContent})); if(ms.length) localStorage.setItem(MEM_KEY,JSON.stringify({ts:Date.now(),msgs:ms})); }catch(_){} }
function loadMem(){ try{ const j=JSON.parse(localStorage.getItem(MEM_KEY)||'null'); if(j&&Date.now()-j.ts<MEM_TTL&&j.msgs&&j.msgs.length) return j; }catch(_){} return null; }
function clearMem(){ try{ localStorage.removeItem(MEM_KEY); }catch(_){} }
function memCtx(j){ return j.msgs.map(x=>(x.r==='u'?'User: ':'Advisor: ')+x.t).join('\n'); }
function showErr(m){ errEl.classList.remove('info'); errEl.textContent=m||''; errEl.style.display=m?'':'none'; }
function showInfo(m){ errEl.classList.add('info'); errEl.textContent=m||''; errEl.style.display=m?'':'none'; }   // neutral status (connecting, mic permission) — booth staff must SEE state
function scrollDown(){ body.scrollTop=body.scrollHeight; }
function addMsg(role,text,silent){ const dv=document.createElement('div'); dv.className='bw-msg '+(role==='user'?'user':'ai'); dv.textContent=text; body.appendChild(dv); scrollDown(); if(!silent) saveMem(); }
function setTyping(on){ if(on){ if(typingEl)return; typingEl=document.createElement('div'); typingEl.className='bw-typing'; typingEl.innerHTML='<i></i><i></i><i></i>'; body.appendChild(typingEl); scrollDown(); } else if(typingEl){ typingEl.remove(); typingEl=null; } }
function transcript(){ return [...body.querySelectorAll('.bw-msg')].slice(-12).map(m=>(m.classList.contains('user')?'User: ':'Advisor: ')+m.textContent).join('\n'); }
function vstate(s){ const e=stage.querySelector('.bw-vstate'); if(e)e.textContent=s||''; }
function applyBodyVis(){ body.style.display=(mode==='voice'&&!transcriptOpen)?'none':''; }
function showStage(on){ stage.style.display=on?'':'none';
  if(on){ transcriptOpen=false; ttog.textContent='Show transcript';
    if(prefersReduced()){ if(dnaStop){ dnaStop(); dnaStop=null; } requestAnimationFrame(()=>{ if(stage.style.display!=='none') drawStaticMark(stageCv); }); }
    else if(!dnaStop) requestAnimationFrame(()=>{ if(stage.style.display!=='none'&&!dnaStop&&!prefersReduced()) dnaStop=startDNA(stageCv); }); }
  else if(dnaStop){ dnaStop(); dnaStop=null; }
  applyBodyVis(); }
function segUI(){ seg.classList.remove('hide'); seg.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.m===mode)); }
function footerUI(){ ft.classList.remove('hide'); const v=mode==='voice'; micBtn.style.display=v?'':'none'; endBtn.style.display=''; sendBtn.style.display=''; input.placeholder=v?'or type instead...':'Ask about the roadshow...'; }

function viewChoice(){ mode=null; sessionVoice=false; showStage(false); seg.classList.add('hide'); ft.classList.add('hide'); showErr(''); body.style.display=''; body.innerHTML=''; typingEl=null;
  const mem=loadMem(); const c=document.createElement('div'); c.className='bw-choice';
  c.innerHTML=`<h4>${mem?'Pick up where you left off':'How would you like to explore?'}</h4>
    <p>${mem?'It remembers your last few messages.':'Ask about any of the four solutions or the hub. Voice or chat, switch anytime.'}</p>
    <div class="bw-opt"><button data-pick="voice">${I.mic}Talk</button><button data-pick="chat">${I.chat}Chat</button></div>
    <div class="bw-switch">${mem?'<button class="bw-fresh" data-fresh>Start fresh instead</button>':'Voice or text, your call.'}</div>`;
  body.appendChild(c); c.querySelectorAll('[data-pick]').forEach(b=>b.addEventListener('click',()=>start(b.dataset.pick==='voice',pendingFirst)));
  const fb=c.querySelector('[data-fresh]'); if(fb) fb.addEventListener('click',()=>{ clearMem(); viewChoice(); }); }

/* Generation token. Incremented on every panel open AND close (and on hard teardown). Every connect
   attempt captures the gen it started under; if gen has moved by the time startSession() resolves,
   the panel was closed (or closed+reopened) mid-connect, so the freshly-opened session is a leak:
   we endSession() it immediately and never adopt it. The SDK callbacks are also gen-guarded so a
   stale session can't mutate the UI after it has been superseded. */
let gen=0;
function baseOpts(voice,myGen){ return { agentId:AGENT, connectionType:'websocket', textOnly:!voice,
  onConnect:()=>{ if(gen!==myGen) return; convoLive=true; if(mode==='voice') vstate('listening'); }, onDisconnect:()=>{ if(gen!==myGen) return; convoLive=false; if(mode==='voice') vstate(''); },
  onError:(e)=>{ if(gen!==myGen) return; showErr('Connection issue. Try again.'); setTyping(false); console.warn('[brain-widget]',e); }, onStatusChange:()=>{},
  onModeChange:(m)=>{ if(gen!==myGen) return; const md=(m&&m.mode)||m; if(mode==='voice') vstate(md==='speaking'?'speaking':'listening'); },
  onMessage:(m)=>{ if(gen!==myGen) return; const src=(m&&m.source)||'ai', text=(m&&m.message)||''; if(!text)return;
    if(src==='user'){ if(text.trim()===lastUser.trim())return; addMsg('user',text); } else { setTyping(false); addMsg('ai',text); } } }; }

async function endIfAny(){ const c=convo, live=convoLive; convo=null; convoLive=false; if(reactRAF){cancelAnimationFrame(reactRAF);reactRAF=null;} drv=0; spec.fill(0);
  try{ if(c&&live&&c.endSession) await c.endSession(); }catch(_){} }   // null FIRST so reopen never reuses a dead session; only endSession while the socket is open
async function discardStale(session,myGen){ convoLive=false;   // late-resolving session from a superseded generation → terminate it so the concurrency slot is released
  try{ if(session&&session.endSession) await session.endSession(); }catch(_){}
  console.warn('[brain-widget] session resolved after close/reopen (gen '+myGen+'->'+gen+'); terminated + discarded, slot released'); }
async function connect(voice,ov,myGen){   // websocket = reliable audio (webrtc broke audio + slowed startup in this setup)
  await loadSDK();                        // self-hosted bundle; throws if missing/broken → caller shows the "ask booth staff" state, launcher stays alive
  bwWiring=true;                          // tag the socket the SDK is about to create so the CLOSING-send guard only ever touches our own sockets
  try{
    try{ const opts=baseOpts(voice,myGen); opts.connectionType='websocket'; if(ov)opts.overrides=ov; return await Conversation.startSession(opts); }
    catch(e){ console.warn('[brain-widget] connect',e);
      // Defense in depth (booth incident 2026-07-12): if the agent config disallows an override
      // ("Override for field 'first_message' is not allowed by config"), the session dies at 0s.
      // Retry once WITHOUT overrides so the visitor gets a (re-)greeting instead of dead silence.
      if(ov){ const opts=baseOpts(voice,myGen); opts.connectionType='websocket'; return await Conversation.startSession(opts); }
      throw e; }
  } finally { bwWiring=false; }
}
async function start(voice,firstMessage){ const myGen=gen; pendingFirst=null; showErr(''); body.innerHTML=''; typingEl=null;
  mode=voice?'voice':'chat'; sessionVoice=voice; segUI(); footerUI(); showStage(voice);
  const mem=loadMem(), cont=!!mem;
  if(cont) mem.msgs.forEach(x=>addMsg(x.r==='u'?'user':'ai', x.t, true));
  if(!voice && !cont) setTyping(true);
  if(voice){ vstate('requesting microphone…'); showInfo('Waiting for microphone permission…'); } else showInfo('Connecting…');
  const ov = firstMessage?{agent:{firstMessage}}:(cont?{agent:{firstMessage:''}}:undefined);
  try{ const session=await connect(voice,ov,myGen);
    if(gen!==myGen){ await discardStale(session,myGen); return; }   // closed/reopened during connect → never adopt the stale session
    convo=session; showErr(''); if(voice){ startReact(); vstate('listening'); }
    if(cont) setTimeout(()=>{ try{ convo&&convo.sendContextualUpdate&&convo.sendContextualUpdate('(Background context only. Do not reply to this and stay silent until the user speaks. Never greet or re-introduce yourself.) You are already mid-conversation with this user. Recent messages:\n'+memCtx(mem)); }catch(_){} },700); }
  catch(e){ if(gen!==myGen) return;   // panel gone: don't paint errors into a closed/reopened view
    setTyping(false); console.warn('[brain-widget] start',e); viewChoice();
    showErr(sdkFailed ? 'Live assistant is offline. Please ask a member of booth staff and they will help you right away.'
                      : (voice?'Voice temporarily unavailable. Check mic permission or try Chat.':'Could not connect. Tap Talk or Chat to retry.')); } }   // AFTER viewChoice: it clears the err line (v13 bug: failures looked like dead silence)
async function reconnectVoice(){ const myGen=gen; const ctx=transcript(); await endIfAny(); if(gen!==myGen) return;
  mode='voice'; sessionVoice=true; segUI(); footerUI(); showStage(true);
  vstate('requesting microphone…'); showInfo('Waiting for microphone permission…');
  try{ const session=await connect(true,{agent:{firstMessage:''}},myGen);
    if(gen!==myGen){ await discardStale(session,myGen); return; }
    convo=session; showErr(''); startReact(); vstate('listening');
    if(ctx) setTimeout(()=>{ try{ convo&&convo.sendContextualUpdate&&convo.sendContextualUpdate('(Background context only. Do not reply to this and stay silent until the user speaks. Never greet or re-introduce yourself.) You are already mid-conversation with this user. Recent messages:\n'+ctx); }catch(_){} },700); }
  catch(e){ if(gen!==myGen) return; console.warn(e); mode='chat'; sessionVoice=false; showStage(false); segUI(); footerUI();
    showErr(sdkFailed ? 'Voice assistant is offline. Please ask booth staff. Chat still works.' : 'Voice temporarily unavailable. Check mic permission. Chat still works.'); } }
async function setMode(voice){ if(!convo){ start(voice,pendingFirst); return; } if(voice===(mode==='voice')) return;
  if(sessionVoice){ mode=voice?'voice':'chat'; try{ convo.setMicMuted&&convo.setMicMuted(!voice); }catch(_){} try{ convo.setVolume&&convo.setVolume({volume:voice?1:0}); }catch(_){} micMuted=!voice; micBtn.innerHTML=voice?I.mic:I.micOff; showStage(voice); segUI(); footerUI(); if(voice) vstate('listening'); }
  else if(voice){ await reconnectVoice(); } else { mode='chat'; showStage(false); segUI(); footerUI(); } }

/* reactivity — per-band spectrum → the helix peaks travel along it like a waveform, not one uniform pulse */
const hasE=a=>{ if(!a||!a.length)return false; for(let i=2;i<a.length;i+=6) if(a[i]>5)return true; return false; };
function startReact(){ if(prefersReduced()) return;   // no helix under reduced motion → nothing to drive, skip the rAF loop
  if(reactRAF)cancelAnimationFrame(reactRAF);
  const loop=()=>{ let lvl=0;
    try{ const o=convo&&convo.getOutputByteFrequencyData&&convo.getOutputByteFrequencyData(), ip=convo&&convo.getInputByteFrequencyData&&convo.getInputByteFrequencyData();
      const src = hasE(o)?o:(hasE(ip)?ip:null);
      if(src){ const usable=Math.min(src.length,190);                        // voice energy sits in the low/mid bins
        for(let i=0;i<SPEC_N;i++){
          const lo=(Math.pow(i/SPEC_N,1.45)*usable)|0, hi=Math.max(lo+1,(Math.pow((i+1)/SPEC_N,1.45)*usable)|0);
          let m=0; for(let j=lo;j<hi&&j<src.length;j++) if(src[j]>m)m=src[j];
          const v=Math.min(1,(m/255)*1.35);                                  // this band's level 0..1
          spec[i]+=(v-spec[i])*(v>spec[i]?0.55:0.16);                        // fast attack per band, soft release → peaks ripple
          if(spec[i]>lvl)lvl=spec[i];
        }
      } else { const ov=convo&&convo.getOutputVolume?convo.getOutputVolume():0, iv=convo&&convo.getInputVolume?convo.getInputVolume():0; lvl=Math.max(ov,iv*0.9);
        for(let i=0;i<SPEC_N;i++){ const w=lvl*(0.45+0.55*Math.abs(Math.sin(i*0.9+lvl*6))); spec[i]+=(w-spec[i])*0.2; }   // fallback: shaped, not flat
      }
    }catch(_){}
    const tgt=Math.min(1,lvl*1.9); drv+=(tgt-drv)*(tgt>drv?0.8:0.12);        // overall energy → global brightness/size
    reactRAF=requestAnimationFrame(loop); }; loop(); }

/* ----------------------------------------------------------------- ui — close ALWAYS fully ends the session.
   Booth-critical: dozens of visitors open/close back to back on a concurrency-limited agent.
   A session left alive on close (or abandoned on refresh) holds a server-side slot and gets
   new connections refused. So: end + null on close, end on pagehide/unload, fresh session every
   open. Continuity is preserved via short-term memory (localStorage) replayed on the next start,
   not by reusing a dead conversation object. */
/* Dialog focus management: the panel is a modal dialog (role/aria-modal set at creation). On open we
   record the invoker, move focus inside, and trap Tab within the panel; Escape closes; on close focus
   returns to whatever launched it. The launcher is pulled OUT of the tab order whenever it is visually
   hidden (replaced by the open panel, or sitting under the hero) and restored when it reappears. */
let lastFocused=null;
function panelFocusables(){ return [...panel.querySelectorAll('button:not([disabled]),textarea,input,[href],[tabindex]:not([tabindex="-1"])')].filter(el=>el.offsetParent!==null); }
function focusIntoPanel(){ requestAnimationFrame(()=>{ const pref=panel.querySelector('.bw-body button,.bw-body textarea,.bw-body input')||panelFocusables()[0]||panel; try{ pref.focus(); }catch(_){} }); }
function syncLauncherTabbability(){ const hidden=bubble.classList.contains('gone')||bubble.classList.contains('bw-preveal');
  bubble.tabIndex=hidden?-1:0; bubble.setAttribute('aria-hidden',hidden?'true':'false'); }
panel.addEventListener('keydown',e=>{ if(!panel.classList.contains('open')) return;
  if(e.key==='Escape'){ e.preventDefault(); closePanel(); return; }
  if(e.key!=='Tab') return; const f=panelFocusables(); if(!f.length){ e.preventDefault(); try{ panel.focus(); }catch(_){} return; }
  const first=f[0], last=f[f.length-1], a=document.activeElement;
  if(e.shiftKey && (a===first||!panel.contains(a))){ e.preventDefault(); last.focus(); }
  else if(!e.shiftKey && (a===last||!panel.contains(a))){ e.preventDefault(); first.focus(); } });

function openPanel(){ gen++; lastFocused=document.activeElement; panel.classList.add('open'); bubble.classList.add('gone'); syncLauncherTabbability(); focusIntoPanel(); }
async function closePanel(){ gen++; panel.classList.remove('open'); bubble.classList.remove('gone'); syncLauncherTabbability(); saveMem();
  showStage(false); mode=null; sessionVoice=false; micMuted=false;
  const rf=(lastFocused&&document.contains(lastFocused)&&lastFocused!==document.body)?lastFocused:bubble; try{ rf.focus(); }catch(_){} lastFocused=null;
  await endIfAny(); }                       // fully tears down the WebSocket session + nulls convo
// synchronous best-effort teardown for tab close / refresh / navigation (can't await on unload)
function hardTeardown(){ gen++; const c=convo, live=convoLive; convo=null; convoLive=false; if(reactRAF){cancelAnimationFrame(reactRAF);reactRAF=null;}
  try{ c&&live&&c.endSession&&c.endSession(); }catch(_){} }
addEventListener('pagehide',hardTeardown); addEventListener('beforeunload',hardTeardown);
bubble.addEventListener('click',()=>{ openPanel(); if(!convo){ viewChoice(); } });   // convo is always null after close → fresh session
$('.bw-x').addEventListener('click',()=>{ closePanel(); });
seg.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.m==='voice')));
ttog.addEventListener('click',()=>{ transcriptOpen=!transcriptOpen; ttog.textContent=transcriptOpen?'Hide transcript':'Show transcript'; applyBodyVis(); if(transcriptOpen) scrollDown(); });
function doSend(){ const tx=input.value.trim(); if(!tx)return; input.value=''; input.style.height='auto'; lastUser=tx; addMsg('user',tx); if(mode!=='voice') setTyping(true);
  const trySend=n=>{ if(convo&&convo.sendUserMessage){ try{ convo.sendUserMessage(tx); }catch(_){} }
    else if(n<20) setTimeout(()=>trySend(n+1),200);
    else { setTyping(false); showErr('Not connected. Close and reopen to reconnect.'); } }; trySend(0); }   // never swallow a send into the void (booth staff must see it)
sendBtn.addEventListener('click',doSend);
input.addEventListener('keydown',e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); doSend(); } });
input.addEventListener('input',()=>{ input.style.height='auto'; input.style.height=Math.min(84,input.scrollHeight)+'px'; });
micBtn.addEventListener('click',()=>{ micMuted=!micMuted; try{ convo&&convo.setMicMuted&&convo.setMicMuted(micMuted); }catch(_){} micBtn.innerHTML=micMuted?I.micOff:I.mic; micBtn.classList.toggle('on',!micMuted); });
endBtn.addEventListener('click',async()=>{ await endIfAny(); viewChoice(); });

/* ----------------------------------------------------------------- public api */
window.BrainWidget={
  open(){ openPanel(); if(!convo&&!mode) viewChoice(); },
  openSection(fm){ openPanel();
    if(convo&&mode){ const q='Take me through this section in depth.'; lastUser=q; addMsg('user',q); if(mode!=='voice') setTyping(true);
      try{ convo.sendContextualUpdate&&convo.sendContextualUpdate('Focus now on this section. '+fm); }catch(_){}
      const f=n=>{ if(convo&&convo.sendUserMessage){ try{ convo.sendUserMessage(q); }catch(_){} } else if(n<20) setTimeout(()=>f(n+1),200); }; f(0); }
    else { pendingFirst=fm; viewChoice(); } },
  talkSection(fm){ openPanel(); pendingFirst=fm; viewChoice(); }, close(){ closePanel(); } };

/* ----------------------------------------------------------------- placement: hero-gated reveal + footer avoidance (summit) */
/* 1) The launcher must NOT sit over the opening film / title sequence. It fades in (site silk)
      only once the hero (#film) scrolls out, and hides again if the visitor returns to the top.
   2) At the page bottom it rides above the <footer> so it never covers the socials or copyright. */
style.textContent += `
#bw-bubble{transition:transform .55s cubic-bezier(.16,1,.3,1),opacity .55s cubic-bezier(.16,1,.3,1),box-shadow .3s ease}
#bw-bubble.bw-preveal{opacity:0;transform:translateY(12px) scale(.94);pointer-events:none}
`;
(function heroFooterPlacement(){
  const film=document.getElementById('film');
  const foot=document.querySelector('footer');
  // start hidden until the hero is scrolled past (unless there is no film on the page)
  if(film) bubble.classList.add('bw-preveal');
  syncLauncherTabbability();   // reflect the initial hidden/shown state in the tab order
  // hero coverage: while the film still covers the majority of the viewport we stay hidden.
  // (#film is taller than the viewport, so we test coverage, not intersectionRatio.)
  function heroCovers(){ if(!film) return false; const r=film.getBoundingClientRect();
    return r.bottom > innerHeight*0.5 && r.top < innerHeight*0.5; }
  function syncReveal(){ if(!film){ bubble.classList.remove('bw-preveal'); syncLauncherTabbability(); return; }
    if(heroCovers() && !panel.classList.contains('open')) bubble.classList.add('bw-preveal');
    else bubble.classList.remove('bw-preveal');
    syncLauncherTabbability(); }   // keep tab order in sync as the launcher hides/shows over the hero
  // footer avoidance — ride 24px above the footer's top edge when it enters the viewport
  function baseOffset(){ return Math.max(20, Math.min(40, innerWidth*0.04)); }
  function place(){
    const base=baseOffset(); let bottom=base;
    if(foot){ const r=foot.getBoundingClientRect(); const overlap=innerHeight - r.top;
      if(overlap>0) bottom=Math.max(base, overlap + 24); }
    bubble.style.bottom=bottom+'px'; panel.style.bottom=bottom+'px';
  }
  function onScroll(){ place(); syncReveal(); }
  addEventListener('scroll',onScroll,{passive:true}); addEventListener('resize',onScroll); onScroll();
})();

/* Warm the self-hosted SDK on idle so the first booth interaction is instant. Fire-and-forget:
   a failure here just leaves sdkFailed set for the graceful-degradation path, it never blocks render. */
if('requestIdleCallback' in window) requestIdleCallback(()=>{ loadSDK().catch(()=>{}); },{timeout:2500});
else setTimeout(()=>{ loadSDK().catch(()=>{}); },1200);
