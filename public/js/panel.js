'use strict';
/* ══════════════════════════════════════════
   OFA PANEL Z — panel.js  v9.1
   ══════════════════════════════════════════ */

// ── Features ──────────────────────────────
const FEATURES = [
  { id:'aimbot_mobile', name:'Aimbot Mobile',       tag:'MOBILE', desc:'Target acquisition mobile layer',  icon:'crosshair' },
  { id:'aim_lock',      name:'Aim-Lock 50%',         tag:'LOCK',   desc:'Smooth lock at 50% strength',      icon:'lock'      },
  { id:'del_reports',   name:'Delete Fake Reports',  tag:'REPORT', desc:'Suppress false detection reports',  icon:'shield'    },
  { id:'anti_ban',      name:'Anti-Ban SSL',         tag:'SSL',    desc:'SSL-tunneled ban evasion layer',    icon:'ban'       },
  { id:'ip_rotation',  name:'IP-Rotation',          tag:'PROXY',  desc:'Rotating proxy chain US→JP→BR',    icon:'refresh'   },
  { id:'aimbot_ssl',   name:'Aimbot SSL',           tag:'SSL',    desc:'Aim vectors routed over SSL',       icon:'aim'       },
  { id:'aim_assist',   name:'Aim Assist (RES)',     tag:'RES',    desc:'Resolution-based aim correction',   icon:'target'    },
  { id:'recoil',       name:'Recoil Reducer SSL',  tag:'SSL',    desc:'Memory-patched recoil vectors',     icon:'wave'      },
  { id:'aim_proxy',    name:'Aim [Proxy]',          tag:'PROXY',  desc:'Proxy-masked aim injection',        icon:'globe'     },
];

const ICONS = {
  crosshair:`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>`,
  lock:`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  shield:`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  ban:`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`,
  refresh:`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`,
  aim:`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>`,
  target:`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  wave:`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  globe:`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
};

// ── State ─────────────────────────────────
const S = { active:{}, sessionStart:Date.now(), reqCount:0, netReqs:[], selectedReq:null };
FEATURES.forEach(f => S.active[f.id] = false);

const $  = id => document.getElementById(id);
const ts = () => new Date().toLocaleTimeString('en-GB',{hour12:false});
const rnd = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
const rndIp = () => `${rnd(100,220)}.${rnd(10,240)}.${rnd(10,240)}.${rnd(2,250)}`;

// ══════════════════════════════════════════
//  BG CANVAS — login  
// ══════════════════════════════════════════
(function(){
  const c = $('login-bg'), ctx = c.getContext('2d');
  let W,H;
  const res=()=>{W=c.width=innerWidth;H=c.height=innerHeight;};
  res(); addEventListener('resize',res);
  const pts=Array.from({length:70},()=>({x:Math.random()*2000,y:Math.random()*1200,vx:(Math.random()-.5)*.28,vy:(Math.random()-.5)*.28,r:Math.random()*1.4+.3,a:Math.random()*.55+.08}));
  (function draw(){
    ctx.clearRect(0,0,W,H);ctx.fillStyle='#06060c';ctx.fillRect(0,0,W,H);
    pts.forEach(p=>{p.x=(p.x+p.vx+W)%W;p.y=(p.y+p.vy+H)%H;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=`rgba(240,180,41,${p.a*.4})`;ctx.fill();});
    for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){
      const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);
      if(d<105){ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.strokeStyle=`rgba(240,180,41,${(1-d/105)*.08})`;ctx.lineWidth=.45;ctx.stroke();}
    }
    requestAnimationFrame(draw);
  })();
})();

// ══════════════════════════════════════════
//  PANEL PARTICLES — full screen behind panel  
// ══════════════════════════════════════════
function initPanelParticles(){
  const c=$('panel-particles'),ctx=c.getContext('2d');
  let W,H;
  const res=()=>{W=c.width=innerWidth;H=c.height=innerHeight;};
  res();addEventListener('resize',res);
  const pts=Array.from({length:55},()=>({x:Math.random()*2000,y:Math.random()*1200,vx:(Math.random()-.5)*.22,vy:(Math.random()-.5)*.22,r:Math.random()*1.3+.3,a:Math.random()*.4+.06}));
  (function draw(){
    ctx.clearRect(0,0,W,H);
    pts.forEach(p=>{p.x=(p.x+p.vx+W)%W;p.y=(p.y+p.vy+H)%H;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=`rgba(240,180,41,${p.a*.45})`;ctx.fill();});
    for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){
      const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);
      if(d<95){ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.strokeStyle=`rgba(240,180,41,${(1-d/95)*.07})`;ctx.lineWidth=.4;ctx.stroke();}
    }
    requestAnimationFrame(draw);
  })();
}

// ══════════════════════════════════════════
//  ALL MIGHT SIDE PORTRAIT particles  
// ══════════════════════════════════════════
function initSideCanvas(){
  const c=$('am-side-canvas'),frame=c.parentElement,ctx=c.getContext('2d');
  let W,H;
  const res=()=>{W=c.width=frame.offsetWidth;H=c.height=frame.offsetHeight;};
  res();addEventListener('resize',res);
  const pts=Array.from({length:30},()=>({x:Math.random()*400,y:Math.random()*280,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,r:Math.random()*1.6+.4,a:Math.random()*.7+.2}));
  (function draw(){
    ctx.clearRect(0,0,W,H);
    pts.forEach(p=>{p.x=(p.x+p.vx+W)%W;p.y=(p.y+p.vy+H)%H;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=`rgba(240,180,41,${p.a*.55})`;ctx.fill();});
    for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){
      const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);
      if(d<70){ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.strokeStyle=`rgba(240,180,41,${(1-d/70)*.2})`;ctx.lineWidth=.55;ctx.stroke();}
    }
    requestAnimationFrame(draw);
  })();
}

// ══════════════════════════════════════════
//  LOGIN  
// ══════════════════════════════════════════
async function doLogin(){
  const pw=$('pass-input').value.trim();
  if(!pw)return;
  $('login-btn').disabled=true;
  try{
    const r=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:pw})});
    const d=await r.json();
    if(d.ok){$('screen-login').classList.add('hidden');$('screen-panel').classList.remove('hidden');initPanel();}
    else showErr(d.message||'ACCESS DENIED');
  }catch{showErr('CONNECTION ERROR');}
  $('login-btn').disabled=false;
}
function showErr(m){const e=$('login-error');e.textContent=m;$('pass-input').value='';$('pass-input').focus();setTimeout(()=>e.textContent='',3200);}
$('login-btn').addEventListener('click',doLogin);
$('pass-input').addEventListener('keydown',e=>e.key==='Enter'&&doLogin());

// ══════════════════════════════════════════
//  PANEL INIT  
// ══════════════════════════════════════════
function initPanel(){
  buildFeatures();
  initPanelParticles();
  initSideCanvas();
  initTabs();
  startSessionTimer();
  startPingSimulator();
  startProxyRotator();
  startConsoleIntro();
  startNetworkMonitor();
  startOffsetFlicker();
  $('inject-btn').addEventListener('click',startInject);
  $('btn-refresh').addEventListener('click',()=>{consoleLog('<span class="cl-warn">[REFRESH]</span> <span class="cl-tx">Refreshing memory offsets...</span>');setTimeout(()=>consoleLog('<span class="cl-ok">[OK]</span> <span class="cl-tx">Offsets reloaded: 0x2A4F80</span>'),700);});
  $('btn-clear-all').addEventListener('click',()=>{Object.keys(S.active).forEach(k=>S.active[k]=false);buildFeatures();updateCounts();consoleLog('<span class="cl-warn">[CLEAR]</span> <span class="cl-tx">All modules deactivated</span>');});
  $('inj-close').addEventListener('click',closeInject);
}

// ── Features ─────────────────────────────
function buildFeatures(){
  const list=$('features-list');list.innerHTML='';
  FEATURES.forEach(f=>{
    const on=S.active[f.id];
    const div=document.createElement('div');
    div.className=`feat${on?' on':''}`;div.dataset.id=f.id;
    div.innerHTML=`<div class="feat-ico">${ICONS[f.icon]}</div><div class="feat-body"><div class="feat-name">${f.name}</div><div class="feat-desc">${f.desc}</div></div><span class="feat-tag">${f.tag}</span><div class="tgl${on?' on':''}"></div>`;
    div.addEventListener('click',()=>toggleFeat(f.id));
    list.appendChild(div);
  });
  updateCounts();
}
function toggleFeat(id){
  S.active[id]=!S.active[id];
  const on=S.active[id],f=FEATURES.find(x=>x.id===id);
  const div=document.querySelector(`.feat[data-id="${id}"]`);
  if(div){div.classList.toggle('on',on);div.querySelector('.tgl').classList.toggle('on',on);}
  updateCounts();
  consoleLog(on?`<span class="cl-ok">[MOD+]</span> <span class="cl-tx">${f.name}</span> <span class="cl-dim">— module activated</span>`:`<span class="cl-warn">[MOD-]</span> <span class="cl-tx">${f.name}</span> <span class="cl-dim">— module deactivated</span>`);
  if(on) addNetReq('POST',`/api/module/${id}/enable`,200,'json',rnd(18,120));
  else   addNetReq('POST',`/api/module/${id}/disable`,200,'json',rnd(14,90));
}
function updateCounts(){
  const n=Object.values(S.active).filter(Boolean).length;
  $('modules-count').textContent=`${n} / ${FEATURES.length}`;
  $('stat-modules').textContent=n;
  $('pf-modules').textContent=`${n} module${n!==1?'s':''} active`;
  $('pf-fill').style.width=`${Math.round(n/FEATURES.length*100)}%`;
  $('pf-pct').textContent=`${Math.round(n/FEATURES.length*100)}%`;
  const el=$('stat-status');
  el.textContent=n>5?'INJECTED':n>0?'ACTIVE':'SAFE';
  el.className='stat-v '+(n>5?'red':n>0?'gold':'green');
}

// ── Tabs ─────────────────────────────────
function initTabs(){
  document.querySelectorAll('.tab').forEach(t=>{
    t.addEventListener('click',()=>{
      document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(x=>x.classList.remove('active'));
      t.classList.add('active');
      $('tab-'+t.dataset.tab).classList.add('active');
    });
  });
}

// ── Session timer ────────────────────────
function startSessionTimer(){
  setInterval(()=>{
    const s=Math.floor((Date.now()-S.sessionStart)/1000);
    const h=String(Math.floor(s/3600)).padStart(2,'0');
    const m=String(Math.floor((s%3600)/60)).padStart(2,'0');
    const sc=String(s%60).padStart(2,'0');
    $('stat-session').textContent=`${h}:${m}`;
    $('hdr-time').textContent=`${h}:${m}:${sc}`;
  },1000);
}

// ── Ping ─────────────────────────────────
function startPingSimulator(){
  let base=28+Math.random()*22;
  setInterval(()=>{base+=(Math.random()-.47)*5;base=Math.max(12,Math.min(base,95));$('stat-ping').textContent=`${Math.round(base)} ms`;},2000);
}

// ── Proxy rotator ─────────────────────────
function startProxyRotator(){
  const update=()=>{const ip=rndIp();$('hdr-ip').textContent=ip;$('info-proxy').textContent=ip;};
  update();setInterval(update,38000);
}

// ── Offset flicker ────────────────────────
function startOffsetFlicker(){
  const offsets=['0x2A4F80','0x2A5120','0x2A4F84','0x2B0000','0x2A4FA0','0x2A4F80'];
  let i=0;setInterval(()=>{i=(i+1)%offsets.length;$('info-offset').textContent=offsets[i];},9000);
}

// ══════════════════════════════════════════
//  CONSOLE  
// ══════════════════════════════════════════
const CONSOLE_INTRO=[
  ['<span class="cl-ok">[OK]</span> <span class="cl-tx">OFA Panel Z v9.1 — One For All Edition</span>'],
  ['<span class="cl-dim">──────────────────────────────────────────────</span>'],
  ['<span class="cl-ok">[OK]</span> <span class="cl-tx">Engine loaded: ofa-core.dll (9.1.0)</span>'],
  ['<span class="cl-ok">[OK]</span> <span class="cl-tx">SSL tunnel established — AES-256-GCM</span>'],
  ['<span class="cl-ok">[OK]</span> <span class="cl-tx">IP rotation initialized — proxy chain active</span>'],
  ['<span class="cl-info">[NET]</span> <span class="cl-tx">TLS handshake: api.ofa-panel.net</span>'],
  ['<span class="cl-ok">[OK]</span> <span class="cl-tx">Memory offsets loaded: FF v1.104.1</span>'],
  ['<span class="cl-ok">[OK]</span> <span class="cl-tx">Anti-cheat watchdog: nominal</span>'],
  ['<span class="cl-warn">[!!]</span> <span class="cl-tx">Evasion layer: ENABLED</span>'],
  ['<span class="cl-ok">[OK]</span> <span class="cl-tx">Session authenticated — welcome back</span>'],
  ['<span class="cl-dim">Type "help" for available commands</span>'],
];

const CMDS={
  help:`<span class="cl-info">Commands:</span> <span class="cl-tx">status · modules · inject · clear · version · ping · proxy · whoami</span>`,
  status:`<span class="cl-ok">[STATUS]</span> <span class="cl-tx">Engine: running · SSL: active · Evasion: enabled</span>`,
  version:`<span class="cl-info">[VER]</span> <span class="cl-tx">OFA Panel Z v9.1.0 · Build 9104 · FF v1.104.1</span>`,
  ping:`<span class="cl-info">[PING]</span> <span class="cl-tx">Pinging api.ofa-panel.net...</span>`,
  proxy:`<span class="cl-ok">[PROXY]</span> <span class="cl-tx">Chain: US(Dallas) → JP(Tokyo) → BR(São Paulo) → MX(CDMX) · Active</span>`,
  whoami:`<span class="cl-info">[USER]</span> <span class="cl-tx">ofa_user · role: PREMIUM · session: authenticated</span>`,
  modules:`<span class="cl-info">[MODS]</span> <span class="cl-tx">Run toggles in the MODULES tab to activate features</span>`,
  inject:`<span class="cl-warn">[INJECT]</span> <span class="cl-tx">Use the INJECT button to start the injection pipeline</span>`,
  clear:null,
};

function startConsoleIntro(){
  CONSOLE_INTRO.forEach((l,i)=>setTimeout(()=>consoleLog(l[0]),i*360+200));
  const cin=$('console-in');
  cin.addEventListener('keydown',e=>{
    if(e.key!=='Enter')return;
    const v=cin.value.trim().toLowerCase();cin.value='';
    if(!v)return;
    consoleLog(`<span class="cl-cmd">ofa@panel:~$</span> <span class="cl-tx">${v}</span>`);
    if(v==='clear'){$('console-out').innerHTML='';return;}
    const resp=CMDS[v]||`<span class="cl-err">[ERR]</span> <span class="cl-tx">command not found: ${v} (type "help")</span>`;
    setTimeout(()=>{
      consoleLog(resp);
      if(v==='ping')setTimeout(()=>consoleLog(`<span class="cl-ok">[PONG]</span> <span class="cl-tx">api.ofa-panel.net — ${rnd(14,80)}ms · TTL 52</span>`),500);
    },120);
  });
  $('console-clear').addEventListener('click',()=>$('console-out').innerHTML='');
}
function consoleLog(html){
  const out=$('console-out');
  const el=document.createElement('div');el.className='cl';
  el.innerHTML=`<span class="cl-ts">${ts()}</span>${html}`;
  out.appendChild(el);out.scrollTop=out.scrollHeight;
  while(out.children.length>200)out.removeChild(out.firstChild);
}

// ══════════════════════════════════════════
//  NETWORK MONITOR  
// ══════════════════════════════════════════
const FAKE_ENDPOINTS=[
  {m:'POST',u:'/api/v2/ssl/handshake',t:'ssl'},
  {m:'GET', u:'/api/v2/modules/status',t:'api'},
  {m:'POST',u:'/api/v2/proxy/rotate',t:'ssl'},
  {m:'GET', u:'/api/v2/offsets/ff1104',t:'api'},
  {m:'POST',u:'/api/v2/heartbeat',t:'ssl'},
  {m:'WSS', u:'wss://rt.ofa-panel.net/live',t:'ws'},
  {m:'POST',u:'/api/v2/evasion/ping',t:'ssl'},
  {m:'GET', u:'/api/v2/session/validate',t:'api'},
  {m:'POST',u:'/api/v2/acbypass/check',t:'ssl'},
  {m:'GET', u:'/api/v2/config/latest',t:'api'},
];
const DETAIL_HEADERS={
  request:{':method':'POST',':path':'/api/v2/ssl/handshake',':authority':'api.ofa-panel.net',':scheme':'https','content-type':'application/json','x-ofa-token':'eyJ...redacted','x-session-id':'sess_9a3f2b1','user-agent':'OFA/9.1 (FF; Android 12)'},
  response:{':status':'200','content-type':'application/json','x-request-id':'req_7c2a1f9','cache-control':'no-cache, no-store','strict-transport-security':'max-age=31536000; includeSubDomains','x-ssl-cipher':'TLS_AES_256_GCM_SHA384','x-proxy-node':'BR-SP-03'},
};
let netFilter='all';

function startNetworkMonitor(){
  addNetReq('POST','/api/v2/ssl/handshake',200,'ssl',rnd(22,80));
  addNetReq('GET','/api/v2/session/validate',200,'api',rnd(18,60));
  addNetReq('WSS','wss://rt.ofa-panel.net/live',101,'ws',rnd(30,90));
  setInterval(()=>{
    const ep=FAKE_ENDPOINTS[rnd(0,FAKE_ENDPOINTS.length-1)];
    addNetReq(ep.m,ep.u,200,ep.t,rnd(10,180));
    S.reqCount++;
    if($('info-reqs'))$('info-reqs').textContent=S.reqCount+3;
  },rnd(1800,4000));

  document.querySelectorAll('.net-f').forEach(b=>{
    b.addEventListener('click',()=>{
      document.querySelectorAll('.net-f').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');netFilter=b.dataset.f;renderNetList();
    });
  });
}

function addNetReq(method,url,status,type,time){
  S.netReqs.unshift({method,url,status,type,time,ts:ts()});
  if(S.netReqs.length>80)S.netReqs.pop();
  renderNetList();
  S.reqCount++;
  if($('info-reqs'))$('info-reqs').textContent=S.reqCount;
}
function renderNetList(){
  const list=$('net-list');if(!list)return;
  const filtered=netFilter==='all'?S.netReqs:S.netReqs.filter(r=>r.type===netFilter);
  list.innerHTML='';
  filtered.slice(0,30).forEach((r,idx)=>{
    const div=document.createElement('div');
    div.className='net-req'+(S.selectedReq===idx?' selected':'');
    const mc=r.method==='POST'?'post':r.method==='GET'?'get':'ws';
    const sc=r.status<300?'s2':r.status<500?'s4':'s1';
    div.innerHTML=`<span class="nr-method ${mc}">${r.method}</span><span class="nr-url">${r.url}</span><span class="nr-status ${sc}">${r.status}</span><span class="nr-type">${r.type}</span><span class="nr-time">${r.time}ms</span>`;
    div.addEventListener('click',()=>{S.selectedReq=idx;renderNetList();showNetDetail(r);});
    list.appendChild(div);
  });
}
function showNetDetail(r){
  const d=$('net-detail');d.classList.add('show');
  d.innerHTML=`
  <div class="nd-section">
    <div class="nd-title">Request Headers</div>
    <div class="nd-row"><span class="nd-key">:method</span><span class="nd-val">${r.method}</span></div>
    <div class="nd-row"><span class="nd-key">:path</span><span class="nd-val">${r.url}</span></div>
    <div class="nd-row"><span class="nd-key">:authority</span><span class="nd-val">api.ofa-panel.net</span></div>
    <div class="nd-row"><span class="nd-key">x-ofa-token</span><span class="nd-val">eyJhbGci...redacted</span></div>
    <div class="nd-row"><span class="nd-key">x-session-id</span><span class="nd-val">sess_${Math.random().toString(36).slice(2,9)}</span></div>
  </div>
  <div class="nd-section">
    <div class="nd-title">Response Headers</div>
    <div class="nd-row"><span class="nd-key">:status</span><span class="nd-val green">${r.status} OK</span></div>
    <div class="nd-row"><span class="nd-key">x-ssl-cipher</span><span class="nd-val">TLS_AES_256_GCM_SHA384</span></div>
    <div class="nd-row"><span class="nd-key">x-proxy-node</span><span class="nd-val">BR-SP-${rnd(1,9).toString().padStart(2,'0')}</span></div>
    <div class="nd-row"><span class="nd-key">x-request-id</span><span class="nd-val">req_${Math.random().toString(36).slice(2,10)}</span></div>
  </div>`;
}

// ══════════════════════════════════════════
//  INJECT  
// ══════════════════════════════════════════
const INJECT_STAGES=['Init','Bypass','SSL','Modules','Done'];
const INJECT_STEPS=[
  {pct:3,  msg:'Initializing OFA engine v9.1...',          cls:''},
  {pct:7,  msg:'Scanning process: [ff_bgservice.exe]',     cls:''},
  {pct:11, msg:'Attaching to PID 0x'+rnd(0x3000,0x9FFF).toString(16).toUpperCase()+'... OK', cls:''},
  {pct:15, msg:'Loading memory offsets [FF v1.104.1]...',  cls:''},
  {pct:20, msg:'Offset base confirmed: 0x2A4F80',          cls:''},
  {pct:25, msg:'Bypassing Anti-Cheat layer [ACE v3.2]...', cls:'warn'},
  {pct:30, msg:'ACE signature check: PATCHED',             cls:''},
  {pct:35, msg:'EAC heartbeat spoofed: OK',                cls:''},
  {pct:39, msg:'SSL tunnel: opening TLS 1.3 socket...',    cls:''},
  {pct:43, msg:'TLS handshake: api.ofa-panel.net — OK',    cls:''},
  {pct:47, msg:'Certificate pinning: bypassed',            cls:'warn'},
  {pct:51, msg:'Rotating IP: '+rndIp()+' → '+rndIp(),     cls:''},
  {pct:55, msg:'Proxy chain validated: US→JP→BR→MX',       cls:''},
  {pct:59, msg:'Loading Aimbot Mobile module...',          cls:''},
  {pct:62, msg:'Aim-Lock 50% calibration: OK',             cls:''},
  {pct:65, msg:'Injecting Recoil Reducer [SSL]...',        cls:''},
  {pct:68, msg:'IP-Rotation daemon: started',              cls:''},
  {pct:71, msg:'Anti-Ban SSL heartbeat: running',          cls:''},
  {pct:74, msg:'Delete Fake Reports hook: installed',      cls:''},
  {pct:77, msg:'Aim Assist RES — resolution mapped',       cls:''},
  {pct:80, msg:'Aimbot SSL — aim vectors encrypted',       cls:''},
  {pct:83, msg:'Aim [Proxy] — proxy chain linked',         cls:''},
  {pct:86, msg:'Writing hooks to game memory...',          cls:'warn'},
  {pct:89, msg:'Hook integrity check: PASS',               cls:''},
  {pct:92, msg:'Flushing detection event logs...',         cls:''},
  {pct:95, msg:'Verifying module checksums: valid',        cls:''},
  {pct:98, msg:'Smoke test: aim vectors nominal',          cls:''},
  {pct:100,msg:'INJECTION COMPLETE — PLUS ULTRA',          cls:'done'},
];

const NET_STEPS=[
  {m:'POST',u:'/api/v2/ssl/handshake',s:200,t:'ssl',ms:rnd(18,60)},
  {m:'POST',u:'/api/v2/acbypass/init',s:200,t:'ssl',ms:rnd(40,120)},
  {m:'GET', u:'/api/v2/offsets/ff1104',s:200,t:'api',ms:rnd(20,70)},
  {m:'POST',u:'/api/v2/proxy/rotate',s:200,t:'ssl',ms:rnd(30,90)},
  {m:'POST',u:'/api/v2/modules/load',s:200,t:'api',ms:rnd(25,80)},
  {m:'POST',u:'/api/v2/evasion/patch',s:200,t:'ssl',ms:rnd(50,140)},
  {m:'WSS', u:'wss://rt.ofa-panel.net/live',s:101,t:'ws',ms:rnd(15,50)},
  {m:'POST',u:'/api/v2/heartbeat',s:200,t:'ssl',ms:rnd(10,40)},
  {m:'POST',u:'/api/v2/aim/calibrate',s:200,t:'api',ms:rnd(22,75)},
  {m:'POST',u:'/api/v2/ssl/verify',s:200,t:'ssl',ms:rnd(18,55)},
];

let injRunning=false,injEs=null,pktInterval=null;

function startInject(){
  if(injRunning)return;
  injRunning=true;
  $('inject-overlay').classList.remove('hidden');
  $('inj-log').innerHTML='';
  $('inj-net').innerHTML='';
  $('inj-bar').style.width='0%';
  $('inj-pct').textContent='0%';
  $('inj-phase').textContent='Phase 1 / 5';
  $('inj-close').classList.add('hidden');
  $('inj-running').classList.remove('hidden');
  $('inj-stage-label').textContent='Initializing...';
  $('ssl-packets').textContent='0';
  $('ssl-chain').textContent='US→JP→BR→MX';

  // Build stage pills
  const stagesEl=$('inj-stages');stagesEl.innerHTML='';
  INJECT_STAGES.forEach((_,i)=>{const d=document.createElement('div');d.className='inj-stage';d.id=`stage-${i}`;stagesEl.appendChild(d);});

  let pkt=0,netIdx=0;
  pktInterval=setInterval(()=>{pkt+=rnd(3,12);$('ssl-packets').textContent=pkt;},220);

  injEs=new EventSource('/api/inject');
  injEs.onmessage=e=>{
    const{pct,msg,phase}=JSON.parse(e.data);
    // progress bar
    $('inj-bar').style.width=`${pct}%`;
    $('inj-pct').textContent=`${pct}%`;
    const ph=Math.min(Math.ceil(pct/20),5);
    $('inj-phase').textContent=`Phase ${ph} / 5`;
    $('inj-stage-label').textContent=INJECT_STAGES[ph-1]||'Done';

    // stage pills
    for(let i=0;i<5;i++){
      const s=$(`stage-${i}`);if(!s)continue;
      s.className='inj-stage'+(i<ph-1?' done':i===ph-1?' active':'');
    }

    // log line
    const step=INJECT_STEPS.find(s=>s.pct===pct)||{cls:''};
    const line=document.createElement('div');
    line.className=`il${step.cls?' '+step.cls:''}`;
    line.innerHTML=`<span class="il-p">${String(pct).padStart(3,' ')}%</span><span class="il-m">${msg}</span>`;
    const log=$('inj-log');log.appendChild(line);log.scrollTop=log.scrollHeight;

    // network request
    if(netIdx<NET_STEPS.length){
      const nr=NET_STEPS[netIdx++];
      const nreq=document.createElement('div');nreq.className='inj-req';
      const mc=nr.m==='POST'?'post':nr.m==='GET'?'get':'wss';
      nreq.innerHTML=`<span class="irm ${mc}">${nr.m}</span><span class="iru"><em>${nr.u}</em></span><span class="irs">${nr.s}</span><span class="irt">${nr.ms}ms</span>`;
      const net=$('inj-net');net.appendChild(nreq);net.scrollTop=net.scrollHeight;
      addNetReq(nr.m,nr.u,nr.s,nr.t,nr.ms);
    }

    // random extra net requests during injection
    if(Math.random()<.4){
      const ep=FAKE_ENDPOINTS[rnd(0,FAKE_ENDPOINTS.length-1)];
      setTimeout(()=>addNetReq(ep.m,ep.u,200,ep.t,rnd(10,120)),rnd(100,600));
    }
  };

  injEs.addEventListener('done',()=>{
    injEs.close();injRunning=false;
    clearInterval(pktInterval);
    $(`stage-4`).className='inj-stage done';
    $('inj-close').classList.remove('hidden');
    $('inj-running').classList.add('hidden');
    $('inj-stage-label').textContent='Complete';
    consoleLog('<span class="cl-ok">[INJECT]</span> <span class="cl-tx">Pipeline complete — PLUS ULTRA</span>');
    // activate all modules
    FEATURES.forEach(f=>{S.active[f.id]=true;});
    buildFeatures();updateCounts();
  });
  injEs.onerror=()=>{injEs.close();injRunning=false;clearInterval(pktInterval);};
}

function closeInject(){
  $('inject-overlay').classList.add('hidden');
  $('inj-bar').style.width='0%';
  $('inj-pct').textContent='0%';
  $('inj-log').innerHTML='';
  $('inj-net').innerHTML='';
  $('ssl-packets').textContent='0';
  $('inj-close').classList.add('hidden');
  $('inj-running').classList.remove('hidden');
}
