/**
 * routes/admin.js — admin management endpoints (mounted at /api/admin).
 *
 * All routes require the X-Admin-Password header (validated by adminAuth),
 * EXCEPT /login which validates the password and returns the team name.
 * Admin password is never returned in any response.
 *
 * Endpoints:
 *   POST   /login                   → { ok, teamNameAr }
 *   GET    /winners                 → { winners } (WITH codes)
 *   POST   /winners                 → create new winner (auto-generated code)
 *   PUT    /winners/:id             → update editable fields
 *   DELETE /winners/:id             → permanently delete winner
 *   PUT    /winners/:id/status      → change status (active|redeemed|expired|cancelled)
 *   GET    /teams                   → { teams } (passwords masked as "***")
 *   POST   /teams                   → add a new team
 *   PUT    /teams/:key              → update password and/or name_ar
 *   DELETE /teams/:key              → delete team (admin team is protected)
 *   GET    /export                  → download winners.json as a file
 */

const express = require('express');
const fs = require('fs');
const path = require('path');

const adminAuth = require('../middleware/adminAuth');
const winnersModule = require('./winners');

const { readData, DATA_PATH } = winnersModule;

const router = express.Router();

// ---------- Local async write lock (also used by redeem in step 4) ----------
//
// Prevents interleaved writes to winners.json during concurrent requests.
// Synchronous fs.writeFileSync is atomic on a single OS write call, but the
// read-modify-write sequence is not — this mutex guards the whole sequence.

let writing = false;

const safeWrite = async (data) => {
  while (writing) {
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, 50));
  }
  writing = true;
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
  } finally {
    writing = false;
  }
};

// ---------- Code generator (BIG-XXX-0000) ----------

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DENYLIST = new Set([
  'ASS', 'FUK', 'FUC', 'FCK', 'SHT', 'SXX', 'XXX', 'NIG', 'CNT',
  'DIK', 'DCK', 'CUM', 'JIZ', 'TIT', 'GAY', 'FAG', 'HOE', 'PIS',
]);

const randInt = (max) => Math.floor(Math.random() * max);

const generateLetters = () => {
  for (let i = 0; i < 50; i++) {
    const c =
      LETTERS[randInt(26)] + LETTERS[randInt(26)] + LETTERS[randInt(26)];
    if (!DENYLIST.has(c)) return c;
  }
  return 'WNR';
};

const generateCode = () =>
  `BIG-${generateLetters()}-${String(randInt(10000)).padStart(4, '0')}`;

const generateUniqueCode = (existingCodes) => {
  const used = new Set(existingCodes);
  for (let i = 0; i < 200; i++) {
    const code = generateCode();
    if (!used.has(code)) return code;
  }
  // Extremely unlikely fallback.
  throw new Error('UNABLE_TO_GENERATE_UNIQUE_CODE');
};

// ---------- Helpers ----------

const VALID_STATUSES = new Set(['active', 'redeemed', 'expired', 'cancelled']);

// Egyptian mobile: 11 digits starting with 010/011/012/015 once normalized.
const normalizePhone = (raw) => {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.startsWith('0020')) return `0${digits.slice(4)}`;
  if (digits.startsWith('20') && digits.length === 12) return `0${digits.slice(2)}`;
  return digits;
};

const isValidEgPhone = (raw) => /^01[0125]\d{8}$/.test(normalizePhone(raw));

// Business rule: only 3 active grand prizes can exist at the same time.
const MAX_ACTIVE_GRAND_PRIZES = 3;

const countActiveGrandPrizes = (winners, excludeId = null) =>
  winners.filter(
    (w) =>
      w.prize_type === 'grand_prize' &&
      w.status === 'active' &&
      w.id !== excludeId
  ).length;

const EDITABLE_WINNER_FIELDS = [
  'name_ar',
  'public_name_ar',
  'phone',
  'prize_type',
  'prize_label_ar',
  'prize_detail_ar',
  'terms_ar',
  'min_order',
  'max_order',
  'delivery_zone',
  'branch',
  'branch_label_ar',
  'rank',
  'rank_label_ar',
  'expiry_date',
];

const nextWinnerId = (winners) => {
  let max = 0;
  for (const w of winners) {
    const m = /^W(\d+)$/.exec(w.id || '');
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > max) max = n;
    }
  }
  return `W${String(max + 1).padStart(3, '0')}`;
};

const maskTeams = (teams) => {
  const out = {};
  for (const key of Object.keys(teams)) {
    out[key] = {
      name_ar: teams[key].name_ar,
      password: '***',
    };
  }
  return out;
};

// ---------- Public route: POST /login ----------
//
// Validates the admin password and returns the team display name.
// Uses adminAuth, so a wrong password returns 401 automatically.

router.post('/login', adminAuth, (req, res) => {
  return res.json({
    ok: true,
    teamNameAr: req.team.teamNameAr,
  });
});

// ---------- All routes below require admin auth ----------

router.use(adminAuth);

// GET /winners — full list including codes.
router.get('/winners', (req, res) => {
  let data;
  try {
    data = readData();
  } catch (err) {
    return res.status(500).json({ error: 'خطأ في الخادم' });
  }
  return res.json({ winners: data.winners });
});

// POST /winners — create a new winner with auto-generated unique code.
router.post('/winners', async (req, res) => {
  let data;
  try {
    data = readData();
  } catch (err) {
    return res.status(500).json({ error: 'خطأ في الخادم' });
  }

  const body = req.body || {};

  // Required minimum fields.
  if (!body.name_ar || typeof body.name_ar !== 'string') {
    return res.status(400).json({ error: 'الاسم مطلوب' });
  }
  if (!body.phone || !isValidEgPhone(body.phone)) {
    return res.status(400).json({ error: 'رقم الهاتف غير صالح (11 رقم يبدأ بـ 010 / 011 / 012 / 015)' });
  }
  if (!body.expiry_date || typeof body.expiry_date !== 'string') {
    return res.status(400).json({ error: 'تاريخ الانتهاء مطلوب' });
  }

  const phoneNorm = normalizePhone(body.phone);
  if (data.winners.some((w) => normalizePhone(w.phone) === phoneNorm)) {
    return res.status(409).json({ error: 'رقم الهاتف مسجل بالفعل لفائز آخر' });
  }

  // New winners are always active. Enforce the grand-prize cap.
  if (
    body.prize_type === 'grand_prize' &&
    countActiveGrandPrizes(data.winners) >= MAX_ACTIVE_GRAND_PRIZES
  ) {
    return res.status(409).json({
      error: `لا يمكن إضافة أكثر من ${MAX_ACTIVE_GRAND_PRIZES} جوائز كبرى مفعّلة في وقت واحد`,
    });
  }

  let code;
  try {
    code = generateUniqueCode(data.winners.map((w) => w.code));
  } catch (err) {
    return res.status(500).json({ error: 'تعذّر توليد كود فريد' });
  }

  const newWinner = {
    id: nextWinnerId(data.winners),
    name_ar: body.name_ar,
    public_name_ar: body.public_name_ar || '',
    phone: phoneNorm,
    code,
    prize_type: body.prize_type || 'free_meal',
    prize_label_ar: body.prize_label_ar || '',
    prize_detail_ar: body.prize_detail_ar || '',
    terms_ar: body.terms_ar || '',
    min_order: body.min_order ?? null,
    max_order: body.max_order ?? null,
    delivery_zone: body.delivery_zone ?? null,
    branch: body.branch || '',
    branch_label_ar: body.branch_label_ar || '',
    rank: typeof body.rank === 'number' ? body.rank : data.winners.length + 1,
    rank_label_ar: body.rank_label_ar || '',
    expiry_date: body.expiry_date,
    status: 'active',
    redeemed_at: null,
    redeemed_at_iso: null,
    redeemed_by_team: null,
    redeemed_by_team_ar: null,
  };

  data.winners.push(newWinner);

  try {
    await safeWrite(data);
  } catch (err) {
    return res.status(500).json({ error: 'تعذّر حفظ الفائز' });
  }

  return res.status(201).json({ winner: newWinner });
});

// PUT /winners/:id — update editable fields only.
router.put('/winners/:id', async (req, res) => {
  let data;
  try {
    data = readData();
  } catch (err) {
    return res.status(500).json({ error: 'خطأ في الخادم' });
  }

  const winner = data.winners.find((w) => w.id === req.params.id);
  if (!winner) {
    return res.status(404).json({ error: 'الفائز غير موجود' });
  }

  const body = req.body || {};

  // If phone is being updated, validate format and uniqueness.
  if (Object.prototype.hasOwnProperty.call(body, 'phone')) {
    if (!isValidEgPhone(body.phone)) {
      return res.status(400).json({
        error: 'رقم الهاتف غير صالح (11 رقم يبدأ بـ 010 / 011 / 012 / 015)',
      });
    }
    const phoneNorm = normalizePhone(body.phone);
    if (
      data.winners.some(
        (w) => w.id !== winner.id && normalizePhone(w.phone) === phoneNorm
      )
    ) {
      return res.status(409).json({ error: 'رقم الهاتف مسجل بالفعل لفائز آخر' });
    }
    body.phone = phoneNorm;
  }

  for (const field of EDITABLE_WINNER_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      winner[field] = body[field];
    }
  }

  // After applying edits, re-validate the grand-prize cap if the winner is
  // active and grand_prize.
  if (
    winner.prize_type === 'grand_prize' &&
    winner.status === 'active' &&
    countActiveGrandPrizes(data.winners, winner.id) >= MAX_ACTIVE_GRAND_PRIZES
  ) {
    return res.status(409).json({
      error: `لا يمكن وجود أكثر من ${MAX_ACTIVE_GRAND_PRIZES} جوائز كبرى مفعّلة في وقت واحد`,
    });
  }

  try {
    await safeWrite(data);
  } catch (err) {
    return res.status(500).json({ error: 'تعذّر حفظ التعديلات' });
  }

  return res.json({ winner });
});

// DELETE /winners/:id — permanent delete.
router.delete('/winners/:id', async (req, res) => {
  let data;
  try {
    data = readData();
  } catch (err) {
    return res.status(500).json({ error: 'خطأ في الخادم' });
  }

  const idx = data.winners.findIndex((w) => w.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'الفائز غير موجود' });
  }

  data.winners.splice(idx, 1);

  try {
    await safeWrite(data);
  } catch (err) {
    return res.status(500).json({ error: 'تعذّر حذف الفائز' });
  }

  return res.json({ ok: true });
});

// PUT /winners/:id/status — manual status change (with optional note).
router.put('/winners/:id/status', async (req, res) => {
  const { status, note } = req.body || {};

  if (!VALID_STATUSES.has(status)) {
    return res.status(400).json({ error: 'حالة غير صالحة' });
  }

  let data;
  try {
    data = readData();
  } catch (err) {
    return res.status(500).json({ error: 'خطأ في الخادم' });
  }

  const winner = data.winners.find((w) => w.id === req.params.id);
  if (!winner) {
    return res.status(404).json({ error: 'الفائز غير موجود' });
  }

  // Reset redemption fields when moving away from "redeemed" state.
  if (status !== 'redeemed' && winner.status === 'redeemed') {
    winner.redeemed_at = null;
    winner.redeemed_at_iso = null;
    winner.redeemed_by_team = null;
    winner.redeemed_by_team_ar = null;
  }

  // Block re-activating a grand prize when the cap is already met.
  if (
    status === 'active' &&
    winner.prize_type === 'grand_prize' &&
    countActiveGrandPrizes(data.winners, winner.id) >= MAX_ACTIVE_GRAND_PRIZES
  ) {
    return res.status(409).json({
      error: `لا يمكن تفعيل أكثر من ${MAX_ACTIVE_GRAND_PRIZES} جوائز كبرى في وقت واحد`,
    });
  }

  winner.status = status;
  if (typeof note === 'string' && note.length > 0) {
    winner.admin_note = note;
  }

  try {
    await safeWrite(data);
  } catch (err) {
    return res.status(500).json({ error: 'تعذّر حفظ الحالة' });
  }

  return res.json({ winner });
});

// GET /teams — list teams with passwords masked.
router.get('/teams', (req, res) => {
  let data;
  try {
    data = readData();
  } catch (err) {
    return res.status(500).json({ error: 'خطأ في الخادم' });
  }
  return res.json({ teams: maskTeams(data.teams || {}) });
});

// POST /teams — add a new team (key + name_ar + password).
router.post('/teams', async (req, res) => {
  const { key, name_ar, password } = req.body || {};

  if (
    !key ||
    typeof key !== 'string' ||
    !/^[a-zA-Z0-9_-]+$/.test(key)
  ) {
    return res.status(400).json({ error: 'مفتاح الفريق غير صالح' });
  }
  if (!name_ar || typeof name_ar !== 'string') {
    return res.status(400).json({ error: 'اسم الفريق مطلوب' });
  }
  if (!password || typeof password !== 'string' || password.length < 4) {
    return res.status(400).json({ error: 'كلمة المرور قصيرة جداً' });
  }

  let data;
  try {
    data = readData();
  } catch (err) {
    return res.status(500).json({ error: 'خطأ في الخادم' });
  }

  data.teams = data.teams || {};
  if (data.teams[key]) {
    return res.status(409).json({ error: 'هذا المفتاح مستخدم بالفعل' });
  }

  // Reject duplicate password across teams to keep auth unambiguous.
  for (const k of Object.keys(data.teams)) {
    if (data.teams[k].password === password) {
      return res.status(409).json({ error: 'كلمة المرور مستخدمة بالفعل' });
    }
  }

  data.teams[key] = { name_ar, password };

  try {
    await safeWrite(data);
  } catch (err) {
    return res.status(500).json({ error: 'تعذّر حفظ الفريق' });
  }

  return res.status(201).json({ team: { key, name_ar, password: '***' } });
});

// PUT /teams/:key — update name_ar and/or password.
router.put('/teams/:key', async (req, res) => {
  const { name_ar, password } = req.body || {};
  const key = req.params.key;

  let data;
  try {
    data = readData();
  } catch (err) {
    return res.status(500).json({ error: 'خطأ في الخادم' });
  }

  if (!data.teams || !data.teams[key]) {
    return res.status(404).json({ error: 'الفريق غير موجود' });
  }

  if (typeof name_ar === 'string' && name_ar.length > 0) {
    data.teams[key].name_ar = name_ar;
  }

  if (typeof password === 'string' && password.length > 0) {
    if (password.length < 4) {
      return res.status(400).json({ error: 'كلمة المرور قصيرة جداً' });
    }
    // Reject if another team already uses this password.
    for (const k of Object.keys(data.teams)) {
      if (k !== key && data.teams[k].password === password) {
        return res.status(409).json({ error: 'كلمة المرور مستخدمة بالفعل' });
      }
    }
    data.teams[key].password = password;
  }

  try {
    await safeWrite(data);
  } catch (err) {
    return res.status(500).json({ error: 'تعذّر حفظ التعديلات' });
  }

  return res.json({
    team: {
      key,
      name_ar: data.teams[key].name_ar,
      password: '***',
    },
  });
});

// DELETE /teams/:key — block deletion of the admin team.
router.delete('/teams/:key', async (req, res) => {
  const key = req.params.key;

  if (key === 'admin') {
    return res.status(403).json({ error: 'لا يمكن حذف فريق المدير' });
  }

  let data;
  try {
    data = readData();
  } catch (err) {
    return res.status(500).json({ error: 'خطأ في الخادم' });
  }

  if (!data.teams || !data.teams[key]) {
    return res.status(404).json({ error: 'الفريق غير موجود' });
  }

  delete data.teams[key];

  try {
    await safeWrite(data);
  } catch (err) {
    return res.status(500).json({ error: 'تعذّر حذف الفريق' });
  }

  return res.json({ ok: true });
});

// GET /contest — get contest settings.
router.get('/contest', (req, res) => {
  let data;
  try {
    data = readData();
  } catch (err) {
    return res.status(500).json({ error: 'خطأ في الخادم' });
  }
  return res.json({ contest: data.contest || {} });
});

// PUT /contest — update contest active status.
router.put('/contest', async (req, res) => {
  const { active } = req.body || {};

  if (typeof active !== 'boolean') {
    return res.status(400).json({ error: 'قيمة active يجب أن تكون true أو false' });
  }

  let data;
  try {
    data = readData();
  } catch (err) {
    return res.status(500).json({ error: 'خطأ في الخادم' });
  }

  data.contest = data.contest || {};
  data.contest.active = active;

  try {
    await safeWrite(data);
  } catch (err) {
    return res.status(500).json({ error: 'تعذّر حفظ إعدادات المسابقة' });
  }

  return res.json({ contest: data.contest });
});

// GET /export — download the full winners.json as an attachment.
router.get('/export', (req, res) => {
  let raw;
  try {
    raw = fs.readFileSync(DATA_PATH, 'utf8');
  } catch (err) {
    return res.status(500).json({ error: 'خطأ في الخادم' });
  }

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="winners.json"'
  );
  return res.send(raw);
});

module.exports = router;
module.exports.safeWrite = safeWrite;
module.exports.generateUniqueCode = generateUniqueCode;
