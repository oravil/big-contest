/**
 * CodeLookupForm.jsx — Step 2 of the staff flow.
 *
 * Props:
 *  - onSubmit(code: string): called with the trimmed/uppercased code.
 *  - loading: boolean — disables the button + shows a spinner while awaiting API.
 *  - error: string|null — Arabic error message displayed under the input.
 *
 * Behavior:
 *  - Auto-uppercases the input on every change.
 *  - Enforces maxLength of 12 (e.g. BIG-XXX-0000).
 *  - Submit button disabled until a non-empty code is present.
 */

import { useState } from 'react';

export default function CodeLookupForm({ onSubmit, loading, error }) {
  const [code, setCode] = useState('');

  const handleChange = (e) => {
    // Auto-uppercase everything the user types.
    setCode(e.target.value.toUpperCase());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed || loading) return;
    onSubmit(trimmed);
  };

  const canSubmit = code.trim().length > 0 && !loading;

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-lg mx-auto bg-bg-card rounded-2xl border border-brand-yellow/20 p-6 sm:p-8 shadow-xl"
    >
      <h2 className="text-2xl sm:text-3xl font-black text-brand-yellow text-center">
        أدخل كود الجائزة
      </h2>
      <p className="mt-2 text-sm text-white/50 text-center">
        ابحث عن كود الفائز للتحقق من الجائزة وتسليمها.
      </p>

      <div className="mt-6">
        <label
          htmlFor="prize-code"
          className="block text-sm font-bold text-white/80 mb-2"
        >
          كود الجائزة
        </label>
        <input
          id="prize-code"
          type="text"
          inputMode="text"
          autoComplete="off"
          spellCheck={false}
          dir="ltr"
          maxLength={12}
          value={code}
          onChange={handleChange}
          placeholder="BIG-WNR-4821"
          className={[
            'w-full px-4 py-3 rounded-xl bg-bg-dark text-white text-lg font-bold tracking-widest text-center',
            'border-2 outline-none transition-colors',
            error
              ? 'border-status-expired animate-shake'
              : 'border-brand-yellow/40 focus:border-brand-yellow',
          ].join(' ')}
        />
        <p className="mt-2 text-xs text-white/40">
          الكود مكوّن من حروف وأرقام بالتنسيق:{' '}
          <span className="font-mono text-white/60">BIG-XXX-0000</span>
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
