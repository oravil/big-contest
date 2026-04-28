/**
 * CheckCodePopup.jsx — public "تحقق من جائزتك" modal.
 *
 * Lets any visitor search by EITHER their winning code (BIG-XXX-0000) or
 * the phone number they registered with, and see their own prize info.
 * Calls POST /api/check-code (public, no auth) which performs a forgiving
 * server-side lookup and returns the matching winner (codes & phones are
 * stripped from the public GET /api/winners listing).
 *
 * Props:
 *  - open       boolean
 *  - onClose    () => void
 *
 * UX:
 *  - Backdrop dim, click-outside closes, Escape closes, body scroll locked.
 *  - Tabs let user switch between code search and phone search.
 *  - Auto-formats code input as BIG-XXX-NNNN; phone keeps digits only.
 *  - On match: shows prize, status, expiry, terms, and redemption info.
 *  - On miss: friendly Arabic error, shake animation.
 */

import { useEffect, useState } from 'react';

import { getPrize } from '../constants/prizes';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Normalize a code for matching: keep only A-Z and 0-9, uppercase.
 * So "big-bhx-2103", "BIGBHX2103", "  BIG BHX 2103  " all match "BIG-BHX-2103".
 */
const normalizeCode = (raw) =>
  String(raw || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');

/**
 * Auto-format raw user input as BIG-XXX-NNNN (3-3-4) while typing.
 * Caps at 10 alphanumerics so the formatted output never exceeds 12 chars.
 */
const formatCodeInput = (raw) => {
  const clean = normalizeCode(raw).slice(0, 10);
  if (clean.length <= 3) return clean;
  if (clean.length <= 6) return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  return `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6)}`;
};

// Phones: digits only, max 11 chars (Egyptian mobile length).
const formatPhoneInput = (raw) => String(raw || '').replace(/\D/g, '').slice(0, 11);

const STATUS_META = {
  active: {
    label: 'فعّال — جاهز للاستلام ✅',
    cls: 'border-status-active/50 bg-status-active/10 text-status-active',
  },
  redeemed: {
    label: 'تم استلام الجائزة 🎉',
    cls: 'border-status-redeemed/50 bg-status-redeemed/10 text-status-redeemed',
  },
  expired: {
    label: 'انتهت صلاحية الجائزة ⏰',
    cls: 'border-status-expired/50 bg-status-expired/10 text-status-expired',
  },
  cancelled: {
    label: 'تم إلغاء الجائزة',
    cls: 'border-white/20 bg-white/5 text-white/70',
  },
};

export default function CheckCodePopup({ open, onClose }) {
  const [mode, setMode] = useState('code'); // 'code' | 'phone'
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');
  const [match, setMatch] = useState(null); // winner object or null
  const [error, setError] = useState(null);
  const [shake, setShake] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Reset on open/close.
  useEffect(() => {
    if (open) {
      setMode('code');
      setCode('');
      setPhone('');
      setMatch(null);
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

  // Escape closes.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Body scroll lock.
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    let payload;
    if (mode === 'phone') {
      const phoneNeedle = formatPhoneInput(phone);
      if (!phoneNeedle) return;
      payload = { phone: phoneNeedle };
    } else {
      const codeNeedle = normalizeCode(code);
      if (!codeNeedle) return;
      payload = { code: codeNeedle };
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/check-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 404) {
        setMatch(null);
        const msg =
          mode === 'phone'
            ? 'لم نعثر على هذا الرقم. تأكد من إدخاله بشكل صحيح.'
            : 'لم نعثر على هذا الكود. تأكد من إدخاله بشكل صحيح.';
        setError(msg);
        setShake(true);
        setTimeout(() => setShake(false), 600);
        return;
      }

      if (!res.ok) {
        let msg = 'تعذّر التحقق من الكود. حاول مرة أخرى.';
        try {
          const body = await res.json();
          if (body?.error) msg = body.error;
        } catch (_) {
          /* ignore parse errors */
        }
        setMatch(null);
        setError(msg);
        setShake(true);
        setTimeout(() => setShake(false), 600);
        return;
      }

      const body = await res.json();
      setMatch(body.winner);
    } catch (err) {
      setMatch(null);
      setError('تعذّر الاتصال بالخادم. تحقق من الإنترنت ثم حاول مرة أخرى.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      onClick={handleBackdrop}
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md bg-bg-card rounded-2xl border border-brand-yellow/30 shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="px-6 pt-6 pb-3 text-center relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 left-3 text-white/50 hover:text-white text-2xl leading-none"
            aria-label="إغلاق"
          >
            ×
          </button>
          <div className="text-4xl mb-2" aria-hidden="true">🎟️</div>
          <h3 className="text-xl sm:text-2xl font-black text-brand-yellow">
            تحقق من جائزتك
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-white/60">
            ابحث بالكود اللي معاك أو برقم الهاتف اللي سجلت بيه.
          </p>
        </div>

        {/* Mode tabs */}
        <div className="px-6 pb-1">
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-bg-dark/60 border border-white/10">
            <button
              type="button"
              onClick={() => {
                setMode('code');
                setError(null);
                setMatch(null);
              }}
              className={[
                'py-2 rounded-lg text-sm font-black transition-colors',
                mode === 'code'
                  ? 'bg-brand-yellow text-brand-black'
                  : 'text-white/70 hover:text-white',
              ].join(' ')}
            >
              🎟️ بالكود
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('phone');
                setError(null);
                setMatch(null);
              }}
              className={[
                'py-2 rounded-lg text-sm font-black transition-colors',
                mode === 'phone'
                  ? 'bg-brand-yellow text-brand-black'
                  : 'text-white/70 hover:text-white',
              ].join(' ')}
            >
              📱 برقم الهاتف
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pt-3 pb-4">
          {mode === 'code' ? (
            <input
              type="text"
              inputMode="text"
              autoComplete="off"
              spellCheck={false}
              dir="ltr"
              maxLength={12}
              value={code}
              onChange={(e) => setCode(formatCodeInput(e.target.value))}
              placeholder="BIG-WNR-4821"
              className={[
                'w-full px-4 py-3 rounded-xl bg-bg-dark text-white text-lg font-bold tracking-widest text-center',
                'border-2 outline-none transition-colors',
                error
                  ? 'border-status-expired'
                  : 'border-brand-yellow/40 focus:border-brand-yellow',
                shake ? 'animate-shake' : '',
              ].join(' ')}
            />
          ) : (
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="off"
              dir="ltr"
              maxLength={11}
              value={phone}
              onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
              placeholder="01012345678"
              className={[
                'w-full px-4 py-3 rounded-xl bg-bg-dark text-white text-lg font-bold tracking-widest text-center',
                'border-2 outline-none transition-colors',
                error
                  ? 'border-status-expired'
                  : 'border-brand-yellow/40 focus:border-brand-yellow',
                shake ? 'animate-shake' : '',
              ].join(' ')}
            />
          )}

          {error && (
            <p className="mt-3 text-sm font-bold text-status-expired text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={
              (mode === 'code' ? !code.trim() : phone.length < 11) ||
              submitting
            }
            className={[
              'mt-4 w-full py-3 rounded-xl font-black text-base transition-colors',
              (mode === 'code' ? code.trim() : phone.length === 11) &&
              !submitting
                ? 'bg-brand-yellow hover:bg-brand-yellow-dark text-brand-black'
                : 'bg-brand-yellow/40 text-brand-black/60 cursor-not-allowed',
            ].join(' ')}
          >
            {submitting ? 'جارٍ التحقق...' : 'تحقق 🔍'}
          </button>
        </form>

        {/* Result */}
        {match && <ResultBlock winner={match} />}
      </div>
    </div>
  );
}

function ResultBlock({ winner }) {
  const prize = getPrize(winner.prize_type);
  const Icon = prize.Icon;
  const status = STATUS_META[winner.status] || STATUS_META.expired;

  return (
    <div className="px-6 pb-6 pt-2 border-t border-white/10 mt-2 animate-fade-in-up">
      {/* Status banner */}
      <div
        className={[
          'rounded-xl border px-3 py-2 text-sm font-black text-center',
          status.cls,
        ].join(' ')}
      >
        {status.label}
      </div>

      {/* Prize */}
      <div className="mt-4 flex items-start gap-3">
        <div
          className={[
            'shrink-0 w-14 h-14 rounded-xl flex items-center justify-center shadow-md',
            prize.icon_bg,
            prize.icon_text,
          ].join(' ')}
        >
          {Icon ? (
            <Icon className="w-7 h-7" />
          ) : (
            <span className="text-2xl" aria-hidden="true">{prize.emoji}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className={`text-[10px] uppercase tracking-wide font-black ${prize.chip_text}`}>
            {prize.short_label_ar}
          </div>
          <h4 className="text-lg font-black text-white leading-tight">
            {winner.prize_label_ar || prize.label_ar}
          </h4>
          <p className="text-sm text-white/60 mt-0.5">
            {winner.prize_detail_ar || prize.default_detail_ar}
          </p>
        </div>
      </div>

      {/* Meta */}
      <div className="mt-4 space-y-1.5 text-sm">
        <div className="flex items-center gap-2 text-white">
          <span aria-hidden="true">👤</span>
          <span className="font-bold">
            {winner.public_name_ar || winner.name_ar}
          </span>
        </div>
        <div className="flex items-center gap-2 text-white/70">
          <span aria-hidden="true">📍</span>
          <span>{winner.branch_label_ar}</span>
        </div>
        <div className="flex items-center gap-2 text-white/70">
          <span aria-hidden="true">📅</span>
          <span>تنتهي في: {winner.expiry_date}</span>
        </div>
      </div>

      {/* Terms */}
      {(winner.terms_ar ||
        winner.min_order != null ||
        winner.max_order != null ||
        winner.delivery_zone) && (
        <div className="mt-4 rounded-xl border border-brand-yellow/25 bg-brand-yellow/5 p-3 space-y-1.5 text-xs">
          <div className="flex items-center gap-2 text-brand-yellow font-black">
            <span aria-hidden="true">📋</span>
            <span>شروط الجائزة</span>
          </div>
          {winner.terms_ar && (
            <p className="text-white/80 leading-relaxed">{winner.terms_ar}</p>
          )}
          {winner.min_order != null && (
            <div className="text-white/70">
              الحد الأدنى للطلب:{' '}
              <span className="font-bold text-white">
                {winner.min_order} ج.م
              </span>
            </div>
          )}
          {winner.max_order != null && (
            <div className="text-white/70">
              الحد الأقصى للطلب:{' '}
              <span className="font-bold text-white">
                {winner.max_order} ج.م
              </span>
            </div>
          )}
          {winner.delivery_zone && (
            <div className="text-white/70">
              منطقة التوصيل:{' '}
              <span className="font-bold text-white">
                {winner.delivery_zone}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Redemption footer */}
      {winner.status === 'redeemed' && (
        <div className="mt-4 pt-3 border-t border-white/10 text-xs space-y-1">
          <div className="text-white/70">
            سُلِّم بواسطة:{' '}
            <span className="font-bold text-white">
              {winner.redeemed_by_team_ar || '—'}
            </span>
          </div>
          {winner.redeemed_at && (
            <div className="text-white/50">{winner.redeemed_at}</div>
          )}
        </div>
      )}

      {/* Helper text for active codes */}
      {winner.status === 'active' && (
        <p className="mt-4 text-xs text-white/50 text-center leading-relaxed">
          توجه لأقرب فرع وقدّم الكود لاستلام جائزتك قبل انتهاء الصلاحية.
        </p>
      )}
    </div>
  );
}
