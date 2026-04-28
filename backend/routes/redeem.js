/**
 * routes/redeem.js — POST /api/redeem
 *
 * Body: { code: "BIG-WNR-4821", password: "BIG_WA_2025" }
 *
 * Flow:
 *  1. auth middleware validates the password → req.team.
 *  2. Normalize code (trim + uppercase).
 *  3. Find the winner.
 *  4. Auto-expire on read (and persist).
 *  5. Reject if status !== "active":
 *     - "redeemed" → 409
 *     - "expired"  → 410
 *  6. On active: mark redeemed (Cairo timestamp), persist, return details.
 */

const express = require('express');

const auth = require('../middleware/auth');
const winnersModule = require('./winners');
const adminModule = require('./admin');

const { autoExpire, readData } = winnersModule;
const { safeWrite } = adminModule;

const router = express.Router();

// Cairo-formatted Arabic timestamp for human display.
const getCairoTime = () =>
  new Date().toLocaleString('ar-EG', {
    timeZone: 'Africa/Cairo',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

router.post('/', auth, async (req, res) => {
  const { teamKey, teamNameAr } = req.team;

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

  // Auto-expire pass before evaluating this winner's status.
  autoExpire(data);

  if (winner.status === 'redeemed') {
    // Persist any auto-expirations from the pass above.
    try {
      await safeWrite(data);
    } catch (err) {
      /* ignore */
    }
    return res
      .status(409)
      .json({ error: 'تم تسليم هذه الجائزة مسبقاً' });
  }

  if (winner.status === 'expired') {
    try {
      await safeWrite(data);
    } catch (err) {
      /* ignore */
    }
    return res
      .status(410)
      .json({ error: 'انتهت صلاحية هذه الجائزة' });
  }

  if (winner.status !== 'active') {
    // Defensive: unknown status.
    return res.status(409).json({ error: 'حالة الجائزة غير صالحة' });
  }

  // Mark redeemed atomically: mutate in memory, then writeFileSync.
  const now = new Date();
  winner.status = 'redeemed';
  winner.redeemed_at = getCairoTime();
  winner.redeemed_at_iso = now.toISOString();
  winner.redeemed_by_team = teamKey;
  winner.redeemed_by_team_ar = teamNameAr;

  try {
    await safeWrite(data);
  } catch (err) {
    return res.status(500).json({ error: 'تعذّر حفظ التسليم' });
  }

  // Build a safe response: never include the code.
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

  return res.json({
    success: true,
    winner: safeWinner,
  });
});

module.exports = router;
module.exports.getCairoTime = getCairoTime;
