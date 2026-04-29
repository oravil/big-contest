/**
 * AdminPage.jsx — admin dashboard (route: /admin).
 *
 * Two-step state machine: 'password' → 'dashboard'.
 * Auth identity (password + teamNameAr) lives in React useState only —
 * never persisted. Page refresh returns to step 1 by design.
 *
 * The admin password is sent on every admin API call via the X-Admin-Password
 * HEADER. It is held in component state purely in memory.
 *
 * Tabs:
 *   - "الفائزون" → WinnersTable + WinnerFormModal + delete/reset confirms
 *   - "الفرق"    → TeamManager + delete-team confirms
 */

import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import AdminPasswordGate from '../components/admin/AdminPasswordGate';
import WinnersTable from '../components/admin/WinnersTable';
import WinnerFormModal from '../components/admin/WinnerFormModal';
import TeamManager from '../components/admin/TeamManager';
import ConfirmDeleteModal from '../components/admin/ConfirmDeleteModal';
import ExportButton from '../components/admin/ExportButton';
import BrandCredit from '../components/BrandCredit';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// ---------- Top-level page ----------

export default function AdminPage() {
  const [step, setStep] = useState('password'); // 'password' | 'dashboard'
  const [auth, setAuth] = useState(null); // { password, teamNameAr }

  if (step === 'password' || !auth) {
    return (
      <AdminPasswordGate
        onSuccess={({ password, teamNameAr }) => {
          setAuth({ password, teamNameAr });
          setStep('dashboard');
        }}
      />
    );
  }

  return (
    <Dashboard
      auth={auth}
      onLogout={() => {
        setAuth(null);
        setStep('password');
      }}
    />
  );
}

// ---------- Dashboard ----------

function Dashboard({ auth, onLogout }) {
  const { password, teamNameAr } = auth;

  const [tab, setTab] = useState('winners'); // 'winners' | 'teams'
  const [topError, setTopError] = useState(null);

  // Contest settings
  const [contest, setContest] = useState(null);
  const [contestBusy, setContestBusy] = useState(false);

  // Winners data
  const [winners, setWinners] = useState([]);
  const [winnersLoading, setWinnersLoading] = useState(true);
  const [winnersError, setWinnersError] = useState(null);

  // Teams data
  const [teams, setTeams] = useState({});
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [teamsError, setTeamsError] = useState(null);
  const [teamsBusy, setTeamsBusy] = useState(false);

  // Modal state — winners
  const [editingWinner, setEditingWinner] = useState(null);
  const [creatingWinner, setCreatingWinner] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Confirm modal state
  const [confirm, setConfirm] = useState(null);
  // confirm shape: { kind, title, message, tone, onConfirm, submitting }

  // ---------- API helpers ----------

  const apiFetch = useCallback(
    async (path, options = {}) => {
      const headers = {
        'X-Admin-Password': password,
        ...(options.headers || {}),
      };
      if (options.body && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }

      const res = await fetch(`${API_BASE}/admin${path}`, {
        ...options,
        headers,
      });

      if (res.status === 401) {
        // Session lost / password rotated — force re-login.
        onLogout();
        throw new Error('UNAUTHORIZED');
      }

      let data = null;
      const text = await res.text();
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = null;
        }
      }

      if (!res.ok) {
        const msg = (data && data.error) || `خطأ في الخادم (${res.status})`;
        const err = new Error(msg);
        err.status = res.status;
        throw err;
      }

      return data;
    },
    [password, onLogout]
  );

  // ---------- Loaders ----------

  const loadWinners = useCallback(async () => {
    setWinnersLoading(true);
    setWinnersError(null);
    try {
      const data = await apiFetch('/winners');
      setWinners(data.winners || []);
    } catch (err) {
      if (err.message !== 'UNAUTHORIZED') {
        setWinnersError(err.message || 'تعذّر تحميل الفائزين');
      }
    } finally {
      setWinnersLoading(false);
    }
  }, [apiFetch]);

  const loadTeams = useCallback(async () => {
    setTeamsLoading(true);
    setTeamsError(null);
    try {
      const data = await apiFetch('/teams');
      setTeams(data.teams || {});
    } catch (err) {
      if (err.message !== 'UNAUTHORIZED') {
        setTeamsError(err.message || 'تعذّر تحميل الفرق');
      }
    } finally {
      setTeamsLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    loadWinners();
    loadTeams();

    // Load contest settings
    apiFetch('/contest')
      .then((data) => setContest(data.contest || null))
      .catch(() => {/* non-critical, ignore */});
  }, [loadWinners, loadTeams]);

  // ---------- Winner actions ----------

  const submitWinnerForm = async (payload) => {
    setFormError(null);
    setFormSubmitting(true);
    try {
      if (editingWinner) {
        await apiFetch(`/winners/${editingWinner.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch('/winners', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      setEditingWinner(null);
      setCreatingWinner(false);
      await loadWinners();
    } catch (err) {
      if (err.message !== 'UNAUTHORIZED') {
        setFormError(err.message || 'تعذّر الحفظ');
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  const askDeleteWinner = (w) => {
    setConfirm({
      kind: 'delete-winner',
      tone: 'danger',
      title: 'حذف الفائز',
      message: (
        <>
          سيتم حذف الفائز <span className="font-bold text-white">{w.name_ar}</span>{' '}
          (<span className="font-mono text-brand-yellow">{w.code}</span>) نهائياً.
        </>
      ),
      onConfirm: async () => {
        setConfirm((c) => ({ ...c, submitting: true }));
        try {
          await apiFetch(`/winners/${w.id}`, { method: 'DELETE' });
          setConfirm(null);
          await loadWinners();
        } catch (err) {
          if (err.message !== 'UNAUTHORIZED') {
            setTopError(err.message || 'تعذّر الحذف');
            setConfirm(null);
          }
        }
      },
      submitting: false,
    });
  };

  const askResetRedemption = (w) => {
    setConfirm({
      kind: 'reset-winner',
      tone: 'warning',
      title: 'إعادة تفعيل الجائزة',
      message: (
        <>
          ستُعاد الجائزة إلى الحالة <span className="font-bold text-status-active">فعّالة</span>{' '}
          وسيتم مسح بيانات التسليم السابقة لـ{' '}
          <span className="font-bold text-white">{w.name_ar}</span>.
        </>
      ),
      onConfirm: async () => {
        setConfirm((c) => ({ ...c, submitting: true }));
        try {
          await apiFetch(`/winners/${w.id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status: 'active' }),
          });
          setConfirm(null);
          await loadWinners();
        } catch (err) {
          if (err.message !== 'UNAUTHORIZED') {
            setTopError(err.message || 'تعذّر التحديث');
            setConfirm(null);
          }
        }
      },
      submitting: false,
    });
  };

  const changeWinnerStatus = async (w, nextStatus) => {
    if (nextStatus === w.status) return;
    setTopError(null);
    try {
      await apiFetch(`/winners/${w.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus }),
      });
      await loadWinners();
    } catch (err) {
      if (err.message !== 'UNAUTHORIZED') {
        setTopError(err.message || 'تعذّر تغيير الحالة');
      }
    }
  };

  // ---------- Contest actions ----------

  const toggleContest = async () => {
    const next = !(contest?.active ?? true);
    setContestBusy(true);
    try {
      const data = await apiFetch('/contest', {
        method: 'PUT',
        body: JSON.stringify({ active: next }),
      });
      setContest(data.contest || null);
    } catch (err) {
      if (err.message !== 'UNAUTHORIZED') {
        setTopError(err.message || 'تعذّر تحديث حالة المسابقة');
      }
    } finally {
      setContestBusy(false);
    }
  };

  // ---------- Team actions ----------

  const updateTeam = async (key, patch) => {
    setTeamsError(null);
    setTeamsBusy(true);
    try {
      await apiFetch(`/teams/${encodeURIComponent(key)}`, {
        method: 'PUT',
        body: JSON.stringify(patch),
      });
      await loadTeams();
    } catch (err) {
      if (err.message !== 'UNAUTHORIZED') {
        setTeamsError(err.message || 'تعذّر التحديث');
      }
    } finally {
      setTeamsBusy(false);
    }
  };

  const addTeam = async (payload, onDone) => {
    setTeamsError(null);
    setTeamsBusy(true);
    try {
      await apiFetch('/teams', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      await loadTeams();
      if (onDone) onDone();
    } catch (err) {
      if (err.message !== 'UNAUTHORIZED') {
        setTeamsError(err.message || 'تعذّر الإضافة');
      }
    } finally {
      setTeamsBusy(false);
    }
  };

  const askDeleteTeam = (key) => {
    setConfirm({
      kind: 'delete-team',
      tone: 'danger',
      title: 'حذف الفريق',
      message: (
        <>
          سيتم حذف الفريق{' '}
          <span className="font-mono text-brand-yellow">{key}</span> نهائياً.
        </>
      ),
      onConfirm: async () => {
        setConfirm((c) => ({ ...c, submitting: true }));
        try {
          await apiFetch(`/teams/${encodeURIComponent(key)}`, {
            method: 'DELETE',
          });
          setConfirm(null);
          await loadTeams();
        } catch (err) {
          if (err.message !== 'UNAUTHORIZED') {
            setTeamsError(err.message || 'تعذّر الحذف');
            setConfirm(null);
          }
        }
      },
      submitting: false,
    });
  };

  // ---------- Render ----------

  return (
    <div className="min-h-screen bg-bg-dark text-white">
      {/* Top bar */}
      <header className="bg-bg-card border-b border-brand-yellow/20 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Big Shawerma"
              className="h-10 w-auto object-contain"
            />
            <span className="text-brand-yellow font-black text-lg">
              لوحة الإدارة
            </span>
            <span className="text-white/40 text-sm hidden sm:inline">
              — {teamNameAr}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="text-xs text-white/50 hover:text-brand-yellow transition-colors"
            >
              الصفحة العامة ↗
            </Link>
            <button
              type="button"
              disabled={contestBusy}
              onClick={toggleContest}
              className={[
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50',
                contest?.active
                  ? 'bg-status-active/15 text-status-active border border-status-active/30 hover:bg-status-expired/15 hover:text-status-expired hover:border-status-expired/30'
                  : 'bg-status-expired/15 text-status-expired border border-status-expired/30 hover:bg-status-active/15 hover:text-status-active hover:border-status-active/30',
              ].join(' ')}
            >
              {contestBusy
                ? '...'
                : contest?.active
                ? '🟢 فعّالة'
                : '🔴 منتهية'}
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-brand-red hover:text-white text-white/80 text-xs font-bold transition-colors"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 pt-5">
        <div className="flex items-center gap-2 border-b border-white/10">
          <TabButton
            active={tab === 'winners'}
            onClick={() => setTab('winners')}
          >
            الفائزون
          </TabButton>
          <TabButton active={tab === 'teams'} onClick={() => setTab('teams')}>
            الفرق
          </TabButton>
        </div>
      </div>

      {/* Top-level error banner */}
      {topError && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="rounded-lg border border-status-expired/40 bg-status-expired/10 text-status-expired text-sm font-bold px-3 py-2 flex items-center justify-between">
            <span>{topError}</span>
            <button
              type="button"
              onClick={() => setTopError(null)}
              className="text-status-expired/70 hover:text-status-expired text-lg leading-none"
              aria-label="إغلاق"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-6">
        {tab === 'winners' ? (
          <section>
            {winnersLoading ? (
              <div className="py-16 text-center text-white/50">
                جارٍ تحميل الفائزين...
              </div>
            ) : winnersError ? (
              <div className="rounded-lg border border-status-expired/40 bg-status-expired/10 text-status-expired text-sm font-bold px-3 py-3">
                {winnersError}
              </div>
            ) : (
              <WinnersTable
                winners={winners}
                onEdit={(w) => {
                  setFormError(null);
                  setEditingWinner(w);
                  setCreatingWinner(false);
                }}
                onDelete={askDeleteWinner}
                onChangeStatus={changeWinnerStatus}
                onResetRedemption={askResetRedemption}
                onAdd={() => {
                  setFormError(null);
                  setEditingWinner(null);
                  setCreatingWinner(true);
                }}
                onExport={null /* dedicated button below for clarity */}
              />
            )}

            <div className="mt-4">
              <ExportButton
                password={password}
                onError={(err) =>
                  setTopError(err.message || 'تعذّر تصدير الملف')
                }
              />
            </div>
          </section>
        ) : (
          <section>
            {teamsLoading ? (
              <div className="py-16 text-center text-white/50">
                جارٍ تحميل الفرق...
              </div>
            ) : (
              <TeamManager
                teams={teams}
                onUpdate={updateTeam}
                onAdd={addTeam}
                onDelete={askDeleteTeam}
                busy={teamsBusy}
                error={teamsError}
              />
            )}
          </section>
        )}
      </main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
        <BrandCredit variant="compact" />
      </footer>

      {/* Modals */}
      {(editingWinner || creatingWinner) && (
        <WinnerFormModal
          mode={editingWinner ? 'edit' : 'create'}
          winner={editingWinner}
          submitting={formSubmitting}
          error={formError}
          onCancel={() => {
            if (formSubmitting) return;
            setEditingWinner(null);
            setCreatingWinner(false);
            setFormError(null);
          }}
          onSubmit={submitWinnerForm}
        />
      )}

      {confirm && (
        <ConfirmDeleteModal
          title={confirm.title}
          message={confirm.message}
          tone={confirm.tone}
          submitting={!!confirm.submitting}
          onCancel={() => {
            if (!confirm.submitting) setConfirm(null);
          }}
          onConfirm={confirm.onConfirm}
        />
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'px-4 py-2.5 -mb-px border-b-2 text-sm font-black transition-colors',
        active
          ? 'border-brand-yellow text-brand-yellow'
          : 'border-transparent text-white/60 hover:text-white',
      ].join(' ')}
    >
      {children}
    </button>
  );
}
