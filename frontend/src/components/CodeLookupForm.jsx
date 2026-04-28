/**
 * CodeLookupForm.jsx — Step 2 of the staff flow.
 *
 * Props:
 *  - onSubmit(value: string): called with the trimmed code or phone number.
 *  - loading: boolean — disables the button + shows a spinner while awaiting API.
 *  - error: string|null — Arabic error message displayed under the input.
 *
 * Behavior:
 *  - Toggle between code mode and phone mode.
 *  - Code mode: auto-uppercase, maxLength 12 (e.g. BIG-XXX-0000).
 *  - Phone mode: numeric only, maxLength 11 (e.g. 01012345678).
 */

import { useState } from 'react';

export default function CodeLookupForm({ onSubmit, loading, error }) {
  const [mode, setMode] = useState('code'); // 'code' | 'phone'
  const [value, setValue] = useState('');

  const isPhone = mode === 'phone';

  const handleChange = (e) => {
    if (isPhone) {
      // Digits only for phone.
      setValue(e.target.value.replace(/\D/g, '').slice(0, 11));
    } else {
      setValue(e.target.value.toUpperCase());
    }
  };

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setValue('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || loading) return;
    onSubmit(trimmed);
  };

  const canSubmit = value.trim().length > 0 && !loading;

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-lg mx-auto bg-bg-card rounded-2xl border border-brand-yellow/20 p-6 sm:p-8 shadow-xl"
    >
      <h2 className="text-2xl sm:text-3xl font-black text-brand-yellow text-center">
        بحث عن الفائز
      </h2>
      <p className="mt-2 text-sm text-white/50 text-center">
        ابحث بكود الجائزة أو رقم هاتف الفائز.
      </p>

      {/* Mode toggle */}
      <div className="mt-5 flex rounded-xl overflow-hidden border border-brand-yellow/20 bg-bg-dark">
        <button
          type="button"
          onClick={() => handleModeSwitch('code')}
          className={[
            'flex-1 py-2 text-sm font-bold transition-colors',
            mode === 'code'
              ? 'bg-brand-yellow text-brand-black'
              : 'text-white/50 hover:text-white',
          ].join(' ')}
        >
          🔑 كود الجائزة
        </button>
        <button
          type="button"
          onClick={() => handleModeSwitch('phone')}
          className={[
            'flex-1 py-2 text-sm font-bold transition-colors',
            mode === 'phone'
              ? 'bg-brand-yellow text-brand-black'
              : 'text-white/50 hover:text-white',
          ].join(' ')}
        >
          📱 رقم الهاتف
        </button>
      </div>

      <div className="mt-5">
        <label
          htmlFor="prize-lookup"
          className="block text-sm font-bold text-white/80 mb-2"
        >
          {isPhone ? 'رقم هاتف الفائز' : 'كود الجائزة'}
        </label>
        <input
          id="prize-lookup"
          key={mode}
          type={isPhone ? 'tel' : 'text'}
          inputMode={isPhone ? 'numeric' : 'text'}
          autoComplete="off"
          spellCheck={false}
          dir="ltr"
          maxLength={isPhone ? 11 : 12}
          value={value}
          onChange={handleChange}
          placeholder={isPhone ? '01012345678' : 'BIG-WNR-4821'}
          className={[
            'w-full px-4 py-3 rounded-xl bg-bg-dark text-white text-lg font-bold text-center',
            'border-2 outline-none transition-colors',
            isPhone ? '' : 'tracking-widest',
            error
              ? 'border-status-expired animate-shake'
              : 'border-brand-yellow/40 focus:border-brand-yellow',
          ].join(' ')}
        />
        <p className="mt-2 text-xs text-white/40">
          {isPhone ? (
            <>رقم هاتف مصري من 11 رقمًا — مثال: <span className="font-mono text-white/60">01012345678</span></>
          ) : (
            <>الكود مكوّن من حروف وأرقام بالتنسيق: <span className="font-mono text-white/60">BIG-XXX-0000</span></>
          )}
        </p>

        {error && (
          <p className="mt-3 text-sm font-bold text-status-expired">
            {error}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className={[
          'mt-6 w-full py-3 rounded-xl font-black text-lg transition-colors flex items-center justify-center gap-2',
          canSubmit
            ? 'bg-brand-yellow hover:bg-brand-yellow-dark text-brand-black'
            : 'bg-brand-yellow/40 text-brand-black/60 cursor-not-allowed',
        ].join(' ')}
      >
        {loading ? (
          <>
            <Spinner />
            <span>جارٍ البحث...</span>
          </>
        ) : (
          <span>بحث عن الفائز 🔍</span>
        )}
      </button>
    </form>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.25"
      />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
