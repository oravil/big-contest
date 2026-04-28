/**
 * StaffPage.jsx — staff redemption flow (route: /staff).
 *
 * 5-step state machine:
 *   'password' → 'lookup' → 'result' → 'confirm' → 'success'
 *
 * Auth identity (teamKey, teamNameAr, password) lives in React useState only —
 * never persisted. A page refresh returns the user to step 1 by design.
 */

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import CodeLookupForm from '../components/CodeLookupForm';
import RedemptionResult from '../components/RedemptionResult';
import PrizeCatalogTable from '../components/PrizeCatalogTable';
import ConfirmModal from '../components/ConfirmModal';
import BrandCredit from '../components/BrandCredit';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// ---------- Logo (local /logo.png) ----------

function Logo({ className = 'h-20 w-auto object-contain mx-auto' }) {
  return (
    <img
      src="/logo.png"
      alt="Big Shawerma"
      className={className}
    />
  );
}

// ---------- Step 1: Password Gate ----------

function PasswordGate({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null); // { teamNameAr }
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      // Validate the password by hitting /api/lookup with a dummy code.
      // The auth middleware runs first; a 401 means bad password,
      // anything else (including 404 "code not found") means the password is OK.
      const res = await fetch(`${API_BASE}/lookup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: '__PROBE__', password }),
      });

      if (res.status === 401) {
        setError('كلمة المرور غير صحيحة ❌');
        setShake(true);
        setPassword('');
        setTimeout(() => setShake(false), 600);
        return;
      }

      // Password accepted — but we don't know teamKey/teamNameAr from here,
      // so we map it from the constants below if possible. As a fallback we
      // probe using a known successful path: store the password and derive a
      // best-effort label from server response if present in future.
      const teamNameAr = deriveTeamNameAr(password);
      setSuccess({ teamNameAr });

      // Show success banner briefly, then advance.
      setTimeout(() => {
        onSuccess({ password, teamNameAr });
      }, 1200);
    } catch (err) {
      setError('تعذّر الاتصال بالخادم');
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-bg-dark">
      <div className="w-full max-w-md bg-bg-card rounded-2xl border border-brand-yellow/20 shadow-2xl p-6 sm:p-8">
        <div className="flex flex-col items-center text-center gap-3">
          <Logo className="h-20 w-auto object-contain mx-auto" />
          <h1 className="text-2xl sm:text-3xl font-black text-brand-yellow">
            لوحة تسليم الجوائز
          </h1>
          <p className="text-sm text-white/40">
            خاص بفريق خدمة العملاء فقط
          </p>
        </div>

        {success && (
          <div className="mt-5 rounded-xl bg-status-active/15 border border-status-active/40 text-status-active text-sm font-bold px-4 py-3 text-center animate-fade-in-up">
            مرحباً — {success.teamNameAr} ✅
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6">
          <label
            htmlFor="team-password"
            className="block text-sm font-bold text-white/80 mb-2"
          >
            كلمة مرور الفريق
          </label>
          <div className="relative">
            <input
              id="team-password"
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              dir="ltr"
              placeholder="أدخل كلمة مرور فريقك"
              className={[
                'w-full px-4 py-3 rounded-xl bg-bg-dark text-white text-base font-bold tracking-wide',
                'border-2 outline-none transition-colors text-right',
                error
                  ? 'border-status-expired'
                  : 'border-brand-yellow/40 focus:border-brand-yellow',
                shake ? 'animate-shake' : '',
              ].join(' ')}
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute top-1/2 -translate-y-1/2 left-3 text-white/60 hover:text-brand-yellow transition-colors"
              aria-label={show ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
            >
              {show ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          {error && (
            <p className="mt-2 text-sm font-bold text-status-expired">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!password || submitting}
            className={[
              'mt-5 w-full py-3 rounded-xl font-black text-lg transition-colors flex items-center justify-center gap-2',
              !password || submitting
                ? 'bg-brand-red/50 text-white/70 cursor-not-allowed'
                : 'bg-brand-red hover:bg-brand-red-bright text-white',
            ].join(' ')}
          >
            {submitting ? <span>جارٍ التحقق...</span> : <span>دخول</span>}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-xs text-white/40 hover:text-brand-yellow transition-colors"
          >
            ↩ العودة إلى صفحة المسابقة
          </Link>
        </div>

        <div className="mt-6 pt-5 border-t border-white/5">
          <BrandCredit variant="compact" />
        </div>
      </div>
    </div>
  );
}

// Best-effort team-name mapping from password prefix.
// (Server authoritative — this is just for the welcome banner.)
function deriveTeamNameAr(password) {
  const map = {
    BIG_WA_: 'خدمة عملاء واتساب',
    BIG_PH_: 'خدمة عملاء هاتف',
    BIG_HL_: 'استقبال الصالة',
    BIG_TK_: 'تيك أواي',
  };
  for (const prefix of Object.keys(map)) {
    if (password.startsWith(prefix)) return map[prefix];
  }
  return 'الفريق';
}

// ---------- Step 5: Success ----------

function SuccessView({ winner, teamNameAr, onAgain }) {
  return (
    <div className="relative min-h-[70vh] flex items-center justify-center px-4 py-12">
      <Confetti />
      <div className="relative w-full max-w-lg">
        <div className="flex flex-col items-center text-center">
          <CheckCircle />
          <h2 className="mt-4 text-2xl sm:text-3xl font-black text-status-active">
            تم التسليم بنجاح ✅
          </h2>
        </div>

        <div className="mt-6 rounded-2xl bg-bg-card border border-status-active/30 p-5 sm:p-6 space-y-2.5 text-sm">
          <Row icon="👤" label="اسم الفائز" value={winner.name_ar} />
          <Row
            icon="🏆"
            label="الجائزة"
            value={`${winner.prize_label_ar} — ${winner.prize_detail_ar}`}
          />
          {winner.redeemed_at && (
            <Row icon="🕐" label="وقت التسليم" value={winner.redeemed_at} />
          )}
          <Row icon="👥" label="الفريق" value={teamNameAr} />
          <Row icon="📍" label="الفرع" value={winner.branch_label_ar} />
        </div>

        <button
          type="button"
          onClick={onAgain}
          className="mt-6 w-full py-3 rounded-xl bg-brand-yellow hover:bg-brand-yellow-dark text-brand-black font-black text-lg transition-colors"
        >
          بحث عن كود آخر
        </button>
      </div>
    </div>
  );
}

function Row({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2 text-white">
      <span aria-hidden="true">{icon}</span>
      <span className="text-white/60 shrink-0">{label}:</span>
      <span className="font-bold flex-1">{value}</span>
    </div>
  );
}

function CheckCircle() {
  return (
    <svg
      width="96"
      height="96"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="50"
        cy="50"
        r="44"
        fill="none"
        stroke="#22C55E"
        strokeWidth="4"
        className="animate-draw-check"
        style={{ strokeDasharray: 280, strokeDashoffset: 280 }}
      />
      <path
        d="M30 52 L46 68 L72 38"
        fill="none"
        stroke="#22C55E"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-draw-check"
      />
    </svg>
  );
}

function Confetti() {
  const colors = ['#FFB800', '#CC1F1F', '#FF6B00', '#22C55E', '#3B82F6'];
  const pieces = Array.from({ length: 24 }, (_, i) => i);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.8;
        const duration = 0.5 + Math.random() * 1.5; // 0.5s–2s
        const size = 6 + Math.round(Math.random() * 8);
        const color = colors[i % colors.length];
        return (
          <div
            key={i}
            className="absolute animate-confetti"
            style={{
              left: `${left}%`,
              top: -20,
              width: size,
              height: size * 1.6,
              background: color,
              borderRadius: 2,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          />
        );
      })}
    </div>
  );
}

// ---------- Icons ----------

function EyeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a19.4 19.4 0 0 1 4.22-5.06" />
      <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 7 11 7a19.4 19.4 0 0 1-3.17 4.19" />
      <path d="M9.88 9.88a3 3 0 0 0 4.24 4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

// ---------- Main page ----------

export default function StaffPage() {
  // Step state machine.
  const [step, setStep] = useState('password');

  // Team identity — React state only, NEVER persisted.
  const [auth, setAuth] = useState(null); // { password, teamNameAr }

  // Lookup state.
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState(null);
  const [winner, setWinner] = useState(null);

  // Redeem state.
  const [redeemSubmitting, setRedeemSubmitting] = useState(false);
  const [redeemError, setRedeemError] = useState(null);

  // Defensive: clear sensitive state on logout / unmount.
  const mountedRef = useRef(true);
  useEffect(
    () => () => {
      mountedRef.current = false;
    },
    []
  );

  const logout = () => {
    setAuth(null);
    setWinner(null);
    setLookupError(null);
    setRedeemError(null);
    setStep('password');
  };

  const handlePasswordSuccess = ({ password, teamNameAr }) => {
    setAuth({ password, teamNameAr });
    setStep('lookup');
  };

  const handleLookup = async (code) => {
    if (!auth) return;
    setLookupLoading(true);
    setLookupError(null);
    setWinner(null);

    try {
      const res = await fetch(`${API_BASE}/lookup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, password: auth.password }),
      });

      if (res.status === 401) {
        // Session/password lost validity — bounce to password gate.
        logout();
        return;
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setLookupError(data.error || 'تعذّر البحث عن الكود');
        return;
      }

      setWinner(data.winner);
      setStep('result');
    } catch (err) {
      setLookupError('تعذّر الاتصال بالخادم');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleRedeemConfirm = async () => {
    if (!auth || !winner) return;
    setRedeemSubmitting(true);
    setRedeemError(null);

    try {
      // Note: backend strips the code from responses, so we cannot read it
      // back from /api/lookup. Re-send the code from the original lookup —
      // we kept it in the input box; here we use winner.id as a join is not
      // available, so we stash the last-looked-up code in a ref on lookup.
      const res = await fetch(`${API_BASE}/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: lastCodeRef.current, password: auth.password }),
      });

      if (res.status === 401) {
        logout();
        return;
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setRedeemError(data.error || 'تعذّر تسليم الجائزة');
        return;
      }

      setWinner(data.winner);
      setStep('success');
    } catch (err) {
      setRedeemError('تعذّر الاتصال بالخادم');
    } finally {
      setRedeemSubmitting(false);
    }
  };

  // Track the most recent code looked up (so we can re-send on redeem).
  const lastCodeRef = useRef('');
  const onLookupSubmit = (code) => {
    lastCodeRef.current = code;
    handleLookup(code);
  };

  const resetToLookup = () => {
    setWinner(null);
    setLookupError(null);
    setRedeemError(null);
    setStep('lookup');
  };

  // ---------- Render ----------

  if (step === 'password') {
    return <PasswordGate onSuccess={handlePasswordSuccess} />;
  }

  return (
    <div className="min-h-screen bg-bg-dark text-white">
      {/* Top bar with team welcome + logout */}
      <header className="sticky top-0 z-30 bg-bg-dark/85 backdrop-blur border-b border-brand-yellow/15">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-auto object-contain" />
            <span className="text-sm font-bold text-brand-yellow">
              لوحة التسليم
            </span>
          </div>
          {auth && (
            <span className="hidden sm:inline-block text-xs px-3 py-1 rounded-full bg-status-active/15 border border-status-active/40 text-status-active font-bold">
              مرحباً — {auth.teamNameAr}
            </span>
          )}
          <button
            type="button"
            onClick={logout}
            className="text-xs sm:text-sm text-white/60 hover:text-brand-red-bright transition-colors"
          >
            تسجيل خروج ↩
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Welcome banner (mobile-friendly) */}
        {auth && (
          <div className="sm:hidden mb-4 text-center text-xs px-3 py-2 rounded-full bg-status-active/15 border border-status-active/40 text-status-active font-bold">
            مرحباً — {auth.teamNameAr}
          </div>
        )}

        {step === 'lookup' && (
          <>
            <CodeLookupForm
              onSubmit={onLookupSubmit}
              loading={lookupLoading}
              error={lookupError}
            />
            <details className="mt-6 max-w-md mx-auto rounded-2xl bg-bg-card border border-white/10 overflow-hidden">
              <summary className="cursor-pointer select-none px-4 py-3 text-sm font-black text-brand-yellow flex items-center gap-2 hover:bg-white/5 transition-colors">
                <span aria-hidden="true">📋</span>
                <span>دليل الجوائز والشروط</span>
              </summary>
              <div className="p-4 border-t border-white/10">
                <PrizeCatalogTable variant="staff" />
              </div>
            </details>
          </>
        )}

        {step === 'result' && winner && (
          <RedemptionResult
            winner={winner}
            onRedeem={() => {
              setRedeemError(null);
              setStep('confirm');
            }}
            onReset={resetToLookup}
          />
        )}

        {step === 'confirm' && winner && (
          <>
            {/* Keep the result card visible behind the modal. */}
            <RedemptionResult
              winner={winner}
              onRedeem={() => {}}
              onReset={resetToLookup}
            />
            <ConfirmModal
              winner={winner}
              teamNameAr={auth?.teamNameAr}
              submitting={redeemSubmitting}
              error={redeemError}
              onConfirm={handleRedeemConfirm}
              onCancel={() => {
                if (redeemSubmitting) return;
                setRedeemError(null);
                setStep('result');
              }}
            />
          </>
        )}

        {step === 'success' && winner && (
          <SuccessView
            winner={winner}
            teamNameAr={auth?.teamNameAr}
            onAgain={resetToLookup}
          />
        )}
      </main>

      <footer className="max-w-3xl mx-auto px-4 pb-8">
        <BrandCredit variant="compact" />
      </footer>
    </div>
  );
}
