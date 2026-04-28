/**
 * BrandCredit.jsx — software-house credit line for "Oravil Software".
 *
 * Variants:
 *  - "full"    → footer block with logo glyph + dual-language label + year.
 *  - "compact" → single inline line, suitable for sticky bars / minimal pages.
 */

const YEAR = new Date().getFullYear();

export default function BrandCredit({ variant = 'full', className = '' }) {
  if (variant === 'compact') {
    return (
      <div
        className={`text-[11px] text-white/45 flex items-center justify-center gap-1.5 ${className}`}
        dir="rtl"
      >
        <span>© {YEAR}</span>
        <span className="text-white/30">•</span>
        <span>تطوير وبرمجة</span>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="group inline-flex items-center gap-1 font-black tracking-wide"
          aria-label="Oravil Software"
        >
          <OravilGlyph className="w-3.5 h-3.5" />
          <span className="bg-gradient-to-l from-brand-yellow via-amber-300 to-brand-yellow bg-clip-text text-transparent">
            Oravil Software
          </span>
        </a>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-l from-brand-yellow/[0.04] via-white/[0.02] to-transparent px-5 py-4 ${className}`}
      dir="rtl"
    >
      {/* decorative shimmer accent */}
      <div
        aria-hidden="true"
        className="absolute -top-px right-0 left-0 h-px bg-gradient-to-l from-transparent via-brand-yellow/40 to-transparent"
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right">
        <div className="flex items-center gap-3">
          <span className="relative inline-flex items-center justify-center w-10 h-10 rounded-xl bg-bg-dark border border-brand-yellow/30 shadow-md shadow-brand-yellow/10">
            <OravilGlyph className="w-5 h-5" />
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/5"
            />
          </span>

          <div className="leading-tight">
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/40 font-bold">
              Crafted with care · صُنع بإتقان
            </div>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="group inline-flex items-baseline gap-2 mt-0.5"
              aria-label="Oravil Software"
            >
              <span className="text-base font-black tracking-wide bg-gradient-to-l from-brand-yellow via-amber-200 to-brand-yellow bg-clip-text text-transparent">
                Oravil Software
              </span>
              <span className="text-[11px] text-white/45 font-bold">
                أُرافيل لحلول البرمجيات
              </span>
            </a>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-white/45 font-mono">
          <span>©</span>
          <span>{YEAR}</span>
          <span className="text-white/25">·</span>
          <span className="text-white/55">جميع الحقوق محفوظة</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Stylized "O" mark — two interlocking arcs forming the Oravil glyph.
 * Pure SVG, inherits currentColor for the inner stroke.
 */
function OravilGlyph({ className = '' }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      role="img"
      aria-label="Oravil"
    >
      <defs>
        <linearGradient id="oravilGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFD93B" />
          <stop offset="55%" stopColor="#F5C518" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
      </defs>
      <circle
        cx="16"
        cy="16"
        r="12"
        fill="none"
        stroke="url(#oravilGold)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeDasharray="60 18"
        transform="rotate(-30 16 16)"
      />
      <circle cx="16" cy="16" r="3.2" fill="url(#oravilGold)" />
    </svg>
  );
}
