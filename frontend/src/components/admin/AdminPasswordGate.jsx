/**
 * AdminPasswordGate.jsx — step 1 of the admin flow.
 *
 * Same UX pattern as StaffPage's PasswordGate:
 *   - Centered card with logo, label, input + eye toggle, submit button.
 *   - On success, briefly shows a green welcome banner, then advances.
 *   - On 401, clears the field and triggers a shake animation.
 *
 * The admin password is sent via the X-Admin-Password HEADER (not body)
 * to the /api/admin/login endpoint. It lives in React state only —
 * no localStorage / sessionStorage / cookies.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';

import BrandCredit from '../BrandCredit';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function Logo({ className = 'h-20 w-auto object-contain mx-auto' }) {
  return (
    <img
      src="/logo.png"
      alt="Big Shawerma"
      className={className}
    />
  );
}

function EyeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.79 19.79 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a19.86 19.86 0 0 1-3.17 4.19" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function AdminPasswordGate({ onSuccess }) {
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
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password,
        },
        body: JSON.stringify({}),
      });

      if (res.status === 401) {
        setError('كلمة المرور غير صحيحة ❌');
        setShake(true);
        setPassword('');
        setTimeout(() => setShake(false), 600);
        return;
      }

      if (!res.ok) {
        setError('تعذّر الاتصال بالخادم');
        setShake(true);
        setTimeout(() => setShake(false), 600);
        return;
      }

      const data = await res.json();
      const teamNameAr = (data && data.teamNameAr) || 'المدير';
      setSuccess({ teamNameAr });

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
      <div className="w-full max-w-md bg-bg-card rounded-2xl border border-brand-yellow/30 shadow-2xl p-6 sm:p-8">
        <div className="flex flex-col items-center text-center gap-3">
          <Logo className="h-20 w-auto object-contain mx-auto" />
          <h1 className="text-2xl sm:text-3xl font-black text-brand-yellow">
            لوحة الإدارة
          </h1>
          <p className="text-sm text-white/40">
            خاص بالمدير فقط — صلاحيات كاملة
          </p>
        </div>

        {success && (
          <div className="mt-5 rounded-xl bg-status-active/15 border border-status-active/40 text-status-active text-sm font-bold px-4 py-3 text-center animate-fade-in-up">
            مرحباً — {success.teamNameAr} ✅
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6">
          <label
            htmlFor="admin-password"
            className="block text-sm font-bold text-white/80 mb-2"
          >
            كلمة مرور المدير
          </label>
          <div className="relative">
            <input
              id="admin-password"
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              dir="ltr"
              placeholder="أدخل كلمة مرور المدير"
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
            {submitting ? <span>جارٍ التحقق...</span> : <span>دخول الإدارة</span>}
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
