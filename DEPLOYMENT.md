# Deployment — Big Shawerma Contest

This is a split-deploy guide:

- **Frontend** → Vercel (static React/Vite build).
- **Backend** → Render / Railway / Fly.io / VPS (persistent Node + writable disk for `winners.json`).

> ⚠️ **Why split?** Vercel serverless functions have an *ephemeral filesystem* — every write to `winners.json` would be lost between invocations. Persistent file storage requires a long-running Node host (Render/Railway/Fly).

---

## 1. Backend — Render (recommended, free tier)

The repo includes a [render.yaml](./render.yaml) blueprint and a [Procfile](./Procfile).

### Steps

1. Push this repo to GitHub.
2. Go to **https://render.com → New → Blueprint**.
3. Connect the GitHub repo. Render reads `render.yaml` automatically:
   - Service: `big-shawerma-api`
   - Build: `npm install`
   - Start: `npm start`
   - Health check: `/api/health`
   - Persistent disk: `/var/data` (1 GB)
   - `DATA_PATH=/var/data/winners.json` (the bundled `backend/data/winners.json` is copied there on first boot)
4. Wait for the deploy to go green, then copy the public URL, e.g.
   `https://big-shawerma-api.onrender.com`.
5. **After the Vercel frontend is live**, set `FRONTEND_URL` in the Render dashboard
   → *Environment* tab → e.g.
   ```
   FRONTEND_URL=https://big-shawerma.vercel.app,https://*-yourname.vercel.app
   ```
   (comma-separated — wildcards `*` are allowed for preview deploys).
6. Render auto-redeploys on every push to `main`.

### Alternative hosts

| Host | Persistent disk | Notes |
|---|---|---|
| **Render** | yes (`/var/data`) | render.yaml provided |
| **Railway** | yes (volumes) | use `Procfile`, set `DATA_PATH=/data/winners.json`, mount volume at `/data` |
| **Fly.io** | yes (volumes) | `fly launch` from `contest/`, `fly volumes create data --size 1` |
| **Self-hosted VPS** | yes | run `npm start` under `pm2` or `systemd` |

---

## 2. Frontend — Vercel

The frontend is configured via [`frontend/vercel.json`](./frontend/vercel.json).

### Steps

1. **Vercel Dashboard → Add New → Project → Import** the same GitHub repo.
2. Configure:
   - **Root Directory**: `contest/frontend`
   - **Framework Preset**: Vite (auto-detected)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)
3. **Environment Variables** → add:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://big-shawerma-api.onrender.com/api` *(from step 1.4 + `/api`)* |

4. Click **Deploy**. Once green, copy the production URL (e.g. `https://big-shawerma.vercel.app`) and paste it into Render's `FRONTEND_URL`.
5. (Optional) Add a custom domain in Vercel → Settings → Domains.

---

## 3. Local development

```powershell
# Install deps
cd contest
npm install
cd frontend; npm install; cd ..

# Run both servers in parallel
npm run dev
# → backend at http://localhost:3001
# → frontend at http://localhost:5173 (proxies /api → :3001)
```

In dev, leave `VITE_API_URL` empty — the Vite dev server proxies `/api` to the local backend automatically.

---

## 4. Security checklist

Before going live:

- [ ] Change all default team passwords in `backend/data/winners.json` (`teams.*.password`).
- [ ] Rotate the admin password (`teams.admin.password`).
- [ ] Set `FRONTEND_URL` on the backend host to your real Vercel domain (no leading wildcard unless needed).
- [ ] Confirm `NODE_ENV=production` on the backend.
- [ ] Confirm Render/Railway disk is mounted *before* first traffic (the bundled `winners.json` is copied on first boot only).
- [ ] Hit `https://your-api/api/health` from a browser — should return `{"status":"ok"}`.
- [ ] Hit `https://your-api/api/winners` — should return the public list (no `code`, no `phone`, no `teams`).

---

## 5. Updating winners after deploy

Two options:

1. **Admin UI (recommended)** — log in at `https://your-frontend/admin` with the admin password and use the form/table.
2. **Replace the file** — SSH/Render Shell into the backend instance and edit `/var/data/winners.json` directly (the server re-reads it on every request).

Avoid editing `backend/data/winners.json` in the repo *after* deployment — it is only used as a one-time seed when the persistent disk is empty.
