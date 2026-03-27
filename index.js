const express = require('express');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = 3000;

// ── CONFIG ──────────────────────────────────────────────────────
const PASSWORD = 'PLUSULTRA';

// Cambia esta ruta a tu imagen de All Might (jpg, png, gif, webp)
// Ejemplo: 'C:/Users/TuNombre/Pictures/allmight.png'
const ALL_MIGHT_PATH = path.join(__dirname, 'assets', 'allmight.png');
// ────────────────────────────────────────────────────────────────

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/* ── POST /api/login ── */
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === PASSWORD) return res.json({ ok: true });
  res.status(401).json({ ok: false, message: 'ACCESS DENIED — INVALID KEY' });
});

/* ── GET /api/allmight — serve image from backend ── */
app.get('/api/allmight', (req, res) => {
  // Try common extensions if exact file not found
  const exts = ['png','jpg','jpeg','gif','webp'];
  const base  = path.join(__dirname, 'assets', 'allmight');
  
  for (const ext of exts) {
    const p = `${base}.${ext}`;
    if (fs.existsSync(p)) return res.sendFile(p);
  }
  // Also try exact configured path
  if (fs.existsSync(ALL_MIGHT_PATH)) return res.sendFile(ALL_MIGHT_PATH);
  
  res.status(404).json({ error: 'Image not found. Add assets/allmight.png' });
});

/* ── GET /api/inject — Server-Sent Events pipeline ── */
app.get('/api/inject', (req, res) => {
  res.setHeader('Content-Type',  'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection',    'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  const steps = [
    { pct:3,   msg:'Initializing OFA engine v9.1...',                      delay:320  },
    { pct:7,   msg:'Scanning process: [ff_bgservice.exe]',                 delay:500  },
    { pct:11,  msg:`Attaching to PID 0x${(Math.random()*0x9FFF+0x3000|0).toString(16).toUpperCase()}... OK`, delay:420 },
    { pct:15,  msg:'Loading memory offsets [FF v1.104.1]...',               delay:560  },
    { pct:20,  msg:'Offset base confirmed: 0x2A4F80',                      delay:380  },
    { pct:25,  msg:'Bypassing Anti-Cheat layer [ACE v3.2]...',             delay:720  },
    { pct:30,  msg:'ACE signature check: PATCHED',                         delay:440  },
    { pct:35,  msg:'EAC heartbeat spoofed: OK',                            delay:390  },
    { pct:39,  msg:'SSL tunnel: opening TLS 1.3 socket...',                delay:480  },
    { pct:43,  msg:'TLS handshake: api.ofa-panel.net — 200 OK',            delay:620  },
    { pct:47,  msg:'Certificate pinning bypass: applied',                   delay:510  },
    { pct:51,  msg:'IP rotation: proxy chain US→JP→BR→MX — active',        delay:580  },
    { pct:55,  msg:'Proxy tunnel validated — latency: 34ms',               delay:430  },
    { pct:59,  msg:'Loading Aimbot Mobile module...',                      delay:490  },
    { pct:62,  msg:'Aim-Lock 50% calibration: OK',                         delay:360  },
    { pct:65,  msg:'Injecting Recoil Reducer [SSL]...',                    delay:520  },
    { pct:68,  msg:'IP-Rotation daemon: started (PID 0x4A2B)',             delay:400  },
    { pct:71,  msg:'Anti-Ban SSL heartbeat: running — interval 5s',        delay:550  },
    { pct:74,  msg:'Delete Fake Reports hook: installed',                  delay:410  },
    { pct:77,  msg:'Aim Assist RES — resolution mapped: 1920x1080',        delay:480  },
    { pct:80,  msg:'Aimbot SSL — aim vectors routed over TLS',             delay:460  },
    { pct:83,  msg:'Aim [Proxy] — proxy chain linked: OK',                 delay:430  },
    { pct:86,  msg:'Writing hooks to game memory...',                      delay:600  },
    { pct:89,  msg:'Hook integrity check: PASS',                           delay:380  },
    { pct:92,  msg:'Flushing detection event logs...',                     delay:520  },
    { pct:95,  msg:'Verifying module checksums: valid',                    delay:440  },
    { pct:98,  msg:'Smoke test: aim vectors nominal — all checks passed',  delay:500  },
    { pct:100, msg:'INJECTION COMPLETE — PLUS ULTRA',                      delay:300  },
  ];

  let i = 0;
  function next() {
    if (i >= steps.length) {
      res.write('event: done\ndata: {}\n\n');
      res.end();
      return;
    }
    const step = steps[i++];
    res.write(`data: ${JSON.stringify(step)}\n\n`);
    setTimeout(next, step.delay);
  }

  req.on('close', () => res.end());
  next();
});

/* ── SPA fallback ── */
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

/* ── Create assets folder if missing ── */
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir);

app.listen(PORT, () => {
  console.log('\n  ╔══════════════════════════════════════╗');
  console.log('  ║   OFA PANEL Z — v9.1.0               ║');
  console.log('  ║   One For All Edition · Free Fire     ║');
  console.log(`  ║   http://localhost:${PORT}              ║`);
  console.log('  ║   Password: PLUSULTRA                 ║');
  console.log('  ╚══════════════════════════════════════╝\n');
  console.log(`  Imagen All Might: ${ALL_MIGHT_PATH}`);
  console.log(`  Imagen encontrada: ${fs.existsSync(ALL_MIGHT_PATH) ? 'SI' : 'NO — agrega assets/allmight.png'}\n`);
});
