# Deploy to Vercel — Big Shawerma Contest

This guide covers two paths. **Read §1 first** to pick the right one.

> Run [PRODUCTION.md](./PRODUCTION.md) end-to-end before starting either path.

---

## 1. Pick a path

The backend persists data by writing to `backend/data/winners.json`. Vercel serverless functions have an **ephemeral filesystem** — every write is discarded when the lambda exits. You have two correct options:

### Path A — Split deploy (recommended, zero code changes)

- **Frontend** → Vercel (static Vite build).
- **Backend** → Render / Railway / Fly.io (long-running Node + persistent disk).
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for the backend host setup, then follow §2 below for Vercel.

### Path B — All on Vercel (requires a database migration)

- **Frontend** → Vercel.
- **Backend** → Vercel Serverless Functions, with `winners.json` replaced by **Vercel KV** (Redis) or **Vercel Postgres**.
- Follow §3 below — the JSON file becomes a one-time seed; all reads/writes go through KV.

❌ **Do not deploy the current backend as-is to Vercel.** Every admin edit and every redemption will silently disappear within minutes.

---

## 2. Path A — Frontend on Vercel (backend elsewhere)

Prerequisite: backend already running and reachable, e.g. `https://big-shawerma-api.onrender.com`.

### 2.1. Import the repo

1. <https://vercel.com/new> → **Import Git Repository** → pick the repo.
2. **Framework Preset**: Vite (auto-detected).
3. **Root Directory**: `contest/frontend`.
4. **Build Command**: `npm run build` (default).
5. **Output Directory**: `dist` (default).
6. **Install Command**: `npm install` (default).

### 2.2. Environment variables

In the Vercel project → **Settings → Environment Variables**:

| Name | Value | Environments |
|---|---|---|
| `VITE_API_URL` | `https://big-shawerma-api.onrender.com/api` | Production, Preview, Development |

Important:

- `VITE_*` variables are inlined into the JS bundle at **build time**. After changing this value, click **Deployments → … → Redeploy** to rebuild.
- Do **not** put any secret values in `VITE_*` — they are public.

### 2.3. Deploy

Click **Deploy**. Vercel:

1. Runs `npm install` in `contest/frontend`.
2. Runs `npm run build` → outputs `dist/`.
3. Reads [frontend/vercel.json](./frontend/vercel.json) for SPA rewrites and security headers.
4. Publishes to `https://<project>.vercel.app`.

### 2.4. Wire backend CORS to Vercel

On your backend host (Render/Railway/Fly), set:

```
FRONTEND_URL=https://big-shawerma.vercel.app,https://*-yourteam.vercel.app
NODE_ENV=production
```

Restart the backend, then verify:

```powershell
curl.exe -I -H "Origin: https://big-shawerma.vercel.app" https://big-shawerma-api.onrender.com/api/health
# Expect: Access-Control-Allow-Origin: https://big-shawerma.vercel.app
```

### 2.5. Smoke test

Open the Vercel URL and verify:

- Public page loads winners.
- `/admin` login + create/edit a winner → reload → change persists (proves backend storage works).
- `/staff` login + redeem a code → reload → status shows `redeemed`.
- DevTools → Network → API calls go to `VITE_API_URL`, no CORS errors.
- Lighthouse / mobile preview shows correct RTL Arabic layout.

### 2.6. Custom domain (optional)

Vercel → **Settings → Domains** → add `contest.big-shawerma.com`. After DNS propagation, **add it to `FRONTEND_URL`** on the backend and redeploy the backend.

---

## 3. Path B — All on Vercel (KV migration)

This requires code changes. The summary below is the minimum viable path.

### 3.1. Provision Vercel KV

1. Vercel project → **Storage → Create Database → KV**.
2. Connect it to the project. Vercel auto-injects `KV_REST_API_URL`, `KV_REST_API_TOKEN`, etc.

### 3.2. Restructure the backend as serverless functions

Vercel does not run a long-lived `app.listen(PORT)` — each route becomes a function. Create `contest/api/` (sibling of `frontend/`):

```
contest/
  api/
    health.js
    winners.js
    check-code.js
    lookup.js
    redeem.js
    admin/
      winners.js          # GET list + POST create
      winners/[id].js     # PUT edit + DELETE
      winners/[id]/status.js
  frontend/
  vercel.json             # NEW — root-level, routes /api/* to functions, everything else to frontend/dist
```

Each handler has the signature `export default function (req, res) { ... }`. Convert the existing Express routers by extracting the inner logic.

### 3.3. Replace `fs.writeFileSync` with KV

Create `contest/api/_lib/store.js`:

```js
import { kv } from '@vercel/kv';

const KEY = 'winners:data';
const SEED = require('../../backend/data/winners.json');

export async function readData() {
  const data = await kv.get(KEY);
  if (data) return data;
  await kv.set(KEY, SEED);            // first-boot seed
  return SEED;
}

export async function writeData(data) {
  await kv.set(KEY, data);
}
```

Then in every route, replace:

```js
const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
// ... mutate ...
fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
```

with:

```js
const data = await readData();
// ... mutate ...
await writeData(data);
```

⚠️ KV does not provide cross-request locks. For the redemption flow, use `kv.eval` with a Lua script *or* gate writes with a versioned compare-and-swap (`kv.set(KEY, next, { nx: false })` after re-reading). Without this, two simultaneous redemptions of the same code can both succeed.

### 3.4. Add a root `vercel.json`

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/frontend/dist/index.html" }
  ]
}
```

### 3.5. Install KV client

```powershell
cd contest
npm install @vercel/kv
```

### 3.6. Deploy

1. Push to GitHub.
2. Vercel → **Import** the repo with **Root Directory = `contest`**.
3. Add env var `NODE_ENV=production` (KV vars are auto-injected).
4. Deploy.
5. Migrate the seed: hit `/api/health` once to trigger the first read, which seeds KV.

### 3.7. Verify

- `/api/winners` returns the seeded list.
- `/admin` create → refresh page → entry persists.
- Open Vercel **Storage → KV → Data Browser** and confirm `winners:data` exists.

---

## 4. Common pitfalls

| Symptom | Cause | Fix |
|---|---|---|
| `404` on every page after refresh | SPA rewrite missing | confirm `frontend/vercel.json` has the catch-all rewrite (already configured) |
| CORS error in browser | `FRONTEND_URL` not set or wrong | set on backend host, include both prod and preview origins |
| Admin edits vanish after a few minutes | Path A picked but backend deployed to Vercel by mistake | redeploy backend on Render/Railway/Fly |
| Build fails: `Cannot find module '@vercel/kv'` | Path B without `npm install @vercel/kv` | install in `contest/`, commit `package.json` + lockfile |
| `VITE_API_URL` change has no effect | Vars are inlined at build time | trigger a new deploy after changing |
| Backend logs show `Not allowed by CORS` | Vercel preview URL not in `FRONTEND_URL` | add wildcard `https://*-yourteam.vercel.app` |

---

## 5. Post-deploy checklist

- [ ] `https://<frontend>/` loads winners.
- [ ] `https://<api>/api/health` returns 200.
- [ ] CORS allows the production frontend origin.
- [ ] Admin can create/edit/delete a test winner; refresh confirms persistence.
- [ ] Staff can redeem a test code; refresh confirms `status === redeemed`.
- [ ] No secret leaks: `curl https://<api>/api/winners` returns no `code`, no `phone`, no `teams`.
- [ ] Tag the release: `git tag v1.0.0-prod && git push --tags`.
