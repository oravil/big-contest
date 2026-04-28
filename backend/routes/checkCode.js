/**
 * routes/checkCode.js — POST /api/check-code (public, no auth).
 *
 * Body: { code?: string, phone?: string }
 *
 * Lets a regular visitor look up THEIR OWN winning entry from the public
 * landing page using EITHER their winning code (BIG-XXX-0000) OR the phone
 * number they registered with. Unlike /api/lookup (staff-only, returns full
 * PII), this endpoint:
 *  - requires no password,
 *  - matches the code/phone in a forgiving way (case-insensitive,
 *    ignores any non-alphanumeric chars; phone strips +, spaces, dashes
 *    and a leading "20" country code), and
 *  - returns ONE winner (or 404). It never lists or hints at other entries.
 *
 * Response shape on hit (200):
 *   { winner: {...full winner record EXCEPT raw `code` and `phone` fields...} }
 *
 * On miss (404):
 *   { error: 'لم نعثر على هذا الكود' } | { error: 'لم نعثر على هذا الرقم' }
 *
 * The winner record returned omits `code` and `phone` so those values can't
 * bounce back to other tabs/users; everything else (status, expiry,
 * redemption info, terms) is intentionally exposed because the visitor
 * proved knowledge of the code or phone.
 */

const express = require('express');

const winnersModule = require('./winners');

const router = express.Router();

const normalizeCode = (raw) =>
  String(raw || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');

// Phones: keep digits only, strip an Egyptian country code "20" prefix so
// "+20 100 123 4567", "0020 100 123 4567" and "01001234567" all match.
const normalizePhone = (raw) => {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.startsWith('0020')) return `0${digits.slice(4)}`;
  if (digits.startsWith('20') && digits.length === 12) return `0${digits.slice(2)}`;
  return digits;
};

router.post('/', (req, res) => {
  const codeNeedle = normalizeCode(req.body?.code);
  const phoneNeedle = normalizePhone(req.body?.phone);

  if (!codeNeedle && !phoneNeedle) {
    return res.status(400).json({ error: 'الرجاء إدخال الكود أو رقم الهاتف' });
  }

  let data;
  try {
    data = winnersModule.readData();
  } catch (err) {
    return res.status(500).json({ error: 'خطأ في الخادم' });
  }

  // Compute expirations in memory only — do NOT write here, the admin's
  // safeWrite mutex is the only sanctioned writer for status changes.
  winnersModule.autoExpire(data);

  const winners = data.winners || [];
  let found = null;

  if (codeNeedle) {
    found = winners.find((w) => normalizeCode(w.code) === codeNeedle);
  }
  if (!found && phoneNeedle) {
    found = winners.find((w) => normalizePhone(w.phone) === phoneNeedle);
  }

  if (!found) {
    const error = codeNeedle
      ? 'لم نعثر على هذا الكود'
      : 'لم نعثر على هذا الرقم';
    return res.status(404).json({ error });
  }

  // Strip the raw code and phone from the response.
  const { code, phone, ...safe } = found;
  return res.json({ winner: safe });
});

module.exports = router;
