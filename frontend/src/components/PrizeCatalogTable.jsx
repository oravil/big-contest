/**
 * PrizeCatalogTable.jsx — official prize catalog reference.
 *
 * Used in two places:
 *  1. Public landing — "جوائز المسابقة" section (informational).
 *  2. Staff page — collapsible reference so customer service can verify
 *     conditions before delivering a prize.
 *
 * Renders one row per prize type with: themed icon, label, conditions
 * (min order, max order, delivery zone, delivery exclusion), and notes.
 *
 * Props:
 *  - variant: 'public' | 'staff' (controls density & extra hints)
 *  - className: extra wrapper classes
 */

import { PRIZES, PRIZE_ORDER } from '../constants/prizes';

export default function PrizeCatalogTable({
  variant = 'public',
  className = '',
}) {
  const isStaff = variant === 'staff';

  return (
    <div
      className={`rounded-2xl border border-white/10 bg-bg-card overflow-hidden ${className}`}
      dir="rtl"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10 bg-gradient-to-l from-brand-yellow/[0.06] via-transparent to-transparent flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-black text-brand-yellow">
            {isStaff ? '📋 دليل الجوائز للفريق' : '🎁 جوائز المسابقة'}
          </h3>
          <p className="text-[11px] sm:text-xs text-white/55 mt-0.5">
            {isStaff
              ? 'راجع الشروط مع العميل قبل التسليم.'
              : 'تعرّف على كل جائزة وشروط الحصول عليها.'}
          </p>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold hidden sm:inline">
          {PRIZE_ORDER.length} جوائز
        </span>
      </div>

      {/* Rows */}
      <ul className="divide-y divide-white/5">
        {PRIZE_ORDER.map((key) => {
          const p = PRIZES[key];
          const Icon = p.Icon;
          return (
            <li
              key={key}
              className={`relative px-4 sm:px-5 py-4 bg-gradient-to-l ${p.card_gradient}`}
            >
              {/* Color accent stripe on the right */}
              <span
                aria-hidden="true"
                className={`absolute top-0 right-0 bottom-0 w-1 bg-gradient-to-b ${p.accent_gradient}`}
              />

              <div className="flex items-start gap-3 sm:gap-4">
                <div
                  className={`shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-md ${p.icon_bg} ${p.icon_text}`}
                >
                  {Icon && <Icon className="w-6 h-6" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm sm:text-base font-black text-white">
                      {p.label_ar}
                    </h4>
                    {p.is_top_tier && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/40">
                        TOP
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/55 mt-0.5">
                    {p.default_detail_ar}
                  </p>

                  {/* Conditions chips */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {p.min_order && (
                      <Chip prize={p} icon="⬆️">
                        حد أدنى {p.min_order} ج.م
                      </Chip>
                    )}
                    {p.max_order && (
                      <Chip prize={p} icon={p.type === 'free_delivery' ? '🛵' : '⬇️'}>
                        {p.type === 'free_delivery' ? 'حتى' : 'حد أقصى'} {p.max_order} ج.م
                      </Chip>
                    )}
                    {p.requires_delivery_zone && (
                      <Chip prize={p} icon="📍">
                        داخل المدينة
                      </Chip>
                    )}
                    {p.excludes_delivery && (
                      <Chip prize={p} icon="🚫">
                        لا يشمل التوصيل
                      </Chip>
                    )}
                    {!p.min_order &&
                      !p.max_order &&
                      !p.requires_delivery_zone &&
                      !p.excludes_delivery && (
                        <Chip prize={p} icon="✨">
                          بدون شروط
                        </Chip>
                      )}
                  </div>

                  {isStaff && p.default_terms_ar && (
                    <p className="mt-2 text-[11px] text-white/55 leading-relaxed border-r-2 border-white/10 pr-2">
                      {p.default_terms_ar}
                    </p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Chip({ prize, icon, children }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${prize.chip_bg} ${prize.chip_text} ${prize.chip_border}`}
    >
      <span aria-hidden="true">{icon}</span>
      <span>{children}</span>
    </span>
  );
}
