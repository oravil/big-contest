/**
 * HeroSection.jsx — full-bleed hero for the public page.
 *
 * Visuals:
 *  - Two large yellow clip-path polygons in opposite corners.
 *  - One red accent rectangle in the top-right (RTL: visually leading).
 *  - Subtle radial glow behind the centerpiece.
 *  - Centerpiece: the brand logo (/logo.png) as the hero image.
 *  - Title with brand-gold gradient + animated subtitle + scroll hint.
 */

export default function HeroSection({ contestActive }) {
  const isActive = contestActive !== false; // default to active when unknown

  return (
    <section
      className="relative w-full overflow-hidden bg-brand-black flex items-center"
      style={{ minHeight: 'min(100vh, 880px)' }}
    >
      {/* ----- Decorative shapes ----- */}

      {/* Top-left big yellow polygon */}
      <div
        className="absolute -top-12 -left-16 w-[280px] h-[280px] sm:w-[420px] sm:h-[420px] bg-brand-yellow/90 pointer-events-none"
        style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
        aria-hidden="true"
      />
      {/* Bottom-right big yellow polygon */}
      <div
        className="absolute -bottom-16 -right-16 w-[320px] h-[320px] sm:w-[480px] sm:h-[480px] bg-brand-yellow/85 pointer-events-none"
        style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}
        aria-hidden="true"
      />
      {/* Red accent rectangle (top-right) */}
      <div
        className="absolute top-10 right-8 w-32 h-3 bg-brand-red rotate-12 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-16 right-20 w-20 h-2 bg-brand-red-bright rotate-12 pointer-events-none opacity-80"
        aria-hidden="true"
      />

      {/* Subtle radial glow behind logo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 55%, rgba(255,184,0,0.10) 0%, rgba(0,0,0,0) 55%)',
        }}
        aria-hidden="true"
      />

      {/* ----- Content ----- */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-12">
        {/* Text block */}
        <div className="animate-fade-in-up text-center lg:text-right order-2 lg:order-1">
          {/* Trust chip */}
          <span
            className={[
              'inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold border',
              isActive
                ? 'text-status-active border-status-active/40 bg-status-active/10'
                : 'text-white/50 border-white/20 bg-white/5',
            ].join(' ')}
          >
            <span
              className={[
                'inline-block w-1.5 h-1.5 rounded-full',
                isActive ? 'bg-status-active animate-pulse' : 'bg-white/30',
              ].join(' ')}
            />
            <span>
              {isActive
                ? 'المسابقة فعّالة — نتائج رسمية'
                : 'المسابقة انتهت — نتائج رسمية'}
            </span>
          </span>

          <h1
            className="mt-4 font-black leading-[1.05] text-gradient-gold"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)' }}
          >
            خليك مع الكبير
          </h1>
          <h2
            className="mt-2 font-bold text-brand-orange"
            style={{ fontSize: 'clamp(1.25rem, 3.5vw, 2.25rem)' }}
          >
            انت الاهم
          </h2>

          <p className="mt-5 text-sm sm:text-base lg:text-lg text-white/70 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            شوف الأبطال اللي كسبوا جوائزهم الكبيرة 🏆
            <br className="hidden sm:inline" />
            تحقّق من كودك وروح استلم جايزتك من أقرب فرع.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center lg:justify-start gap-3">
            <a
              href="#winners"
              className="tap-target inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-yellow hover:bg-brand-yellow-dark text-brand-black font-black text-base sm:text-lg shadow-lg shadow-brand-yellow/25 hover:shadow-brand-yellow/40 transition-all hover:-translate-y-0.5"
            >
              <span>قاعة الأبطال</span>
              <span aria-hidden="true">🏆</span>
            </a>
            <span className="tap-target inline-flex items-center px-4 py-3 rounded-xl border border-white/15 text-white/70 text-sm">
              <span aria-hidden="true" className="ml-1.5">📍</span>
              شربين | بلقاس
            </span>
          </div>
        </div>

        {/* Brand logo as hero image */}
        <div className="relative h-[280px] sm:h-[420px] lg:h-[520px] flex items-center justify-center order-1 lg:order-2">
          {/* Soft yellow glow ring behind the logo */}
          <div
            className="absolute w-[260px] h-[260px] sm:w-[380px] sm:h-[380px] lg:w-[460px] lg:h-[460px] rounded-full pointer-events-none animate-spin-slow"
            style={{
              background:
                'conic-gradient(from 0deg, rgba(255,184,0,0.25), rgba(204,31,31,0.15), rgba(255,184,0,0.25))',
              filter: 'blur(28px)',
            }}
            aria-hidden="true"
          />
          <img
            src="/logo.png"
            alt="Big Shawerma"
            loading="eager"
            decoding="async"
            className="relative h-[240px] sm:h-[360px] lg:h-[440px] w-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.55)] animate-float"
          />
        </div>
      </div>

      {/* Scroll hint */}
      <a
        href="#winners"
        className="hidden sm:flex absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center gap-1.5 text-white/50 hover:text-brand-yellow transition-colors"
        aria-label="انزل لقاعة الأبطال"
      >
        <span className="text-[11px] font-bold tracking-wider">اسحب للأسفل</span>
        <span className="animate-scroll-hint" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </a>
    </section>
  );
}
