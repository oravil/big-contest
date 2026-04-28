/**
 * TeamManager.jsx — admin tab #2: list, edit, add, delete teams.
 *
 * The server NEVER returns real passwords (always "***" from /api/admin/teams).
 * Editing a password means SETTING a new one via PUT /api/admin/teams/:key.
 * The admin team is protected from deletion server-side; we also hide its
 * delete button as a UX hint.
 *
 * Props:
 *  - teams: { [key]: { name_ar, password: "***" } }
 *  - onUpdate(key, { name_ar?, password? })   → PUT
 *  - onAdd({ key, name_ar, password })        → POST
 *  - onDelete(key)                            → DELETE (with confirm)
 *  - busy: boolean (disables all action buttons during a request)
 *  - error: string | null
 */

import { useState } from 'react';

const TEAM_LABELS = {
  admin: 'المدير',
  whatsapp: 'خدمة عملاء واتساب',
  phone: 'خدمة عملاء هاتف',
  hall: 'استقبال الصالة',
  takeaway: 'تيك أواي',
};

export default function TeamManager({
  teams,
  onUpdate,
  onAdd,
  onDelete,
  busy = false,
  error = null,
}) {
  const [adding, setAdding] = useState(false);

  const teamKeys = Object.keys(teams || {});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-black text-brand-yellow">
          الفرق ({teamKeys.length})
        </h2>
        <button
          type="button"
          onClick={() => setAdding(true)}
          disabled={busy}
          className="px-4 py-2 rounded-lg bg-brand-yellow hover:bg-brand-yellow-dark text-brand-black text-sm font-black transition-colors disabled:opacity-50"
        >
          + إضافة فريق
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-status-expired/40 bg-status-expired/10 text-status-expired text-sm font-bold px-3 py-2">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-bg-card overflow-hidden">
        {teamKeys.length === 0 ? (
          <div className="px-4 py-10 text-center text-white/50">
            لا توجد فرق.
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {teamKeys.map((key) => (
              <TeamRow
                key={key}
                teamKey={key}
                team={teams[key]}
                onUpdate={onUpdate}
                onDelete={onDelete}
                busy={busy}
              />
            ))}
          </ul>
        )}
      </div>

      {adding && (
        <AddTeamForm
          existingKeys={teamKeys}
          onCancel={() => setAdding(false)}
          onSubmit={(payload) => {
            onAdd(payload, () => setAdding(false));
          }}
          busy={busy}
        />
      )}
    </div>
  );
}

// ---------- One team row ----------

function TeamRow({ teamKey, team, onUpdate, onDelete, busy }) {
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(team.name_ar || '');

  const [changingPwd, setChangingPwd] = useState(false);
  const [pwd, setPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const isAdmin = teamKey === 'admin';

  const saveName = () => {
    if (!name.trim() || name.trim() === team.name_ar) {
      setEditingName(false);
      setName(team.name_ar || '');
      return;
    }
    onUpdate(teamKey, { name_ar: name.trim() });
    setEditingName(false);
  };

  const savePwd = () => {
    if (!pwd || pwd.length < 4) return;
    onUpdate(teamKey, { password: pwd });
    setPwd('');
    setShowPwd(false);
    setChangingPwd(false);
  };

  return (
    <li className="px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
      {/* Key + name */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 rounded-md bg-white/10 text-white/70 text-xs font-mono">
            {teamKey}
          </span>
          {isAdmin && (
            <span className="px-2 py-0.5 rounded-md bg-brand-red/20 text-brand-red border border-brand-red/30 text-[10px] font-bold">
              محمي
            </span>
          )}
        </div>

        {editingName ? (
          <div className="mt-2 flex items-center gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-md bg-bg-dark border border-white/15 text-white text-sm focus:outline-none focus:border-brand-yellow"
            />
            <button
              type="button"
              onClick={saveName}
              disabled={busy}
              className="px-3 py-1.5 rounded-md bg-brand-yellow text-brand-black text-xs font-black"
            >
              حفظ ✓
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingName(false);
                setName(team.name_ar || '');
              }}
              className="px-3 py-1.5 rounded-md border border-white/20 text-white/70 text-xs font-bold"
            >
              إلغاء
            </button>
          </div>
        ) : (
          <div className="mt-1 flex items-center gap-2">
            <span className="text-white font-bold">
              {team.name_ar || TEAM_LABELS[teamKey] || '—'}
            </span>
            <button
              type="button"
              onClick={() => setEditingName(true)}
              className="text-xs text-white/40 hover:text-brand-yellow"
            >
              تعديل ✎
            </button>
          </div>
        )}
      </div>

      {/* Password */}
      <div className="sm:w-80">
        {changingPwd ? (
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type={showPwd ? 'text' : 'password'}
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                placeholder="كلمة مرور جديدة"
                dir="ltr"
                autoComplete="new-password"
                className="w-full px-3 py-1.5 rounded-md bg-bg-dark border border-white/15 text-white text-sm focus:outline-none focus:border-brand-yellow"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute top-1/2 -translate-y-1/2 left-2 text-white/50 hover:text-brand-yellow text-xs"
              >
                {showPwd ? 'إخفاء' : 'إظهار'}
              </button>
            </div>
            <button
              type="button"
              onClick={savePwd}
              disabled={busy || pwd.length < 4}
              className="px-3 py-1.5 rounded-md bg-brand-yellow text-brand-black text-xs font-black disabled:opacity-50"
            >
              تعيين ✓
            </button>
            <button
              type="button"
              onClick={() => {
                setChangingPwd(false);
                setPwd('');
                setShowPwd(false);
              }}
              className="px-3 py-1.5 rounded-md border border-white/20 text-white/70 text-xs font-bold"
            >
              إلغاء
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 justify-between">
            <span className="font-mono text-white/60 tracking-widest text-sm" dir="ltr">
              ••••••••
            </span>
            <button
              type="button"
              onClick={() => setChangingPwd(true)}
              disabled={busy}
              className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/15 text-white text-xs font-bold disabled:opacity-50"
            >
              تغيير كلمة المرور 🔑
            </button>
          </div>
        )}
      </div>

      {/* Delete (hidden for admin) */}
      <div className="sm:w-28 flex justify-end">
        {!isAdmin && (
          <button
            type="button"
            onClick={() => onDelete(teamKey)}
            disabled={busy}
            className="px-3 py-1.5 rounded-md bg-status-expired/20 hover:bg-status-expired/40 text-status-expired text-xs font-bold disabled:opacity-50 transition-colors"
          >
            حذف 🗑
          </button>
        )}
      </div>
    </li>
  );
}

// ---------- Add team inline form ----------

function AddTeamForm({ existingKeys, onCancel, onSubmit, busy }) {
  const [key, setKey] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [pwd, setPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [localError, setLocalError] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    setLocalError(null);

    const k = key.trim();
    if (!/^[a-zA-Z0-9_-]+$/.test(k)) {
      setLocalError('مفتاح الفريق يجب أن يكون أحرف/أرقام إنجليزية فقط');
      return;
    }
    if (existingKeys.includes(k)) {
      setLocalError('هذا المفتاح مستخدم بالفعل');
      return;
    }
    if (!nameAr.trim()) {
      setLocalError('اسم الفريق مطلوب');
      return;
    }
    if (!pwd || pwd.length < 4) {
      setLocalError('كلمة المرور يجب ألا تقل عن ٤ أحرف');
      return;
    }

    onSubmit({ key: k, name_ar: nameAr.trim(), password: pwd });
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-brand-yellow/30 bg-bg-card p-4 sm:p-5 space-y-3"
    >
      <h3 className="text-base font-black text-brand-yellow">إضافة فريق جديد</h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <label className="block">
          <span className="block mb-1 text-xs font-bold text-white/70">
            مفتاح الفريق (إنجليزي)
          </span>
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            dir="ltr"
            placeholder="e.g. callcenter"
            className="w-full px-3 py-2 rounded-md bg-bg-dark border border-white/15 text-white text-sm focus:outline-none focus:border-brand-yellow"
          />
        </label>

        <label className="block">
          <span className="block mb-1 text-xs font-bold text-white/70">
            اسم الفريق (عربي)
          </span>
          <input
            type="text"
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            placeholder="مثال: مركز الاتصال"
            className="w-full px-3 py-2 rounded-md bg-bg-dark border border-white/15 text-white text-sm focus:outline-none focus:border-brand-yellow"
          />
        </label>

        <label className="block">
          <span className="block mb-1 text-xs font-bold text-white/70">
            كلمة المرور
          </span>
          <div className="relative">
            <input
              type={showPwd ? 'text' : 'password'}
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              dir="ltr"
              autoComplete="new-password"
              className="w-full px-3 py-2 rounded-md bg-bg-dark border border-white/15 text-white text-sm focus:outline-none focus:border-brand-yellow"
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute top-1/2 -translate-y-1/2 left-2 text-white/50 hover:text-brand-yellow text-xs"
            >
              {showPwd ? 'إخفاء' : 'إظهار'}
            </button>
          </div>
        </label>
      </div>

      {localError && (
        <p className="text-sm font-bold text-status-expired">{localError}</p>
      )}

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="px-4 py-2 rounded-md border border-white/20 text-white/80 hover:bg-white/10 text-sm font-bold transition-colors disabled:opacity-50"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={busy}
          className="px-5 py-2 rounded-md bg-brand-yellow hover:bg-brand-yellow-dark text-brand-black text-sm font-black disabled:opacity-50 transition-colors"
        >
          {busy ? 'جارٍ الحفظ...' : 'إضافة الفريق ✓'}
        </button>
      </div>
    </form>
  );
}
