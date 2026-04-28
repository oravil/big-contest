/**
 * ConfirmDeleteModal.jsx — reusable confirmation modal for destructive actions.
 *
 * Used by the admin UI for:
 *  - Deleting a winner
 *  - Deleting a team
 *  - Resetting a redeemed prize back to "active"
 *  - Any other "are you sure?" flow (props are generic).
 *
 * UX:
 *  - Backdrop dim, click-outside cancels (when not submitting), Escape closes.
 *  - Body scroll locked while open.
 *  - Confirm button uses brand-red (destructive) by default; override via
 *    `tone="warning"` to use yellow (e.g. for "reset" actions).
 *
 * Props:
 *  - title           Arabic title text
 *  - message         Arabic body text or React node
 *  - confirmLabel    Default: "تأكيد ✅"
 *  - cancelLabel     Default: "إلغاء"
 *  - tone            "danger" (default) | "warning"
 *  - submitting      boolean
 *  - onConfirm       () => void
 *  - onCancel        () => void
 */

import { useEffect } from 'react';

export default function ConfirmDeleteModal({
  title = 'هل أنت متأكد؟',
  message = 'هذا الإجراء لا يمكن التراجع عنه.',
  confirmLabel = 'تأكيد ✅',
  cancelLabel = 'إلغاء',
  tone = 'danger',
  submitting = false,
  onConfirm,
  onCancel,
}) {
  // Escape closes (when not submitting).
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !submitting) onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel, submitting]);

  // Body scroll lock.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const onBackdropClick = (e) => {
    if (e.target === e.currentTarget && !submitting) onCancel();
  };

  const confirmBtnCls =
    tone === 'warning'
      ? 'bg-brand-yellow hover:bg-brand-yellow-dark text-brand-black'
      : 'bg-brand-red hover:bg-brand-red-bright text-white';

  const icon = tone === 'warning' ? '⚠️' : '🗑️';

  return (
    <div
      onClick={onBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md bg-bg-card rounded-2xl border border-white/10 shadow-2xl animate-scale-in">
        <div className="px-6 py-6 text-center">
          <div className="text-5xl mb-3" aria-hidden="true">
            {icon}
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            {title}
          </h3>
          <div className="mt-3 text-sm text-white/70 leading-relaxed">
            {message}
          </div>

          {tone === 'danger' && (
            <p className="mt-4 text-xs font-bold text-status-expired">
              هذا الإجراء لا يمكن التراجع عنه بعد التأكيد.
            </p>
          )}
        </div>

        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-4 py-2 rounded-lg border border-white/20 text-white/80 hover:bg-white/10 text-sm font-bold transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className={[
              'px-5 py-2 rounded-lg font-black text-sm transition-colors flex items-center gap-2',
              submitting ? 'opacity-60 cursor-not-allowed' : '',
              confirmBtnCls,
            ].join(' ')}
          >
            {submitting && <Spinner />}
            <span>{submitting ? 'جارٍ التنفيذ...' : confirmLabel}</span>
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
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
