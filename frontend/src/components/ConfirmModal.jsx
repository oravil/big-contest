/**
 * ConfirmModal.jsx — Step 4 of the staff flow.
 *
 * Props:
 *  - winner: winner object being redeemed
 *  - teamNameAr: Arabic name of the logged-in team
 *  - onConfirm(): user confirmed the redemption
 *  - onCancel(): user cancelled (back to Step 3)
 *  - submitting: boolean — disables both buttons + shows spinner on confirm
 *  - error: string|null — Arabic error from the redeem API call
 *
 * UX:
 *  - Dark overlay (rgba(0,0,0,0.85)) with scale-in modal.
 *  - Escape key closes (cancel).
 *  - Body scroll locked while open.
 *  - Buttons: confirm (brand-red, large) + cancel (outline gray).
 */

import { useEffect } from 'react';

export default function ConfirmModal({
  winner,
  teamNameAr,
  onConfirm,
  onCancel,
  submitting,
  error,
}) {
  // Lock body scroll + listen for Escape.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e) => {
      if (e.key === 'Escape' && !submitting) onCancel();
    };
    document.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [onCancel, submitting]);

  if (!winner) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
      onClick={(e) => {
        // Click on backdrop closes (when not submitting).
        if (e.target === e.currentTarget && !submitting) onCancel();
      }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-bg-card border border-brand-yellow/20 p-6 sm:p-8 animate-scale-in shadow-2xl"
      >
        {/* Warning icon */}
        <div className="flex justify-center">
          <div className="text-5xl text-brand-yellow" aria-hidden="true">
            ⚠️
          </div>
        </div>

        <h3
          id="confirm-title"
          className="mt-3 text-2xl sm:text-3xl font-black text-white text-center"
        >
          هل أنت متأكد؟
        </h3>

        <p className="mt-3 text-center text-white/80">
          ستقوم بتسليم جائزة{' '}
          <span className="font-bold text-brand-yellow">
            {winner.name_ar}
          </span>
        </p>

        {/* Prize summary */}
        <div className="mt-4 rounded-xl bg-bg-dark/60 border border-white/10 p-4 text-center">
          <div className="font-black text-white text-lg">
            {winner.prize_label_ar}
          </div>
          <div className="text-sm text-white/60 mt-1">
            {winner.prize_detail_ar}
          </div>
          {teamNameAr && (
            <div className="text-xs text-white/50 mt-3 pt-3 border-t border-white/10">
              الفريق المُسلِّم:{' '}
              <span className="font-bold text-white">{teamNameAr}</span>
            </div>
          )}
        </div>

        {/* Warning banner */}
        <div className="mt-4 rounded-xl bg-status-expired/10 border border-status-expired/40 p-3 text-center">
          <p className="text-sm font-black text-status-expired">
            هذا الإجراء لا يمكن التراجع عنه بعد التأكيد
          </p>
        </div>

        {error && (
          <p className="mt-3 text-sm font-bold text-status-expired text-center">
            {error}
          </p>
        )}

        {/* Divider */}
        <div className="mt-6 border-t border-white/10" />

        {/* Buttons */}
        <div className="mt-5 flex flex-col-reverse sm:flex-row gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className={[
              'flex-1 py-3 rounded-xl font-bold transition-colors border',
              submitting
                ? 'border-white/10 text-white/30 cursor-not-allowed'
                : 'border-white/20 text-white/80 hover:bg-white/5',
            ].join(' ')}
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className={[
              'flex-1 py-3 rounded-xl font-black text-lg flex items-center justify-center gap-2 transition-colors',
              submitting
                ? 'bg-brand-red/60 text-white/80 cursor-not-allowed'
                : 'bg-brand-red hover:bg-brand-red-bright text-white',
            ].join(' ')}
          >
            {submitting ? (
              <>
                <Spinner />
                <span>جارٍ التسليم...</span>
              </>
            ) : (
              <span>تأكيد التسليم ✅</span>
            )}
          </button>
        </div>
      </div>
    </div>
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
