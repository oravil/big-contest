/**
 * PublicPage.jsx — public landing page (route: /).
 *
 * Sections:
 *  - Navbar
 *  - HeroSection
 *  - StatsBar
 *  - Winners Hall ("قاعة الأبطال") — fetched from GET /api/winners
 *  - Footer
 *  - Floating "تحقق من كودك" button + CheckCodePopup modal
 */

import { useEffect, useState } from 'react';

import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import StatsBar from '../components/StatsBar';
import WinnerCard from '../components/WinnerCard';
import PodiumCard from '../components/PodiumCard';
import CheckCodePopup from '../components/CheckCodePopup';
import BrandCredit from '../components/BrandCredit';
import PrizeCatalogTable from '../components/PrizeCatalogTable';

// Use VITE_API_URL in production, fall back to /api (Vite dev proxy).
const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function PublicPage() {
  const [contest, setContest] = useState(null);
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkOpen, setCheckOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE}/winners`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        setContest(data.contest || null);
        setWinners(Array.isArray(data.winners) ? data.winners : []);
      } catch (err) {
        if (!cancelled) setError('تعذّر تحميل قائمة الفائزين');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Sort winners by rank ascending for predictable display.
  const sortedWinners = [...winners].sort(
    (a, b) => (a.rank || 0) - (b.rank || 0)
  );

  // Top of the hall: only ACTIVE grand-prize winners (max 3 enforced by
  // backend). Redeemed / expired / cancelled grand prizes drop out of the
  // podium so it can naturally show 3, 2, 1 or even 0 cards depending on
  // current state — and they still appear in the regular grid below so
  // their history is visible.
  const podium = sortedWinners
    .filter((w) => w.prize_type === 'grand_prize' && w.status === 'active')
    .slice(0, 3);

  const podiumIds = new Set(podium.map((w) => w.id));

  // Regular grid: everything that isn't currently on the podium — i.e. all
  // non-grand prizes plus any inactive grand prizes (history).
  const rest = sortedWinners.filter((w) => !podiumIds.has(w.id));

  // RTL podium order: 2nd-found → 1st-found → 3rd-found, so the first card
  // sits in the visual middle on desktop. On mobile the natural source order
  // applies because the grid stacks vertically.
  const podiumDesktopOrder = [podium[1], podium[0], podium[2]].filter(Boolean);

  return (
    <div id="top" className="min-h-screen bg-bg-dark text-white">
      <Navbar />
      <HeroSection />
      <StatsBar winners={winners} />

      <section
        id="winners"
        className="max-w-7xl mx-auto px-4 sm:px-6 py-16 scroll-mt-20"
      >
        <header className="text-center mb-10">
          <h2 className="text-3xl sm:text-5xl font-black text-brand-yellow">
            قاعة الأبطال 🏆
          </h2>
          <p className="mt-3 text-sm sm:text-base text-white/60">
            {contest?.name_ar || 'خليك مع الكبير / انت الاهم'}
          </p>

          <button
            type="button"
            onClick={() => setCheckOpen(true)}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-brand-yellow/40 bg-brand-yellow/10 hover:bg-brand-yellow hover:text-brand-black text-brand-yellow font-black text-sm transition-colors"
          >
            <span aria-hidden="true">🎟️</span>
            <span>تحقق من كودك</span>
          </button>
        </header>

        {loading && (
          <div className="text-center py-16 text-white/60">
            جارٍ تحميل قائمة الأبطال...
          </div>
        )}

        {error && !loading && (
          <div className="max-w-md mx-auto text-center py-10 px-6 rounded-2xl bg-bg-card border border-status-expired/40 text-status-expired">
            {error}
          </div>
        )}

        {!loading && !error && sortedWinners.length === 0 && (
          <div className="text-center py-16 text-white/60">
            لا توجد بيانات لعرضها حالياً.
          </div>
        )}

        {!loading && !error && sortedWinners.length > 0 && (
          <>
            {podium.length > 0 && (
              <div className="mb-12">
                <div className="text-center mb-6">
                  <span className="inline-block px-4 py-1 rounded-full text-xs font-black tracking-wider text-amber-300 border border-amber-400/40 bg-amber-500/10 uppercase">
                    👑 الجائزة الكبرى
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start max-w-5xl mx-auto pt-8">
                  {podiumDesktopOrder.map((w, i) => (
                    <PodiumCard key={w.id} winner={w} index={i} />
                  ))}
                </div>
              </div>
            )}

            {rest.length > 0 && (
              <div>
                <div className="text-center mb-6">
                  <span className="inline-block px-4 py-1 rounded-full text-xs font-black tracking-wider text-white/60 border border-white/15 bg-white/5 uppercase">
                    🎁 باقي الفائزين
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {rest.map((w, i) => (
                    <WinnerCard key={w.id} winner={w} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Prize catalog reference */}
            <div className="mt-14 max-w-3xl mx-auto">
              <div className="text-center mb-5">
                <span className="inline-block px-4 py-1 rounded-full text-xs font-black tracking-wider text-brand-yellow border border-brand-yellow/40 bg-brand-yellow/5 uppercase">
                  🎁 دليل الجوائز
                </span>
              </div>
              <PrizeCatalogTable variant="public" />
            </div>
          </>
        )}
      </section>

      <footer className="border-t border-white/10 bg-bg-card mt-10">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-right">
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <img
              src="/logo.png"
              alt="Big Shawerma"
              className="h-12 w-auto object-contain mx-auto opacity-70"
            />
            <div className="leading-tight">
              <div className="font-black text-white">Big Shawerma</div>
              <div className="text-xs text-white/50">
                Special Size Food | أكل بمقاسات خاصة
              </div>
            </div>
          </div>

          <div className="text-white/70 text-sm flex items-center justify-center">
            <span className="px-3 py-1 rounded-full border border-white/10">
              شربين | بلقاس
            </span>
          </div>

          <div className="text-white/50 text-xs flex items-center justify-center sm:justify-end">
            مسابقة خليك مع الكبير — النتائج رسمية ✅
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pb-8">
          <BrandCredit />
        </div>
      </footer>

      {/* Floating "check your code" button (always visible) */}
      <button
        type="button"
        onClick={() => setCheckOpen(true)}
        className="tap-target fixed bottom-5 left-5 z-40 inline-flex items-center gap-2 px-4 py-3 rounded-full bg-brand-yellow hover:bg-brand-yellow-dark text-brand-black font-black text-sm shadow-xl shadow-brand-yellow/40 hover:shadow-brand-yellow/60 hover:-translate-y-0.5 transition-all"
        aria-label="تحقق من كودك"
      >
        <span aria-hidden="true">🎟️</span>
        <span>تحقق من كودك</span>
      </button>

      <CheckCodePopup
        open={checkOpen}
        onClose={() => setCheckOpen(false)}
      />
    </div>
  );
}
