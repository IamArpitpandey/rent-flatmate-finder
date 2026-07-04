# Deployment Guide

This covers: (A) getting the free API keys you need, (B) deploying backend +
frontend, and (C) preparing the GitHub submission per the assignment handbook rules.

---

## A. Get your free API keys first

1. **MongoDB Atlas** (free tier): [cloud.mongodb.com](https://cloud.mongodb.com)
   → New Project → Free M0 cluster → Mumbai region (ap-south-1) for best latency
   → Connect → Drivers → copy the connection string → replace `<password>`
   → this is your `MONGO_URI`.
   In Atlas go to **Security → Network Access** → Add IP Address →
   **Allow access from anywhere** (`0.0.0.0/0`) so the hosted backend can reach it.

2. **Groq API key** (free tier): [console.groq.com](https://console.groq.com)
   → Sign up → API Keys → Create API Key → copy it into `GROQ_API_KEY`.
   Model used: `llama-3.3-70b-versatile`. Free tier is more than enough for
   demo and grading traffic.

3. **Brevo SMTP** (free tier, 300 emails/day): [app.brevo.com](https://app.brevo.com)
   → Sign up → Transactional → Email → SMTP & API → SMTP tab
   → copy **SMTP Server**, **Login** (your registered email), and
   **Master Password** (starts with `xsmtp-`) into `SMTP_HOST`, `SMTP_USER`,
   `SMTP_PASS`. Also verify your sender email under Senders & IP → Senders.

4. **Cloudinary** (optional, for listing photos):
   [cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
   → Dashboard shows Cloud Name / API Key / API Secret directly.

---

## B. Deploying

### Backend → Render (free tier)

1. Push this repo to GitHub first (see section C).
2. [render.com](https://render.com) → New → Web Service → connect your repo.
3. Root directory: `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add all variables from `backend/.env.example` under Environment, with real
   values. Set `CLIENT_URL` to your frontend's deployed Vercel URL (fill this
   after deploying the frontend below — Render lets you edit env vars and redeploy).
7. Deploy. Note the resulting URL e.g. `https://flatmatch-api.onrender.com`.

_Railway is an equally good alternative: New Project → Deploy from GitHub →
set root directory to `backend` → add the same env vars → Railway
auto-detects `npm start`._

### Frontend → Vercel (free tier)

1. [vercel.com](https://vercel.com) → New Project → import the same GitHub repo.
2. Root directory: `frontend`
3. Framework preset: Vite (auto-detected).
4. Environment variables:
   - `VITE_API_URL` = `https://<your-render-backend-url>/api`
   - `VITE_SOCKET_URL` = `https://<your-render-backend-url>`
5. Deploy. Note the resulting URL e.g. `https://flatmatch.vercel.app`.
6. Go back to Render → update `CLIENT_URL` to this Vercel URL → redeploy backend
   so CORS and cookies work correctly.

### Seeding production data

From your local machine with the production `MONGO_URI` in `backend/.env`:

```bash
cd backend
npm run seed
```

This creates demo accounts (admin / owner / tenant) and sample listings.
Alternatively, register real accounts through the deployed frontend.

Demo credentials after seeding:

| Role   | Email                  | Password   |
|--------|------------------------|------------|
| Admin  | admin@flatmatch.app    | Admin@123  |
| Owner  | owner1@flatmatch.app   | Owner@123  |
| Tenant | tenant1@flatmatch.app  | Tenant@123 |

### Sanity checklist after deploying

- `GET https://<backend-url>/api/health` → should return `{"success":true,...}`
- Register a tenant + owner on live frontend, post a listing, express interest,
  accept it, send a chat message → confirm Socket.io works (browser DevTools →
  Network → WS should show a live connection, not repeated failed upgrades)
- Check that compatibility score loads on the listing detail page (Groq LLM call)
- Trigger a high-match interest (score ≥ 80) → verify owner receives Brevo email
- Accept the interest → verify tenant receives Brevo email

---

## C. GitHub submission — per the handbook rules

1. **Clean the repo before pushing:**
   ```bash
   # From project root — safe even if these are already absent
   rm -rf backend/node_modules frontend/node_modules
   rm -rf frontend/dist backend/dist
   rm -f backend/.env frontend/.env
   ```
   The provided `.gitignore` already excludes `node_modules/`, `.env`, `dist/`,
   `build/`, `.vscode/`, `.idea/` — this step is just belt-and-suspenders.

2. **Initialize and push to a public repo on branch `main`:**
   ```bash
   cd rent-flatmate-finder
   git init -b main
   git add .
   git commit -m "Rent & Flatmate Finder — full stack submission"
   git remote add origin https://github.com/<your-username>/rent-flatmate-finder.git
   git push -u origin main
   ```
   In GitHub repo Settings → confirm **Visibility: Public**.

3. **Verify it is clean and downloadable:**
   ```bash
   git clone https://github.com/<your-username>/rent-flatmate-finder.git test-clone
   cd test-clone && du -sh .   # should be small — no node_modules committed
   ```

4. **Do not add extra packages** beyond what is in each `package.json`. Both
   `backend/package.json` and `frontend/package.json` list exactly what the
   code uses. If you installed anything extra, run `npm prune` before committing.

5. **Final checklist:**
   - [ ] Branch is `main`
   - [ ] Repo is public
   - [ ] No `node_modules/`, `.env`, `dist/`, `.vscode/`, `.idea/` committed
   - [ ] App runs from a fresh clone following this file + `README.md`
   - [ ] Hosted frontend URL is live and reachable
   - [ ] `README.md`, `SYSTEM_DESIGN.md`, `DEPLOYMENT_GUIDE.md`, `.env.example` present
   - [ ] Repo size is small and fully downloadable

6. **Submit** the GitHub repo link (and the live Vercel URL) as instructed.
