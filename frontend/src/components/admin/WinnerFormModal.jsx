/**
 * WinnerFormModal.jsx — create/edit winner modal.
 *
 * Modes:
 *  - mode="create": all fields blank; submit calls onSubmit({...form}) for POST.
 *    The server auto-generates the BIG-XXX-0000 code.
 *  - mode="edit":   pre-filled from `winner` prop; submit calls onSubmit({...form}) for PUT.
 *
 * UX (matches ConfirmModal):
 *  - Backdrop dim, click-outside cancels, Escape closes.
 *  - Body scroll locked while open.
 *  - All labels Arabic; field values stay LTR for codes/dates/numbers.
 */

import { useEffect, useState } from 'react';

import { PRIZES, PRIZE_ORDER, getPrize, getPrizeDefaults } from '../../constants/prizes';

const PRIZE_TYPES = PRIZE_ORDER.map((key) => ({
  value: key,
  label: `${PRIZES[key].emoji} ${PRIZES[key].label_ar}`,
}));

const BRANCHES = [
  { value: 'sharbeen', label: 'فرع شربين' },
  { value: 'belqas', label: 'فرع بلقاس' },
];

const DEFAULT_PRIZE = 'free_meal';

const buildEmptyForm = () => {
  const defaults = getPrizeDefaults(DEFAULT_PRIZE) || {};
  return {
    name_ar: '',
    public_name_ar: '',
    phone: '',
    prize_type: DEFAULT_PRIZE,
    prize_label_ar: defaults.prize_label_ar ?? '',
    prize_detail_ar: defaults.prize_detail_ar ?? '',
    terms_ar: defaults.terms_ar ?? '',
    min_order: defaults.min_order ?? '',
    max_order: defaults.max_order ?? '',
    delivery_zone: defaults.delivery_zone ?? '',
    branch: 'sharbeen',
    branch_label_ar: 'فرع شربين',
    rank: '',
    rank_label_ar: '',
    expiry_date: '',
  };
};

const branchLabelFor = (key) => {
  const b = BRANCHES.find((x) => x.value === key);
  return b ? b.label : '';
};

export default function WinnerFormModal({
  mode = 'create',
  winner = null,
  onCancel,
  onSubmit,
  submitting = false,
  error = null,
}) {
  const [form, setForm] = useState(buildEmptyForm);

  // Initialize / reset when opening in a different mode or with a new winner.
  useEffect(() => {
    if (mode === 'edit' && winner) {
      const fallback = getPrize(winner.prize_type);
      setForm({
        name_ar: winner.name_ar || '',
        public_name_ar: winner.public_name_ar || '',
        phone: winner.phone || '',
        prize_type: winner.prize_type || DEFAULT_PRIZE,
        prize_label_ar: winner.prize_label_ar || fallback.label_ar,
        prize_detail_ar: winner.prize_detail_ar || fallback.default_detail_ar,
        terms_ar: winner.terms_ar || '',
        min_order: winner.min_order ?? '',
        max_order: winner.max_order ?? '',
        delivery_zone: winner.delivery_zone ?? '',
        branch: winner.branch || 'sharbeen',
        branch_label_ar: winner.branch_label_ar || branchLabelFor(winner.branch),
        rank: winner.rank ?? '',
        rank_label_ar: winner.rank_label_ar || '',
        expiry_date: winner.expiry_date || '',
      });
    } else {
      setForm(buildEmptyForm());
    }
  }, [mode, winner]);

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

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handlePrizeType = (value) => {
    const defaults = getPrizeDefaults(value);
    if (!defaults) {
      update({ prize_type: value });
      return;
    }
    update({
      prize_type: value,
      prize_label_ar: defaults.prize_label_ar,
      prize_detail_ar: defaults.prize_detail_ar,
      terms_ar: defaults.terms_ar,
      min_order: defaults.min_order ?? '',
      max_order: defaults.max_order ?? '',
      delivery_zone: defaults.delivery_zone ?? '',
    });
  };

  const handleBranch = (value) =>
    update({
      branch: value,
      branch_label_ar: branchLabelFor(value),
    });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (submitting) return;

    const payload = {
      name_ar: form.name_ar.trim(),
      public_name_ar: form.public_name_ar.trim(),
      phone: form.phone.replace(/\D/g, ''),
      prize_type: form.prize_type,
      prize_label_ar: form.prize_label_ar.trim(),
      prize_detail_ar: form.prize_detail_ar.trim(),
      terms_ar: form.terms_ar.trim(),
      min_order:
        form.min_order === '' || form.min_order === null
          ? null
          : Number(form.min_order),
      max_order:
        form.max_order === '' || form.max_order === null
          ? null
          : Number(form.max_order),
      delivery_zone:
        form.delivery_zone === '' ? null : form.delivery_zone.trim(),
      branch: form.branch,
      branch_label_ar: form.branch_label_ar.trim(),
      rank: form.rank === '' ? null : Number(form.rank),
      rank_label_ar: form.rank_label_ar.trim(),
      expiry_date: form.expiry_date,
    };

    onSubmit(payload);
  };

  const onBackdropClick = (e) => {
    if (e.target === e.currentTarget && !submitting) onCancel();
  };

  return (
    <div
      onClick={onBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      style={{ background: 'rgba(0,0,0,0.85)' }}
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-bg-card rounded-2xl border border-brand-yellow/30 shadow-2xl animate-scale-in">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-black text-brand-yellow">
            {mode === 'edit' ? 'تعديل بيانات الفائز' : 'إضافة فائز جديد'}
          </h3>
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="text-white/50 hover:text-white text-2xl leading-none"
            aria-label="إغلاق"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <Field label="الاسم الكامل" required>
            <input
              type="text"
              value={form.name_ar}
              onChange={(e) => update({ name_ar: e.target.value })}
              required
              className={inputCls}
            />
          </Field>

          <Field label="الاسم العام (مختصر)">
            <input
              type="text"
              value={form.public_name_ar}
              onChange={(e) => update({ public_name_ar: e.target.value })}
              placeholder="مثال: أحمد م."
              className={inputCls}
            />
          </Field>

          <Field label="رقم الهاتف" required>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) =>
                update({ phone: e.target.value.replace(/\D/g, '').slice(0, 11) })
              }
              required
              dir="ltr"
              inputMode="numeric"
              pattern="01[0125][0-9]{8}"
              placeholder="01012345678"
              className={`${inputCls} text-right tracking-wider`}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="نوع الجائزة">
              <select
                value={form.prize_type}
                onChange={(e) => handlePrizeType(e.target.value)}
                className={selectCls}
              >
                {PRIZE_TYPES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-white/45 leading-relaxed">
                💡 اختيار الجائزة يملأ تلقائياً الشروط والحد الأدنى/الأقصى.
              </p>
            </Field>

            <Field label="عنوان الجائزة">
              <input
                type="text"
                value={form.prize_label_ar}
                onChange={(e) => update({ prize_label_ar: e.target.value })}
                className={inputCls}
              />
            </Field>
          </div>

          <PrizePreview type={form.prize_type} />

          <Field label="تفاصيل الجائزة" required>
            <input
              type="text"
              value={form.prize_detail_ar}
              onChange={(e) => update({ prize_detail_ar: e.target.value })}
              required
              placeholder="مثال: شاورما بيج سبيشال"
              className={inputCls}
            />
          </Field>

          <Field label="شروط الجائزة">
            <textarea
              value={form.terms_ar}
              onChange={(e) => update({ terms_ar: e.target.value })}
              rows={3}
              placeholder="مثال: صالحة لمرة واحدة، لا تُجمع مع أي عرض آخر."
              className={`${inputCls} resize-none`}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="الحد الأدنى للطلب (اختياري)">
              <input
                type="number"
                min="0"
                step="1"
                value={form.min_order}
                onChange={(e) => update({ min_order: e.target.value })}
                placeholder="—"
                dir="ltr"
                className={`${inputCls} text-right`}
              />
            </Field>

            <Field label="الحد الأقصى للطلب (اختياري)">
              <input
                type="number"
                min="0"
                step="1"
                value={form.max_order}
                onChange={(e) => update({ max_order: e.target.value })}
                placeholder="—"
                dir="ltr"
                className={`${inputCls} text-right`}
              />
            </Field>
          </div>

          <Field label="نطاق التوصيل (اختياري)">
            <input
              type="text"
              value={form.delivery_zone}
              onChange={(e) => update({ delivery_zone: e.target.value })}
              placeholder="مثال: شربين - المركز"
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="الفرع">
              <select
                value={form.branch}
                onChange={(e) => handleBranch(e.target.value)}
                className={selectCls}
              >
                {BRANCHES.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="عنوان الفرع">
              <input
                type="text"
                value={form.branch_label_ar}
                onChange={(e) => update({ branch_label_ar: e.target.value })}
                className={inputCls}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="ترتيب الفائز (رقم)">
              <input
                type="number"
                min="1"
                step="1"
                value={form.rank}
                onChange={(e) => update({ rank: e.target.value })}
                dir="ltr"
                className={`${inputCls} text-right`}
              />
            </Field>

            <Field label="عنوان الترتيب">
              <input
                type="text"
                value={form.rank_label_ar}
                onChange={(e) => update({ rank_label_ar: e.target.value })}
                placeholder="مثال: الفائز الأول"
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="تاريخ انتهاء الصلاحية" required>
            <input
              type="date"
              value={form.expiry_date}
              onChange={(e) => update({ expiry_date: e.target.value })}
              required
              dir="ltr"
              className={`${inputCls} text-right`}
            />
          </Field>

          {error && (
            <div className="rounded-lg border border-status-expired/40 bg-status-expired/10 text-status-expired text-sm font-bold px-3 py-2">
              {error}
            </div>
          )}

          <div className="pt-2 border-t border-white/10 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="px-4 py-2 rounded-lg border border-white/20 text-white/80 hover:bg-white/10 text-sm font-bold transition-colors disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={[
                'px-5 py-2 rounded-lg font-black text-sm transition-colors',
                submitting
                  ? 'bg-brand-yellow/40 text-brand-black/50 cursor-not-allowed'
                  : 'bg-brand-yellow hover:bg-brand-yellow-dark text-brand-black',
              ].join(' ')}
            >
              {submitting
                ? 'جارٍ الحفظ...'
                : mode === 'edit'
                ? 'حفظ التعديلات ✓'
                : 'إنشاء فائز ✓'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  'w-full px-3 py-2 rounded-lg bg-bg-dark border-2 border-white/10 focus:border-brand-yellow outline-none text-white text-sm';

const selectCls = `${inputCls} appearance-none`;

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="block mb-1.5 text-sm font-bold text-white/80">
        {label}
        {required && <span className="text-brand-red"> *</span>}
      </span>
      {children}
    </label>
  );
}

function PrizePreview({ type }) {
  const prize = getPrize(type);
  const Icon = prize.Icon;
  return (
    <div
      className={`relative overflow-hidden rounded-xl border bg-gradient-to-bl ${prize.card_gradient} ${prize.border} px-4 py-3`}
    >
      <span
        aria-hidden="true"
        className={`absolute top-0 right-0 bottom-0 w-1 bg-gradient-to-b ${prize.accent_gradient}`}
      />
      <div className="flex items-start gap-3">
        <div
          className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center shadow-md ${prize.icon_bg} ${prize.icon_text}`}
        >
          {Icon ? <Icon className="w-5 h-5" /> : <span>{prize.emoji}</span>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-black text-white">
              {prize.label_ar}
            </span>
            <span className="text-[10px] font-mono text-white/40">
              {prize.type}
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px]">
            {prize.min_order && (
              <PreviewChip prize={prize} icon="⬆️">
                حد أدنى {prize.min_order} ج.م
              </PreviewChip>
            )}
            {prize.max_order && (
              <PreviewChip prize={prize} icon={prize.type === 'free_delivery' ? '🛵' : '⬇️'}>
                {prize.type === 'free_delivery' ? 'حتى' : 'حد أقصى'} {prize.max_order} ج.م
              </PreviewChip>
            )}
            {prize.requires_delivery_zone && (
              <PreviewChip prize={prize} icon="📍">
                داخل المدينة
              </PreviewChip>
            )}
            {prize.excludes_delivery && (
              <PreviewChip prize={prize} icon="🚫">
                لا يشمل التوصيل
              </PreviewChip>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewChip({ prize, icon, children }) {
  return (
    <span
      className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full border ${prize.chip_bg} ${prize.chip_text} ${prize.chip_border}`}
    >
      <span aria-hidden="true">{icon}</span>
      <span>{children}</span>
    </span>
  );
}
