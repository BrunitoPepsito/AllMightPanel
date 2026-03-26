'use strict';

/* ══════════════════════════════════════════════
   OFA PANEL Z — client/panel.js
   ══════════════════════════════════════════════ */

// ── Feature definitions ──────────────────────
const FEATURES = [
  { id:'aimbot_mobile',  name:'Aimbot Mobile',        tag:'MOBILE',  icon:'crosshair' },
  { id:'aim_lock',       name:'Aim-Lock 50%',          tag:'LOCK',    icon:'lock'      },
  { id:'del_reports',    name:'Delete Fake Reports',   tag:'REPORT',  icon:'shield'    },
  { id:'anti_ban',       name:'Anti-Ban SSL',          tag:'SSL',     icon:'ban'       },
  { id:'ip_rotation',   name:'IP-Rotation',           tag:'PROXY',   icon:'refresh'   },
  { id:'aimbot_ssl',    name:'Aimbot SSL',            tag:'SSL',     icon:'aim'       },
  { id:'aim_assist',    name:'Aim Assist (RES)',      tag:'RES',     icon:'target'    },
  { id:'recoil',        name:'Recoil Reducer SSL',   tag:'SSL',     icon:'wave'      },
  { id:'aim_proxy',     name:'Aim [Proxy]',          tag:'PROXY',   icon:'globe'     },
];

// SVG icons keyed by name
const ICONS = {
  crosshair:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>`,
  lock:     `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  shield:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  ban:      `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`,
  refresh:  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`,
  aim:      `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>`,
  target:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  wave:     `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  globe:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
};

// ── State ────────────────────────────────────
const state = { active: {}, sessionStart: Date.now() };
FEATURES.forEach(f => state.active[f.id] = false);

// ── DOM refs ─────────────────────────────────
const $ = id => document.getElementById(id);

const elLogin    = $('screen-login');
const elPanel    = $('screen-panel');
const elPassIn   = $('pass-input');
const elLoginBtn = $('login-btn');
const elLoginErr = $('login-error');

// ══════════════════════════════════════════════
//  BACKGROUND CANVAS — outer dark particles
// ══════════════════════════════════════════════
(function bgCanvas() {
  const c   = $('bg-canvas');
  const ctx = c.getContext('2d');
  let W, H;

  const resize = () => { W = c.width = innerWidth; H = c.height = innerHeight; };
  resize(); addEventListener('resize', resize);

  const pts = Array.from({ length: 55 }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    vx: (Math.random() - .5) * .3,
    vy: (Math.random() - .5) * .3,
    r:  Math.random() * 1.4 + .4,
    a:  Math.random() * .6 + .1,
  }));

  (function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#07070d';
    ctx.fillRect(0, 0, W, H);

    pts.forEach(p => {
      p.x = (p.x + p.vx + W) % W;
      p.y = (p.y + p.vy + H) % H;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(240,180,41,${p.a * .45})`;
      ctx.fill();
    });

    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 110) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(240,180,41,${(1 - d / 110) * .09})`;
          ctx.lineWidth   = .5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  })();
})();

// ══════════════════════════════════════════════
//  LOGIN CANVAS — dense inner background
// ══════════════════════════════════════════════
(function loginCanvas() {
  const c   = $('login-canvas');
  const ctx = c.getContext('2d');
  let W, H;
  const resize = () => {
    W = c.width  = c.parentElement.offsetWidth;
    H = c.height = c.parentElement.offsetHeight;
  };
  resize(); addEventListener('resize', resize);

  const pts = Array.from({ length: 80 }, () => ({
    x: Math.random() * 1920, y: Math.random() * 1080,
    vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25,
    r: Math.random() * 1.2 + .3, a: Math.random() * .5 + .05,
  }));

  (function draw() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach(p => {
      p.x = (p.x + p.vx + W) % W;
      p.y = (p.y + p.vy + H) % H;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(240,180,41,${p.a * .35})`; ctx.fill();
    });
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < 90) {
        ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
        ctx.strokeStyle = `rgba(240,180,41,${(1 - d / 90) * .07})`; ctx.lineWidth = .4; ctx.stroke();
      }
    }
    requestAnimationFrame(draw);
  })();
})();

// ══════════════════════════════════════════════
//  ALL MIGHT FRAME — particle canvas inside
// ══════════════════════════════════════════════
function initParticleCanvas() {
  const c   = $('particle-canvas');
  const frame = $('am-frame');
  if (!c || !frame) return;
  const ctx = c.getContext('2d');
  let W, H;

  const sync = () => {
    W = c.width  = frame.offsetWidth;
    H = c.height = frame.offsetHeight;
  };
  sync(); addEventListener('resize', sync);

  const pts = Array.from({ length: 38 }, () => ({
    x: Math.random() * 400, y: Math.random() * 300,
    vx: (Math.random() - .5) * .5, vy: (Math.random() - .5) * .5,
    r: Math.random() * 1.5 + .4, a: Math.random() * .7 + .2,
  }));

  (function draw() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach(p => {
      p.x = (p.x + p.vx + W) % W;
      p.y = (p.y + p.vy + H) % H;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(240,180,41,${p.a * .6})`; ctx.fill();
    });
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < 75) {
        ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
        ctx.strokeStyle = `rgba(240,180,41,${(1 - d / 75) * .18})`; ctx.lineWidth = .6; ctx.stroke();
      }
    }
    requestAnimationFrame(draw);
  })();
}

// ══════════════════════════════════════════════
//  LOGIN
// ══════════════════════════════════════════════
async function doLogin() {
  const pw = elPassIn.value.trim();
  if (!pw) return;
  elLoginBtn.disabled = true;
  try {
    const r  = await fetch('/api/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    });
    const d  = await r.json();
    if (d.ok) {
      elLogin.classList.add('hidden');
      elPanel.classList.remove('hidden');
      initPanel();
    } else {
      showLoginErr(d.message || 'ACCESS DENIED');
    }
  } catch {
    showLoginErr('CONNECTION ERROR');
  }
  elLoginBtn.disabled = false;
}

function showLoginErr(msg) {
  elLoginErr.textContent = msg;
  elPassIn.value = '';
  elPassIn.focus();
  setTimeout(() => elLoginErr.textContent = '', 3000);
}

elLoginBtn.addEventListener('click', doLogin);
elPassIn.addEventListener('keydown', e => e.key === 'Enter' && doLogin());

// ══════════════════════════════════════════════
//  PANEL INIT
// ══════════════════════════════════════════════
function initPanel() {
  buildFeatures();
  initParticleCanvas();
  startSessionTimer();
  startPingSimulator();
  startSysLog();
  spawnRandomFakeIP();
}

// ── Features ─────────────────────────────────
function buildFeatures() {
  const list = $('features-list');
  list.innerHTML = '';
  FEATURES.forEach(f => {
    const on  = state.active[f.id];
    const div = document.createElement('div');
    div.className = `feat-item${on ? ' on' : ''}`;
    div.dataset.id = f.id;
    div.innerHTML  = `
      <div class="feat-icon">${ICONS[f.icon]}</div>
      <span class="feat-name">${f.name}</span>
      <span class="feat-tag">${f.tag}</span>
      <div class="toggle${on ? ' on' : ''}"></div>`;
    div.addEventListener('click', () => toggleFeature(f.id));
    list.appendChild(div);
  });
  updateCounts();
}

function toggleFeature(id) {
  state.active[id] = !state.active[id];
  const on  = state.active[id];
  const f   = FEATURES.find(x => x.id === id);
  const div = document.querySelector(`.feat-item[data-id="${id}"]`);
  if (div) {
    div.classList.toggle('on', on);
    div.querySelector('.toggle').classList.toggle('on', on);
  }
  updateCounts();
  sysLog(on
    ? `<span class="ok">[OK]</span> ${f.name} — módulo activado`
    : `<span class="warn">[--]</span> ${f.name} — módulo desactivado`
  );
}

function updateCounts() {
  const n = Object.values(state.active).filter(Boolean).length;
  $('modules-count').textContent       = `${n} / ${FEATURES.length}`;
  $('stat-modules').textContent        = n;
  $('footer-modules-status').textContent = `${n} module${n !== 1 ? 's' : ''} active`;
  $('stat-status').textContent  = n > 0 ? 'INJECTED' : 'SAFE';
  $('stat-status').style.color  = n > 0 ? 'var(--gold)' : 'var(--green)';
}

// ── Session timer ─────────────────────────────
function startSessionTimer() {
  setInterval(() => {
    const s = Math.floor((Date.now() - state.sessionStart) / 1000);
    const h = String(Math.floor(s / 3600)).padStart(2,'0');
    const m = String(Math.floor((s % 3600) / 60)).padStart(2,'0');
    $('stat-session').textContent = `${h}:${m}`;
    $('hdr-time').textContent     = `${h}:${m}:${String(s % 60).padStart(2,'0')}`;
  }, 1000);
}

// ── Ping sim ──────────────────────────────────
function startPingSimulator() {
  let base = 28 + Math.random() * 30;
  setInterval(() => {
    base += (Math.random() - .48) * 4;
    base  = Math.max(14, Math.min(base, 90));
    $('stat-ping').textContent = `${Math.round(base)} ms`;
  }, 1800);
}

// ── Fake IP in header ─────────────────────────
function spawnRandomFakeIP() {
  const rnd = () => Math.floor(Math.random() * 200) + 20;
  $('hdr-ip').textContent = `${rnd()}.${rnd()}.${rnd()}.${rnd()}`;
  setInterval(() => {
    $('hdr-ip').textContent = `${rnd()}.${rnd()}.${rnd()}.${rnd()}`;
  }, 45000);
}

// ── System log ───────────────────────────────
const LOG_ENTRIES = [
  '<span class="ok">[OK]</span> OFA engine v9.1 loaded',
  '<span class="ok">[OK]</span> SSL tunnel active [AES-256]',
  '<span class="ok">[OK]</span> IP rotation initialized',
  '<span class="warn">[!!]</span> Anti-cheat heartbeat: nominal',
  '<span class="ok">[OK]</span> Memory offsets up to date',
  '<span class="ok">[OK]</span> Proxy chain verified',
  '<span class="warn">[!!]</span> Report filter: standing by',
  '<span class="ok">[OK]</span> Session authenticated',
];
let logIdx = 0;

function startSysLog() {
  LOG_ENTRIES.forEach((e, i) => setTimeout(() => sysLog(e), i * 380));
  logIdx = LOG_ENTRIES.length;
}

function sysLog(html) {
  const box  = $('sys-log');
  const ts   = new Date().toLocaleTimeString('en-GB', { hour12: false });
  const line = document.createElement('div');
  line.className   = 'log-line';
  line.innerHTML   = `<span class="ts">${ts}</span>${html}`;
  box.appendChild(line);
  box.scrollTop    = box.scrollHeight;
  // keep max 60 entries
  while (box.children.length > 60) box.removeChild(box.firstChild);
}

// ══════════════════════════════════════════════
//  INJECT — Server-Sent Events
// ══════════════════════════════════════════════
const elOverlay   = $('inject-overlay');
const elInjectBtn = $('inject-btn');
const elInjBar    = $('inj-bar');
const elInjPct    = $('inj-pct');
const elInjLog    = $('inj-log');
const elInjClose  = $('inj-close');

elInjectBtn.addEventListener('click', startInject);
elInjClose.addEventListener('click', () => {
  elOverlay.classList.add('hidden');
  elInjLog.innerHTML = '';
  elInjBar.style.width = '0%';
  elInjPct.textContent = '0%';
  elInjClose.classList.add('hidden');
});

function startInject() {
  elOverlay.classList.remove('hidden');
  elInjLog.innerHTML   = '';
  elInjBar.style.width = '0%';
  elInjPct.textContent = '0%';
  elInjClose.classList.add('hidden');

  const es = new EventSource('/api/inject');

  es.onmessage = e => {
    const { pct, msg } = JSON.parse(e.data);

    elInjBar.style.width = `${pct}%`;
    elInjPct.textContent = `${pct}%`;

    const line = document.createElement('div');
    line.className = `inj-line${pct === 100 ? ' done' : ''}`;
    line.innerHTML = `<span class="il-pct">${String(pct).padStart(3,' ')}%</span><span class="il-msg">${msg}</span>`;
    elInjLog.appendChild(line);
    elInjLog.scrollTop = elInjLog.scrollHeight;
  };

  es.addEventListener('done', () => {
    es.close();
    elInjClose.classList.remove('hidden');
    sysLog('<span class="ok">[OK]</span> Injection pipeline complete — PLUS ULTRA');
    updateCounts();
  });

  es.onerror = () => es.close();
}
