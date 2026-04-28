/**
 * WinnerCard.jsx — themed winner tile for the public hall (ranks 4+).
 *
 * Top-3 (grand-prize) winners are rendered by PodiumCard.jsx. This card
 * handles every other prize type — color, icon, and label come from the
 * central catalog (constants/prizes.js).
 *
 * Public surfaces never expose code/phone/status/expiry — those reach the
 * winner only via the "تحقق من كودك" popup.
 */

import { getPrize } from '../constants/prizes';

function RankBadge({ rank }) {
  return (
    <div className="absolute top-3 right-3 w-9 h-9 rounded-full border-2 border-brand-yellow text-brand-yellow font-black flex items-center justify-center text-sm bg-bg-dark/70 backdrop-blur shadow-md">
      {rank}
    </div>
  );
}

export default function WinnerCard({ winner, index = 0 }) {
  const prize = getPrize(winner.prize_type);
  const Icon = prize.Icon;

  return (
    <article
      className={[
        'group relative rounded-2xl bg-bg-card p-4 pt-12 card-hover overflow-hidden',
        'border animate-fade-in-up transition-all hover:-translate-y-0.5',
        prize.border,
        prize.glow,
      ].join(' ')}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      {/* Themed background wash */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 pointer-events-none bg-gradient-to-bl ${prize.card_gradient}`}
      />

      {/* Top accent stripe */}
      <div
        aria-hidden="true"
        className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-l ${prize.accent_gradient}`}
      />

      {!prize.hide_rank && winner.rank && <RankBadge rank={winner.rank} />}
      {prize.hide_rank && (
        <span
          className={`absolute top-3 right-3 text-[10px] font-black px-2 py-1 rounded-full border backdrop-blur ${prize.chip_bg} ${prize.chip_text} ${prize.chip_border}`}
        >
          {prize.badge_ar}
        </span>
      )}

      {/* Prize block */}
      <div className="relative flex items-start gap-3">
        <div
          className={[
            'shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-md',
            'transition-transform group-hover:scale-110',
            prize.icon_bg,
            prize.icon_text,
          ].join(' ')}
        >
          {Icon ? (
            <Icon className="w-6 h-6" />
          ) : (
            <span aria-hidden="true">{prize.emoji}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div
            className={`text-[10px] uppercase tracking-wide font-black ${prize.chip_text}`}
          >
            {prize.short_label_ar}
          </div>
          <p className="text-xs text-white/60 mt-0.5 line-clamp-2">
            {winner.prize_detail_ar || prize.default_detail_ar}
          </p>
        </div>
      </div>

      {/* Winner meta */}
      <div className="relative mt-4 pt-3 border-t border-white/10 space-y-1 text-xs">
        <div className="flex items-center gap-2 text-white">
          <span aria-hidden="true">👤</span>
          <span className="font-bold truncate">
            {winner.public_name_ar || winner.name_ar}
          </span>
        </div>
        <div className="flex items-center gap-2 text-white/60">
          <span aria-hidden="true">📍</span>
          <span className="truncate">{winner.branch_label_ar}</span>
        </div>
      </div>
    </article>
  );
}
