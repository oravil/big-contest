/**
 * WinnersTable.jsx — full management table for winners (admin tab #1).
 *
 * Receives the list + handler callbacks from AdminPage. The parent owns
 * fetching/state; this component renders rows and dispatches actions.
 *
 * Props:
 *  - winners: full winner objects (with codes)
 *  - onEdit(winner)
 *  - onDelete(winner)
 *  - onChangeStatus(winner, nextStatus)
 *  - onResetRedemption(winner)   // shortcut: status → "active"
 *  - onAdd()
 *  - onExport()                   // optional, shown next to "add"
 */

import { getPrize } from '../../constants/prizes';

const prizeLabel = (type) => {
  const p = getPrize(type);
  return `${p.emoji} ${p.short_label_ar}`;
};

const STATUS_META = {
  active: { ar: 'فعّالة', cls: 'bg-status-active/20 text-status-active border-status-active/40' },
  redeemed: { ar: 'مُسلَّمة', cls: 'bg-status-redeemed/20 text-status-redeemed border-status-redeemed/40' },
  expired: { ar: 'منتهية', cls: 'bg-status-expired/20 text-status-expired border-status-expired/40' },
  cancelled: { ar: 'ملغاة', cls: 'bg-white/10 text-white/60 border-white/20' },
};

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.cancelled;
  return (
    <span className={`inline-block px-2 py-0.5 rounded-md border text-[11px] font-bold ${meta.cls}`}>
      {meta.ar}
    </span>
  );
}

export default function WinnersTable({
  winners,
  onEdit,
  onDelete,
  onChangeStatus,
  onResetRedemption,
  onAdd,
  onExport,
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-black text-brand-yellow">
          الفائزون ({winners.length})
        </h2>
        <div className="flex items-center gap-2">
          {onExport && (
            <button
              type="button"
              onClick={onExport}
              className="tap-target px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-bold border border-white/15 transition-colors"
            >
              تصدير JSON ⬇
            </button>
          )}
          <button
            type="button"
            onClick={onAdd}
            className="tap-target px-4 py-2 rounded-lg bg-brand-yellow hover:bg-brand-yellow-dark text-brand-black text-sm font-black transition-colors shadow-md shadow-brand-yellow/20"
          >
            + إضافة فائز
          </button>
        </div>
      </div>

      {/* ---- Desktop / tablet table ---- */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-white/10 bg-bg-card">
        <table className="w-full text-right text-sm">
          <thead className="bg-white/5 text-white/70 text-xs uppercase tracking-wide sticky top-0">
            <tr>
              <th className="px-3 py-3 font-bold">#</th>
              <th className="px-3 py-3 font-bold">الكود</th>
              <th className="px-3 py-3 font-bold">الاسم</th>
              <th className="px-3 py-3 font-bold">رقم الهاتف</th>
              <th className="px-3 py-3 font-bold">الاسم العام</th>
              <th className="px-3 py-3 font-bold">الجائزة</th>
              <th className="px-3 py-3 font-bold">الفرع</th>
              <th className="px-3 py-3 font-bold">الانتهاء</th>
              <th className="px-3 py-3 font-bold">الحالة</th>
              <th className="px-3 py-3 font-bold">التسليم</th>
              <th className="px-3 py-3 font-bold text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {winners.length === 0 && (
              <tr>
                <td colSpan={11} className="px-3 py-10 text-center text-white/50">
                  لا يوجد فائزون بعد.
                </td>
              </tr>
            )}

            {winners.map((w) => (
              <tr
                key={w.id}
                className="border-t border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="px-3 py-3 text-white/60 font-mono">{w.id}</td>
                <td className="px-3 py-3 font-mono text-brand-yellow tracking-wider">
                  {w.code}
                </td>
                <td className="px-3 py-3 font-bold text-white">{w.name_ar}</td>
                <td className="px-3 py-3 font-mono text-white/80" dir="ltr">
                  {w.phone || '—'}
                </td>
                <td className="px-3 py-3 text-white/70">
                  {w.public_name_ar || '—'}
                </td>
                <td className="px-3 py-3">
                  <div className="text-white/90">
                    {prizeLabel(w.prize_type)}
                  </div>
                  <div className="text-white/50 text-xs mt-0.5">
                    {w.prize_detail_ar}
                  </div>
                </td>
                <td className="px-3 py-3 text-white/80">{w.branch_label_ar}</td>
                <td className="px-3 py-3 font-mono text-white/70" dir="ltr">
                  {w.expiry_date}
                </td>
                <td className="px-3 py-3">
                  <StatusBadge status={w.status} />
                </td>
                <td className="px-3 py-3 text-xs text-white/60">
                  {w.status === 'redeemed' ? (
                    <div className="space-y-0.5">
                      <div className="text-white/80">{w.redeemed_by_team_ar}</div>
                      <div className="text-white/50">{w.redeemed_at}</div>
                    </div>
                  ) : (
                    <span className="text-white/30">—</span>
                  )}
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => onEdit(w)}
                      title="تعديل"
                      className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-brand-yellow hover:text-brand-black text-white text-xs font-bold transition-colors"
                    >
                      تعديل ✎
                    </button>

                    <select
                      value={w.status}
                      onChange={(e) => onChangeStatus(w, e.target.value)}
                      className="px-2 py-1 rounded-md bg-bg-dark border border-white/15 text-white text-xs font-bold focus:outline-none focus:border-brand-yellow"
                    >
                      <option value="active">فعّالة</option>
                      <option value="redeemed">مُسلَّمة</option>
                      <option value="expired">منتهية</option>
                      <option value="cancelled">ملغاة</option>
                    </select>

                    {w.status === 'redeemed' && (
                      <button
                        type="button"
                        onClick={() => onResetRedemption(w)}
                        title="إعادة تفعيل"
                        className="px-2.5 py-1 rounded-md bg-status-active/20 hover:bg-status-active/40 text-status-active text-xs font-bold transition-colors"
                      >
                        إعادة تفعيل ↺
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onDelete(w)}
                      title="حذف"
                      className="px-2.5 py-1 rounded-md bg-status-expired/20 hover:bg-status-expired/40 text-status-expired text-xs font-bold transition-colors"
                    >
                      حذف 🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---- Mobile card list ---- */}
      <div className="md:hidden space-y-3">
        {winners.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-bg-card p-6 text-center text-white/50">
            لا يوجد فائزون بعد.
          </div>
        )}

        {winners.map((w) => (
          <article
            key={w.id}
            className="rounded-2xl border border-white/10 bg-bg-card p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-brand-yellow tracking-wider text-sm">
                    {w.code}
                  </span>
                  <StatusBadge status={w.status} />
                </div>
                <div className="mt-1 font-bold text-white truncate">
                  {w.name_ar}
                </div>
                {w.phone && (
                  <div className="mt-0.5 font-mono text-xs text-white/70" dir="ltr">
                    📱 {w.phone}
                  </div>
                )}
              </div>
              <span className="text-[10px] font-mono text-white/40 shrink-0">
                {w.id}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-white/70">
              <div>
                <div className="text-[10px] text-white/40 uppercase">الجائزة</div>
                <div className="text-white/90 font-bold">
                  {prizeLabel(w.prize_type)}
                </div>
                <div className="text-white/50 text-[11px]">
                  {w.prize_detail_ar}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-white/40 uppercase">الفرع</div>
                <div className="text-white/90">{w.branch_label_ar}</div>
                <div className="text-white/50 font-mono text-[11px]" dir="ltr">
                  انتهاء: {w.expiry_date}
                </div>
              </div>
            </div>

            {w.status === 'redeemed' && (
              <div className="rounded-lg bg-status-redeemed/10 border border-status-redeemed/30 px-3 py-2 text-xs">
                <div className="text-white/80 font-bold">
                  {w.redeemed_by_team_ar}
                </div>
                <div className="text-white/50">{w.redeemed_at}</div>
              </div>
            )}

            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <button
                type="button"
                onClick={() => onEdit(w)}
                className="tap-target px-3 py-1.5 rounded-md bg-white/10 hover:bg-brand-yellow hover:text-brand-black text-white text-xs font-bold transition-colors"
              >
                تعديل ✎
              </button>
              <select
                value={w.status}
                onChange={(e) => onChangeStatus(w, e.target.value)}
                className="tap-target px-2 py-1.5 rounded-md bg-bg-dark border border-white/15 text-white text-xs font-bold focus:outline-none focus:border-brand-yellow"
              >
                <option value="active">فعّالة</option>
                <option value="redeemed">مُسلَّمة</option>
                <option value="expired">منتهية</option>
                <option value="cancelled">ملغاة</option>
              </select>
              {w.status === 'redeemed' && (
                <button
                  type="button"
                  onClick={() => onResetRedemption(w)}
                  className="tap-target px-3 py-1.5 rounded-md bg-status-active/20 hover:bg-status-active/40 text-status-active text-xs font-bold transition-colors"
                >
                  إعادة تفعيل ↺
                </button>
              )}
              <button
                type="button"
                onClick={() => onDelete(w)}
                className="tap-target px-3 py-1.5 rounded-md bg-status-expired/20 hover:bg-status-expired/40 text-status-expired text-xs font-bold transition-colors mr-auto"
              >
                حذف 🗑
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
