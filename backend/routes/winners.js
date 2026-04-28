/**
 * routes/winners.js — GET /api/winners (public).
 *
 * - No auth required.
 * - Computes "expired" status on-the-fly for past-expiry actives, but does
 *   NOT persist the change here — admin writes own the data file. The
 *   one-time autoExpire pass at server startup keeps the file consistent.
 * - Strips the "code" and "phone" fields from every winner.
 * - Strips the entire "teams" object from the response.
 */

const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const DATA_PATH =
  process.env.DATA_PATH ||
  path.join(__dirname, '..', 'data', 'winners.json');

const readData = () => JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
const writeData = (data) =>
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');

// Today in Africa/Cairo as YYYY-MM-DD (string-comparable to expiry_date).
const cairoToday = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' });

// Mutates data in place. Returns true if any winner was newly expired.
const autoExpire = (data) => {
  const today = cairoToday();
  let changed = false;
  for (const w of data.winners) {
    if (w.status === 'active' && today > w.expiry_date) {
      w.status = 'expired';
      changed = true;
    }
  }
  return changed;
};

router.get('/', (req, res) => {
  let data;
  try {
    data = readData();
  } catch (err) {
    return res.status(500).json({ error: 'خطأ في الخادم' });
  }

  // Compute expirations in memory only for this response.
  // Persistence is owned by admin/redeem (via safeWrite) and the startup pass.
  autoExpire(data);

  // Strip "code" and "phone" from each winner; strip "teams" entirely.
  const safeWinners = data.winners.map((w) => {
    const { code, phone, ...rest } = w;
    return rest;
  });

  return res.json({
    contest: data.contest,
    winners: safeWinners,
  });
});

module.exports = router;
module.exports.autoExpire = autoExpire;
module.exports.cairoToday = cairoToday;
module.exports.readData = readData;
module.exports.writeData = writeData;
module.exports.DATA_PATH = DATA_PATH;
