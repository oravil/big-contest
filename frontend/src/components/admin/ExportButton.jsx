/**
 * ExportButton.jsx — triggers a download of the full winners.json.
 *
 * Hits GET /api/admin/export with the admin password in the X-Admin-Password
 * header. Because the password is a header (not a URL param), we cannot use
 * a plain <a href>. Instead we fetch as a Blob, then create a temporary
 * object URL and click an anchor to save it as "winners.json".
 *
 * Props:
 *  - password: admin password (string) — sent in header, never persisted
 *  - className: optional extra Tailwind classes
 *  - onError(err): optional callback on failure
 */

import { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function ExportButton({ password, className = '', onError }) {
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    if (busy || !password) return;
    setBusy(true);

    let url = null;
    try {
      const res = await fetch(`${API_BASE}/admin/export`, {
        method: 'GET',
        headers: { 'X-Admin-Password': password },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const blob = await res.blob();
      url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'winners.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      if (onError) onError(err);
    } finally {
      if (url) URL.revokeObjectURL(url);
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy || !password}
      className={[
        'px-4 py-2 rounded-lg text-sm font-bold border transition-colors',
        busy || !password
          ? 'bg-white/5 border-white/10 text-white/40 cursor-not-allowed'
          : 'bg-white/10 hover:bg-white/15 border-white/15 text-white',
        className,
      ].join(' ')}
    >
      {busy ? 'جارٍ التحميل...' : 'تصدير JSON ⬇'}
    </button>
  );
}
