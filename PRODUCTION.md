# Production readiness — Big Shawerma Contest

Run through every section in order before opening the URL to real customers.

---

## 1. Repository hygiene

- [ ] `git status` is clean on `main`.
- [ ] No real passwords, codes, or phone numbers committed in `backend/data/winners.json`.
- [ ] `.env.example` is up to date; `.env` is in `.gitignore` (already configured).
- [ ] `node_modules/` is **not** committed.
- [ ] `frontend/dist/` is **not** committed.

```powershell
cd contest
git ls-files | Select-String -Pattern '(node_modules|/dist/|\.env$)'  # should print nothing
```

---

## 2. Local build smoke test

The app must build cleanly on your machine before you push.

```powershell
cd contest
npm install
cd frontend
npm install
npm run build         # produces frontend/dist
cd ..

# Boot the backend in production mode and let it serve the built frontend
$env:NODE_ENV = "production"
$env:FRONTEND_URL = "http://localhost:3001"
npm start
```

Open <http://localhost:3001/> — the public page must load, the winners list must render, and `/api/health` must return `{"status":"ok"}`.

Stop with `Ctrl+C` and reset env:

```powershell
Remove-Item Env:NODE_ENV
Remove-Item Env:FRONTEND_URL
```

---

## 3. Secrets & passwords

`backend/data/winners.json` ships with placeholder team passwords. **Change all of them** before deploy:

| Field | What it does | Default | Action |
|---|---|---|---|
| `teams.admin.password` | Admin UI access | `BIG_ADMIN_2025` | rotate |
| `teams.whatsapp.password` | Staff redemption | `BIG_WA_2025` | rotate |
| `teams.phone.password` | Staff redemption | `BIG_PH_2025` | rotate |
| `teams.hall.password` | Staff redemption | `BIG_HL_2025` | rotate |
| `teams.takeaway.password` | Staff redemption | `BIG_TK_2025` | rotate |

Generate strong passwords (PowerShell):

```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 24 | ForEach-Object {[char]$_})
```

Distribute the new staff passwords through a private channel — never email/Slack them in plain text.

---

## 4. Data sanity check

Before pushing, validate the seed file:

```powershell
cd contest
node -e "JSON.parse(require('fs').readFileSync('backend/data/winners.json','utf8')); console.log('OK')"
```

Also verify business rules:

- [ ] At most **3** winners with `prize_type === 'grand_prize'` and `status === 'active'`.
- [ ] Every `phone` matches `/^01[0125]\d{8}$/`.
- [ ] Every `expiry_date` is `YYYY-MM-DD`.
- [ ] Every `code` is unique.

Quick check:

```powershell
$d = Get-Content backend/data/winners.json -Raw | ConvertFrom-Json
$d.winners | Where-Object { $_.prize_type -eq 'grand_prize' -and $_.status -eq 'active' } | Measure-Object  # count <= 3
$d.winners | Group-Object code | Where-Object Count -gt 1                                                 # must be empty
$d.winners | Where-Object { $_.phone -notmatch '^01[0125]\d{8}$' }                                        # must be empty
```

---

## 5. Storage decision (critical)

The backend **writes** to `winners.json` on:

- `POST /api/admin/winners` (create)
- `PUT /api/admin/winners/:id` (edit)
- `PUT /api/admin/winners/:id/status` (status change)
- `DELETE /api/admin/winners/:id` (delete)
- `POST /api/redeem` (mark redeemed)

This means the host **must provide a persistent, writable filesystem**. Pick one:

| Option | Persistence | Backend host | Frontend host |
|---|---|---|---|
| **A. Split deploy (recommended)** | yes | Render / Railway / Fly | Vercel |
| **B. All on Vercel** | requires migration to Vercel KV or Postgres | Vercel Functions | Vercel |
| **C. Single VPS** | yes | self-hosted (`pm2` + Nginx) | served by backend |

If you pick **A** or **C**, no code changes are needed. If you pick **B**, you must replace `fs.writeFileSync` with a database — see [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md) §3.

---

## 6. Environment variables

**Backend** (whichever host):

| Var | Required | Example |
|---|---|---|
| `NODE_ENV` | yes | `production` |
| `PORT` | host-provided | `3001` |
| `FRONTEND_URL` | yes | `https://big-shawerma.vercel.app,https://*-yourname.vercel.app` |
| `DATA_PATH` | recommended | `/var/data/winners.json` (or KV namespace if option B) |

**Frontend** (Vercel):

| Var | Required | Example |
|---|---|---|
| `VITE_API_URL` | yes | `https://big-shawerma-api.onrender.com/api` |

Note: `VITE_*` vars are baked into the build at build time. Changing them requires a new Vercel deploy.

---

## 7. CORS

`backend/server.js` reads `FRONTEND_URL` and supports comma-separated origins with `*` wildcards (good for Vercel preview URLs):

```
FRONTEND_URL=https://big-shawerma.vercel.app,https://*-yourname.vercel.app
```

Verify after deploy:

```powershell
curl.exe -I -H "Origin: https://big-shawerma.vercel.app" https://your-api/api/health
# Look for: Access-Control-Allow-Origin: https://big-shawerma.vercel.app
```

---

## 8. Monitoring & rollback

- [ ] Bookmark `/api/health` and check it after every deploy.
- [ ] Tag your release: `git tag v1.0.0 && git push --tags`.
- [ ] Note the previous Vercel deployment URL — Vercel's *Promote to Production* on a previous deployment is the fastest rollback.
- [ ] On Render/Railway/Fly, redeploy the previous commit from the dashboard.

---

## 9. Final pre-launch checklist

- [ ] All passwords rotated (§3).
- [ ] Data file validated (§4).
- [ ] Storage strategy chosen (§5).
- [ ] Env vars set on both hosts (§6).
- [ ] CORS confirmed (§7).
- [ ] Backend `/api/health` returns 200.
- [ ] Frontend public page loads and lists winners.
- [ ] `/admin` login works with the new admin password.
- [ ] Staff `/staff` login + redemption works end-to-end with one test winner.
- [ ] `/api/winners` does **not** expose `code`, `phone`, `teams`, or `expiry_date` fields.
- [ ] Mobile RTL layout looks correct on real iOS Safari + Android Chrome.
