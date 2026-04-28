/**
 * StatsBar.jsx — three brand-yellow stats with a JS countUp animation.
 *
 * Dynamic — counts are derived from the winners array passed in as a prop:
 *  - total winners      → winners.length
 *  - distinct prizes    → unique winner.prize_type values
 *  - distinct branches  → unique winner.branch_label_ar values
 *
 * - Numbers animate from 0 → final over 1500ms via requestAnimationFrame.
 * - Numbers render in Arabic-Indic digits (٠–٩).
 * - Bar: dark #1E1E1E, top border in brand-yellow.
 */

import { useEffect, useMemo, useRef, useState } from 'react';

const DURATION_MS = 1500;

/** Convert a Western digit string to Arabic-Indic digits (٠١٢٣٤٥٦٧٨٩). */
const toArabicDigits = (n) =>
  String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);

function CountUpNumber({ target }) {
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);
  const nodeRef = useRef(null);

  // Re-run animation when target changes (e.g. winners load asynchronously).
  useEffect(() => {
    startedRef.current = false;
    setValue(0);
  }, [target]);

  useEffect(() => {
    const el = nodeRef.current;
    if (!el) return;

    let rafId = 0;
    let startTime = 0;

    const tick = (now) => {
      if (!startTime) startTime = now;
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / DURATION_MS);
      // ease-out cubic for a nicer landing
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    const start = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      rafId = requestAnimationFrame(tick);
    };

    // Start when scrolled into view; if IntersectionObserver is unavailable, start immediately.
    if (typeof IntersectionObserver === 'undefined') {
      start();
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              start();
              io.disconnect();
              break;
            }
          }
        },
        { threshold: 0.4 }
      );
      io.observe(el);
      return () => {
        io.disconnect();
        if (rafId) cancelAnimationFrame(rafId);
      };
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [target]);

  return (
    <span
      ref={nodeRef}
      className="block font-black text-brand-yellow animate-count-up"
      style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 1 }}
    >
      {toArabicDigits(value)}
    </span>
  );
}

export default function StatsBar({ winners = [] }) {
  const stats = useMemo(() => {
    const list = Array.isArray(winners) ? winners : [];
    const prizeTypes = new Set();
    const branches = new Set();
    for (const w of list) {
      if (w?.prize_type) prizeTypes.add(w.prize_type);
      const branch = w?.branch_label_ar || w?.branch_id;
      if (branch) branches.add(branch);
    }
    return [
      { value: list.length, label: 'فائز في المسابقة' },
      { value: prizeTypes.size, label: 'أنواع جوائز' },
      { value: branches.size, label: 'فرع مشارك' },
    ];
  }, [winners]);

  return (
    <section className="w-full bg-bg-card border-t-4 border-brand-yellow">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-2">
            <CountUpNumber target={s.value} />
            <span className="text-sm sm:text-base text-white/70 font-bold">
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
