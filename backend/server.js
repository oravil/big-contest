/**
 * server.js — Express application entrypoint.
 *
 * - CORS: localhost:5173 in dev, FRONTEND_URL in production.
 * - Mounts: /api/winners, /api/check-code, /api/lookup, /api/redeem, /api/admin, /api/health.
 * - Serves frontend/dist statically in production with SPA fallback.
 * - Port: process.env.PORT || 3001.
 * - DATA_PATH env var → path to winners.json (default: ./backend/data/winners.json).
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const winnersRouter = require('./routes/winners');
const checkCodeRouter = require('./routes/checkCode');
const lookupRouter = require('./routes/lookup');
const redeemRouter = require('./routes/redeem');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// CORS:
//  - Development: localhost:5173 (Vite dev server).
//  - Production: FRONTEND_URL — accepts a single origin OR a comma-separated
//    list (handy for Vercel preview URLs, e.g.
//    "https://big-shawerma.vercel.app,https://*.vercel.app").
const parseAllowedOrigins = () => {
  if (NODE_ENV !== 'production') return 'http://localhost:5173';
  const raw = process.env.FRONTEND_URL || '';
  const list = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (list.length === 0) return false; // refuse all if not configured
  if (list.length === 1 && !list[0].includes('*')) return list[0];

  // Custom matcher to support wildcard subdomains like https://*.vercel.app
  const matchers = list.map((entry) => {
    if (entry.includes('*')) {
      const escaped = entry
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*');
      return new RegExp(`^${escaped}$`);
    }
    return entry;
  });

  return (origin, cb) => {
    if (!origin) return cb(null, true); // same-origin / curl
    const ok = matchers.some((m) =>
      m instanceof RegExp ? m.test(origin) : m === origin
    );
    cb(ok ? null : new Error('Not allowed by CORS'), ok);
  };
};

const corsOptions = {
  origin: parseAllowedOrigins(),
  allowedHeaders: ['Content-Type', 'X-Admin-Password'],
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10kb' }));

// Health endpoint.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes.
app.use('/api/winners', winnersRouter);
app.use('/api/check-code', checkCodeRouter);
app.use('/api/lookup', lookupRouter);
app.use('/api/redeem', redeemRouter);
app.use('/api/admin', adminRouter);

// Serve the built frontend in production.
if (NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'frontend', 'dist');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));

    // SPA fallback for non-API routes.
    app.get(/^\/(?!api\/).*/, (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

// Generic 404 for unmatched API routes.
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'المسار غير موجود' });
});

// Last-resort error handler — never leak stack traces or passwords.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(500).json({ error: 'خطأ في الخادم' });
});

// One-time auto-expire pass on startup so the data file matches today's truth
// without competing with admin writes during request handling.
//
// Also seeds the data file from the bundled default if it is missing — useful
// when DATA_PATH points to a fresh persistent disk on the first boot.
try {
  const winnersModule = require('./routes/winners');
  const dataPath = winnersModule.DATA_PATH;

  if (!fs.existsSync(dataPath)) {
    const seedPath = path.join(__dirname, 'data', 'winners.json');
    if (fs.existsSync(seedPath) && seedPath !== dataPath) {
      fs.mkdirSync(path.dirname(dataPath), { recursive: true });
      fs.copyFileSync(seedPath, dataPath);
      console.log(`📦 Seeded data file at ${dataPath} from bundled default.`);
    }
  }

  const data = winnersModule.readData();
  if (winnersModule.autoExpire(data)) {
    winnersModule.writeData(data);
    console.log('🕒 Auto-expired stale winners on startup.');
  }
} catch (err) {
  console.warn('⚠️  Startup data init skipped:', err.message);
}

app.listen(PORT, () => {
  console.log(`🚀 Big Shawerma API listening on port ${PORT} [${NODE_ENV}]`);
});

module.exports = app;
