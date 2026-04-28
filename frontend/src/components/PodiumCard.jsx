/**
 * PodiumCard.jsx — premium card for the grand-prize winners.
 *
 * Per the contest rules, the three top spots are all "الجائزة الكبرى" — they
 * share a unified golden treatment with NO rank numbers shown. If a winner
 * happens to have a non-grand prize_type (legacy data), we still gracefully
 * render the prize-typed theme.
 *
 * Same data discipline as WinnerCard: NO status, NO expiry, NO redemption
 * info on public surfaces.
 */

import { getPrize } from '../constants/prizes';

export default function PodiumCard({ winner, index = 0 }) {
  const prize = getPrize(winner.prize_type);
  const Icon = prize.Icon;
  const isGrand = prize.is_top_tier;

  // Subtle visual hierarchy via index — center card slightly raised on desktop.
  const liftClass = index === 1 ? 'lg:scale-105 lg:-mt-4' : '';

  return (
    <article
      className={[
        'group relative rounded-3xl border-2 p-6 pt-20 backdrop-blur-sm transition-all duration-300',
        'animate-fade-in-up overflow-hidden hover:-translate-y-1',
        prize.border,
        prize.glow,
        `bg-gradient-to-br ${prize.card_gradient}`,
        isGrand ? 'animate-float' : '',
        liftClass,
      ].join(' ')}
      style={{ animationDelay: `${index * 0.12}s` }}
    >
      {/* Decorative shimmer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(circle at 30% 0%, rgba(255,255,255,0.15), transparent 60%)',
        }}
      />

      {isGrand && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-full animate-shimmer opacity-40"
        />
      )}

      {/* Floating prize medal */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div
          className={[
            'w-20 h-20 rounded-full flex items-center justify-center font-black',
            'shadow-2xl border-4 border-bg-dark',
            prize.icon_bg,
            prize.icon_text,
          ].join(' ')}
        >
          {Icon ? (
            <Icon className="w-9 h-9" />
          ) : (
            <span className="text-4xl" aria-hidden="true">
              {prize.emoji}
            </span>
          )}
        </div>
        <div
          className={[
            'mt-2 px-3.5 py-1 rounded-full text-xs font-black shadow-lg border whitespace-nowrap',
            prize.chip_bg,
            prize.chip_text,
            prize.chip_border,
          ].join(' ')}
        >
          {prize.badge_ar}
        </div>
      </div>

      {/* Prize headline — for grand_prize the yellow badge under the medal
          already says "الجائزة الكبرى", so the headline shows the actual
          prize item (e.g. "صينية أنا وانت") using the same typography as
          the regular WinnerCard so the layout stays visually consistent.
          For other prize types we keep label + detail. */}
      <div className="relative text-center">
        {isGrand ? (
          <h3 className="text-base sm:text-lg font-black text-white leading-tight">
            {winner.prize_detail_ar || prize.default_detail_ar}
          </h3>
        ) : (
          <>
            <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {winner.prize_label_ar || prize.label_ar}
            </h3>
            <p className="mt-1 text-sm text-white/70">
              {winner.prize_detail_ar || prize.default_detail_ar}
            </p>
          </>
        )}
      </div>

      {/* Winner meta */}
      <div className="relative mt-5 pt-4 border-t border-white/15 space-y-1.5 text-sm text-center">
        <div className="flex items-center justify-center gap-2 text-white">
          <span aria-hidden="true">👤</span>
          <span className="font-black text-base">
            {winner.public_name_ar || winner.name_ar}
          </span>
        </div>
        <div className="flex items-center justify-center gap-2 text-white/70">
          <span aria-hidden="true">📍</span>
          <span>{winner.branch_label_ar}</span>
        </div>
      </div>
    </article>
  );
}
