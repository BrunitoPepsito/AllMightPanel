const express = require('express');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = 3000;

// ── CONFIG ──────────────────────────────────────────────────────────────────
const PASSWORD   = 'PLUSULTRA';

// Pon aquí la ruta absoluta de tu imagen de All Might (jpg/png/gif/webp)
// Ejemplo Windows : 'C:/Users/TuNombre/Pictures/allmight.png'
// Ejemplo Mac/Linux: '/home/TuNombre/Pictures/allmight.png'
const ALL_MIGHT_IMAGE_PATH = path.join(__dirname, 'assets', 'allmight.png');
// ────────────────────────────────────────────────────────────────────────────

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/* ── API: login ── */
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === PASSWORD) {
    res.json({ ok: true });
  } else {
    res.status(401).json({ ok: false, message: 'ACCESS DENIED' });
  }
});

/* ── API: serve All Might image from backend ── */
app.get('/api/allmight', (req, res) => {
  if (fs.existsSync(ALL_MIGHT_IMAGE_PATH)) {
    res.sendFile(ALL_MIGHT_IMAGE_PATH);
  } else {
    res.status(404).json({ error: 'Image not found' });
  }
});

/* ── API: fake injection log stream (Server-Sent Events) ── */
app.get('/api/inject', (req, res) => {
  res.setHeader('Content-Type',  'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection',    'keep-alive');

  const steps = [
    { pct:  3,  msg: 'Initializing OFA engine v9.1...',              delay: 300  },
    { pct:  8,  msg: 'Loading memory offsets [FF_v1.104.1]...',       delay: 600  },
    { pct: 14,  msg: 'Scanning process: [ff_bgservice.exe]',          delay: 500  },
    { pct: 19,  msg: 'Attaching to PID 0x3FA2... OK',                 delay: 400  },
    { pct: 25,  msg: 'Bypassing Anti-Cheat layer [ACE v3.2]...',      delay: 700  },
    { pct: 31,  msg: 'SSL tunnel established [AES-256-GCM]',          delay: 500  },
    { pct: 36,  msg: 'IP rotation: 189.x.x.x → 103.x.x.x... OK',    delay: 800  },
    { pct: 42,  msg: 'Patching EAC signature check... bypassed',      delay: 600  },
    { pct: 48,  msg: 'Loading Aimbot Mobile module...',               delay: 500  },
    { pct: 54,  msg: 'Aim-Lock 50% calibration: OK',                  delay: 400  },
    { pct: 59,  msg: 'Injecting Recoil Reducer [SSL]...',             delay: 600  },
    { pct: 64,  msg: 'Proxy chain: [US→JP→BR] active',               delay: 500  },
    { pct: 69,  msg: 'Report shield: DELETE_FAKE_REPORTS active',     delay: 700  },
    { pct: 74,  msg: 'Aim Assist RES module loaded',                  delay: 400  },
    { pct: 79,  msg: 'Anti-Ban SSL heartbeat: running',               delay: 600  },
    { pct: 84,  msg: 'Verifying module checksums... valid',           delay: 500  },
    { pct: 89,  msg: 'Writing hooks to game memory... done',          delay: 700  },
    { pct: 93,  msg: 'Smoke test: aim vectors nominal',               delay: 500  },
    { pct: 97,  msg: 'Flushing detection logs...',                    delay: 600  },
    { pct: 100, msg: 'INJECTION COMPLETE — PLUS ULTRA',               delay: 400  },
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
  next();
});

/* ── SPA fallback ── */
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  ⚡  OFA Panel Z corriendo en http://localhost:${PORT}\n`);
});
