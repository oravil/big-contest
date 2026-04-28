/**
 * Navbar.jsx — top navigation bar for the public page.
 *
 * - Big Shawerma logo (/logo.png).
 * - Brand name + tagline.
 * - Contest title chip.
 * - Scroll-aware shadow & opacity.
 *
 * Staff (/staff) and admin (/admin) routes still exist but are NOT linked
 * from any public page — users must navigate to those URLs directly.
 */

import { useEffect, useState } from 'react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={[
        'sticky top-0 z-30 w-full transition-all duration-300',
        scrolled
          ? 'bg-bg-dark/95 backdrop-blur-md shadow-lg shadow-black/40 border-b border-brand-yellow/25'
          : 'bg-bg-dark/70 backdrop-blur border-b border-brand-yellow/10',
      ].join(' ')}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3">
        {/* Right side (start in RTL): logo + brand */}
        <a href="#top" className="flex items-center gap-3 group">
          <img
            src="/logo.png"
            alt="Big Shawerma"
            className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
          />
          <div className="leading-tight">
            <div className="font-black text-base sm:text-xl text-white">
              Big Shawerma
            </div>
            <div className="hidden sm:block text-[11px] sm:text-xs text-white/50">
              Special Size Food — أكل بمقاسات خاصة
            </div>
          </div>
        </a>

        {/* Left side (end in RTL): contest title chip */}
        <div className="flex items-center">
          <span className="px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-sm font-bold text-brand-yellow border border-brand-yellow/40 bg-brand-yellow/5 whitespace-nowrap">
            خليك مع الكبير 🏆
          </span>
        </div>
      </nav>
    </header>
  );
}
