/**
 * RedemptionResult.jsx — Step 3 of the staff flow.
 *
 * Renders a status-aware action card with the prize-typed theme + a
 * verification checklist driven by the prize catalog.
 */

import { describeConditions, getPrize } from '../constants/prizes';

export default function RedemptionResult({ winner, onRedeem, onReset }) {
  if (!winner) return null;

  const prize = getPrize(winner.prize_type);
  const Icon = prize.Icon;
  const conditions = describeConditions(winner);

  const isActive = winner.status === 'active';
  const isRedeemed = winner.status === 'redeemed';
  const isExpired = winner.status === 'expired';

  // Card border style by status (status takes priority over prize theme).
  const cardBorder = isActive
    ? 'border-status-active/50 shadow-[0_0_24px_rgba(34,197,94,0.25)]'
    : isExpired
    ? 'border-status-expired/40 opacity-90'
    : 'border-white/10';

  return (
    <div className="w-full max-w-lg mx-auto">
      <article
        className={[
          'relative rounded-2xl bg-bg-card border-2 p-6 sm:p-8 animate-fade-in-up overflow-hidden',
          cardBorder,
        ].join(' ')}
      >
        {/* Prize-typed background wash */}
        <div
          aria-hidden="true"
          className={`absolute inset-0 pointer-events-none bg-gradient-to-bl ${prize.card_gradient}`}
        />

        {/* Top accent stripe */}
        <div
          aria-hidden="true"
          className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-l ${prize.accent_gradient}`}
        />

        {/* Prize header */}
        <div className="relative flex items-start gap-4">
          <div
            className={[
              'shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg',
              prize.icon_bg,
              prize.icon_text,
            ].join(' ')}
          >
            {Icon ? (
              <Icon className="w-8 h-8" />
            ) : (
              <span className="text-3xl" aria-hidden="true">
                {prize.emoji}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div
              className={`text-[11px] uppercase tracking-wide font-black ${prize.chip_text}`}
            >
              {prize.short_label_ar}
            </div>
            <h2 className="text-2xl font-black text-white leading-tight">
              {winner.prize_label_ar || prize.label_ar}
            </h2>
            <p className="text-sm text-white/60 mt-1">
              {winner.prize_detail_ar || prize.default_detail_ar}
            </p>
          </div>
        </div>

        {/* Winner meta */}
        <div className="relative mt-5 space-y-1.5 text-sm">
          <div className="flex items-center gap-2 text-white">
            <span aria-hidden="true">👤</span>
            <span className="font-bold">{winner.name_ar}</span>
          </div>
          {winner.phone && (
            <div className="flex items-center gap-2 text-white/80">
              <span aria-hidden="true">📱</span>
              <a
                href={`tel:${winner.phone}`}
                className="font-mono font-bold tracking-wider text-brand-yellow hover:underline"
                dir="ltr"
              >
                {winner.phone}
              </a>
            </div>
          )}
          <div className="flex items-center gap-2 text-white/70">
            <span aria-hidden="true">📍</span>
            <span>{winner.branch_label_ar}</span>
          </div>
          <div className="flex items-center gap-2 text-white/70">
            <span aria-hidden="true">📅</span>
            <span>تنتهي في: {winner.expiry_date}</span>
          </div>
          {winner.rank_label_ar && !prize.hide_rank && (
            <div className="flex items-center gap-2 text-brand-yellow">
              <span aria-hidden="true">🏆</span>
              <span className="font-bold">{winner.rank_label_ar}</span>
            </div>
          )}
        </div>

        {/* Verification checklist (catalog-driven) */}
        {conditions.length > 0 && (
          <div className="relative mt-5 rounded-xl border border-brand-yellow/25 bg-brand-yellow/5 p-3 space-y-2">
            <div className="flex items-center gap-2 text-brand-yellow font-black text-sm">
              <span aria-hidden="true">📋</span>
              <span>تحقّق قبل التسليم</span>
            </div>
            <ul className="space-y-1.5">
              {conditions.map((c, i) => {
                const isRequired = c.kind === 'required';
                return (
                  <li
                    key={i}
                    className={[
                      'rounded-lg border px-3 py-2',
                      isRequired
                        ? 'border-status-active/30 bg-status-active/5'
                        : 'border-white/10 bg-bg-dark/40',
                    ].join(' ')}
                  >
                    <div className="flex items-start gap-2">
                      <span aria-hidden="true" className="text-base">
                        {c.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-xs font-bold text-white/80">
                            {c.label}
                          </span>
                          <span
                            className={[
                              'text-xs font-black px-2 py-0.5 rounded-full',
                              isRequired
                                ? 'bg-status-active/20 text-status-active'
                                : 'bg-white/10 text-white/70',
                            ].join(' ')}
                          >
                            {c.value}
                          </span>
                        </div>
                        {c.hint && (
                          <p className="mt-1 text-[11px] text-white/55 leading-relaxed">
                            {c.hint}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            {winner.terms_ar && (
              <p className="text-[11px] text-white/65 leading-relaxed pt-1.5 border-t border-white/10">
                <span className="text-brand-yellow">📝 </span>
                {winner.terms_ar}
              </p>
            )}
          </div>
        )}

        {/* Status block */}
        <div className="relative mt-6 rounded-xl border border-white/10 p-4 bg-bg-dark/50">
          {isActive && (
            <div className="text-center">
              <div className="text-3xl" aria-hidden="true">
                ✅
              </div>
              <p className="mt-2 text-status-active font-black">
                الجائزة فعّالة وجاهزة للتسليم
              </p>
            </div>
          )}

          {isRedeemed && (
            <div className="text-center">
              <div
                className="text-4xl text-status-redeemed"
                aria-hidden="true"
              >
                🔒
              </div>
              <p className="mt-2 text-white font-black">
                🎉 تم تسليم هذه الجائزة مسبقاً
              </p>
              <p className="mt-2 text-sm text-white/70">
                سُلِّم بواسطة:{' '}
                <span className="font-bold text-white">
                  {winner.redeemed_by_team_ar || '—'}
                </span>
              </p>
              {winner.redeemed_at && (
                <p className="text-xs text-white/50 mt-1">
                  بتاريخ: {winner.redeemed_at}
                </p>
              )}
            </div>
          )}

          {isExpired && (
            <div className="text-center">
              <div className="text-3xl" aria-hidden="true">
                ⏰
              </div>
              <p className="mt-2 text-status-expired font-black">
                انتهت صلاحية هذه الجائزة
              </p>
              <p className="text-xs text-white/50 mt-1">
                انتهت في: {winner.expiry_date}
              </p>
            </div>
          )}
        </div>

        {/* Action button */}
        <button
          type="button"
          onClick={isActive ? onRedeem : undefined}
          disabled={!isActive}
          className={[
            'mt-6 w-full py-3 rounded-xl font-black text-lg transition-colors flex items-center justify-center gap-2',
            isActive
              ? 'bg-brand-red hover:bg-brand-red-bright text-white'
              : 'bg-white/10 text-white/40 cursor-not-allowed',
          ].join(' ')}
        >
          {isActive ? (
            <span>تسليم الجائزة 🎁</span>
          ) : isRedeemed ? (
            <span>🔒 تم التسليم</span>
          ) : (
            <span>⏰ منتهي الصلاحية</span>
          )}
        </button>
      </article>

      {/* Back to lookup */}
      <div className="text-center mt-4">
        <button
          type="button"
          onClick={onReset}
          className="text-sm text-white/60 hover:text-brand-yellow transition-colors underline underline-offset-4"
        >
          بحث عن كود آخر ↩
        </button>
      </div>
    </div>
  );
}
