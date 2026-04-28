/**
 * routes/lookup.js — POST /api/lookup
 *
 * Body: { code: "BIG-WNR-4821", password: "BIG_WA_2025" }
 *
 * Flow:
 *  1. auth middleware validates the password and attaches req.team.
 *  2. Normalize code (trim + uppercase).
 *  3. Find the winner by code.
 *  4. Auto-expire on read (and persist if anything changed).
 *  5. Return the winner WITHOUT the code field — never mutate status here.
 */

const express = require('express');

const auth = require('../middleware/auth');
const winnersModule = require('./winners');

const { autoExpire, readData, writeData } = winnersModule;

const router = express.Router();

router.post('/', auth, (req, res) => {
  const rawCode = (req.body && req.body.code) || '';
  if (typeof rawCode !== 'string' || rawCode.trim().length === 0) {
    return res.status(400).json({ error: 'الكود مطلوب' });
  }

  const code = rawCode.trim().toUpperCase();

  let data;
  try {
    data = readData();
  } catch (err) {
    return res.status(500).json({ error: 'خطأ في الخادم' });
  }

  const winner = data.winners.find((w) => w.code === code);
  if (!winner) {
    return res.status(404).json({ error: 'الكود غير موجود' });
  }

  // Compute expirations in memory only — do NOT write here. The admin's
  // safeWrite mutex is the only sanctioned writer; a startup pass keeps the
  // file in sync.
  autoExpire(data);

  // Build a staff-facing response: include EVERYTHING the staff needs to
  // verify the winner (phone, terms, order limits, delivery zone, etc.) but
  // never expose the raw code.
  const safeWinner = {
    id: winner.id,
    name_ar: winner.name_ar,
    public_name_ar: winner.public_name_ar,
    phone: winner.phone,
    prize_type: winner.prize_type,
    prize_label_ar: winner.prize_label_ar,
    prize_detail_ar: winner.prize_detail_ar,
    terms_ar: winner.terms_ar,
    min_order: winner.min_order,
    max_order: winner.max_order,
    delivery_zone: winner.delivery_zone,
    branch: winner.branch,
    branch_label_ar: winner.branch_label_ar,
    rank: winner.rank,
    rank_label_ar: winner.rank_label_ar,
    expiry_date: winner.expiry_date,
    status: winner.status,
    redeemed_at: winner.redeemed_at,
    redeemed_by_team: winner.redeemed_by_team,
    redeemed_by_team_ar: winner.redeemed_by_team_ar,
  };

  return res.json({ winner: safeWinner });
});

module.exports = router;
