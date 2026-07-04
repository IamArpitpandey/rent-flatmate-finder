# FlatMatch — Rent & Flatmate Finder

An AI-powered platform where owners list rooms and tenants create "looking for room"
profiles. A **Groq LLM-backed** compatibility engine scores every tenant-listing pair,
real-time chat unlocks once both sides express interest, and **Brevo SMTP** email
notifications keep everyone in the loop.

**Live demo:** _add your deployed URL here after following DEPLOYMENT_GUIDE.md_

---

## 1. Tech stack

| Layer        | Choice                                                                |
|--------------|---------------------------------------------------------------------- |
| Frontend     | React 18 + Vite, Tailwind CSS, React Router, Socket.io-client         |
| Backend      | Node.js + Express, Socket.io (WebSocket chat)                         |
| Database     | MongoDB + Mongoose                                                    |
| AI           | Groq LLM (`llama-3.3-70b-versatile`) via REST API                     |
| Auth         | JWT in an httpOnly cookie, role-based (`tenant` / `owner` / `admin`)  |
| Email        | Nodemailer                                                            |
| File storage | Cloudinary (free tier) for listing photos                             |

---

## 2. Project structure

```
rent-flatmate-finder/
├── backend/
│   ├── src/
│   │   ├── config/        # MongoDB + Cloudinary setup
│   │   ├── models/        # Mongoose schemas
│   │   ├── controllers/   # Route handlers
│   │   ├── routes/        # Express routers
│   │   ├── middleware/    # auth, upload, error handling
│   │   ├── services/      # compatibilityService (Groq LLM), emailService, socketService
│   │   ├── utils/         # generateToken, seed script
│   │   ├── app.js         # Express app (middleware + routes)
│   │   └── server.js      # entry point (HTTP + Socket.io + Mongo)
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # ui/, layout/, listing/
│   │   ├── pages/         # Landing, Login, Browse, ListingDetail, Chat, Admin...
│   │   ├── context/       # AuthContext, SocketContext
│   │   └── services/api.js
│   ├── .env.example
│   └── package.json
├── SYSTEM_DESIGN.md
├── DEPLOYMENT_GUIDE.md
└── README.md
```

---

## 3. Local setup

### Prerequisites
- Node.js 18+
- MongoDB connection string — free [MongoDB Atlas](https://cloud.mongodb.com) M0 cluster
- Groq API key — free at [console.groq.com](https://console.groq.com) → API Keys → Create
- Cloudinary account — free at [cloudinary.com](https://cloudinary.com/users/register/free) (optional — listings work without photos)

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env — fill in MONGO_URI, JWT_SECRET, GROQ_API_KEY, SMTP_*, CLOUDINARY_*
npm install
npm run seed     # optional: creates demo admin/owner/tenant accounts + sample listings
npm run dev      # starts on http://localhost:5000
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev      # starts on http://localhost:5173
```

Open `http://localhost:5173`. If you ran the seed script, log in with:

| Role   | Email                  | Password   |
|--------|------------------------|------------|
| Admin  | admin@flatmatch.app    | Admin@123  |
| Owner  | owner1@flatmatch.app   | Owner@123  |
| Tenant | tenant1@flatmatch.app  | Tenant@123 |

---

## 4. API documentation

Base URL: `/api`. All authenticated routes read a JWT from an httpOnly `token` cookie
(also accepted as `Authorization: Bearer <token>` for API testing tools).

### Auth
| Method | Route             | Access        | Description                          |
|--------|-------------------|---------------|--------------------------------------|
| POST   | `/auth/register`  | Public        | Create tenant/owner account          |
| POST   | `/auth/login`     | Public        | Log in, sets httpOnly cookie         |
| POST   | `/auth/logout`    | Authenticated | Clears cookie                        |
| GET    | `/auth/me`        | Authenticated | Current user                         |
| PUT    | `/auth/me`        | Authenticated | Update profile / tenant preferences  |

> Updating tenant preferences via `PUT /auth/me` automatically invalidates
> all cached compatibility scores for that tenant, so the next browse
> triggers a fresh Groq computation.

### Listings
| Method | Route                    | Access      | Description                                          |
|--------|--------------------------|-------------|------------------------------------------------------|
| GET    | `/listings`              | Auth        | Search/filter listings; ranked by compatibility for tenants |
| GET    | `/listings/mine/all`     | Owner/Admin | Owner's own listings                                 |
| GET    | `/listings/:id`          | Auth        | Listing detail + compatibility score                 |
| POST   | `/listings`              | Owner/Admin | Create listing (multipart, field `photos`)           |
| PUT    | `/listings/:id`          | Owner/Admin | Update own listing                                   |
| PATCH  | `/listings/:id/fill`     | Owner/Admin | Mark as filled (hidden from search)                  |
| DELETE | `/listings/:id`          | Owner/Admin | Delete own listing                                   |

### Interests
| Method | Route                      | Access      | Description                              |
|--------|----------------------------|-------------|------------------------------------------|
| POST   | `/interests`               | Tenant      | Express interest in a listing            |
| PATCH  | `/interests/:id/respond`   | Owner/Admin | `{ action: "accept" \| "decline" }`     |
| GET    | `/interests/mine`          | Auth        | Sent (tenant) or received (owner) list   |

### Chat
| Method | Route               | Access      | Description                              |
|--------|---------------------|-------------|------------------------------------------|
| GET    | `/chat/:interestId` | Participant | Message history for an accepted interest |

Real-time events (Socket.io — JWT passed via `auth.token` or cookie):

| Event          | Direction       | Payload                          |
|----------------|-----------------|----------------------------------|
| `chat:join`    | Client → Server | `interestId`                     |
| `chat:message` | Both            | `{ interestId, text }`           |
| `chat:typing`  | Both            | `{ interestId, isTyping }`       |
| `notification:new` | Server → Client | pushed to `user:<id>` room  |

### Notifications & Admin
- `GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`
- `GET /admin/stats`, `GET /admin/users`, `PATCH /admin/users/:id/toggle-active`
- `GET /admin/listings`, `DELETE /admin/listings/:id`

---

## 5. Database schema (MongoDB / Mongoose)

**User** — `name, email, password (bcrypt-hashed), phone, role [tenant|owner|admin],
gender, avatar, preferences: { preferredLocation, budgetMin, budgetMax, moveInDate,
lifestyleTags[], about }, isActive, lastLoginAt`

**Listing** — `owner (ref User), title, description, location: { address, city, lat, lng },
rent, securityDeposit, availableFrom, roomType, furnishing, genderPreference, amenities[],
photos[], status [active|filled|inactive], viewsCount`

**CompatibilityScore** — `tenant (ref User), listing (ref Listing), score (0–100),
explanation, method [llm|fallback]` — unique compound index on `(tenant, listing)`.
Score is computed once and cached; never recomputed on every request.
Automatically invalidated when the tenant updates their preferences.

**Interest** — `tenant (ref User), owner (ref User), listing (ref Listing),
status [pending|accepted|declined], compatibilityScore (ref), message, respondedAt`
— unique compound index on `(tenant, listing)`.

**Message** — `interest (ref Interest), sender (ref User), text, readAt`

**Notification** — `user (ref User), type, title, body, relatedListing,
relatedInterest, isRead`

---

## 6. LLM prompt & example I/O

**Model:** `llama-3.3-70b-versatile` via Groq API

**Prompt template** (see `backend/src/services/compatibilityService.js::buildPrompt`):

```
You are a rental-matching assistant. Given this room listing: {listingJson}
and this tenant profile: {tenantJson}, compute a compatibility score from
0 to 100 based primarily on budget fit and location match, and secondarily
on move-in date alignment and lifestyle/amenity fit.

Respond with ONLY valid JSON, no markdown fences, no extra text, in exactly
this shape:
{"score": <integer 0-100>, "explanation": "<one or two sentence reason, under 240 characters>"}
```

**Example input:**
```json
// listing
{ "title": "Spacious 1BHK near Sector 7", "city": "Delhi", "rent": 9500,
  "roomType": "single", "furnishing": "fully-furnished",
  "genderPreference": "any", "amenities": ["Wifi", "AC", "PowerBackup"] }

// tenant
{ "preferredLocation": "Rohini, Delhi", "budgetMin": 6000, "budgetMax": 12000,
  "moveInDate": "2026-08-01", "lifestyleTags": ["Night Owl", "Non Smoker"] }
```

**Example output:**
```json
{
  "score": 88,
  "explanation": "Rent fits comfortably within budget and the location matches your preferred area exactly. Move-in date aligns and the listing is fully furnished."
}
```

Score and explanation are persisted in `CompatibilityScore` on first computation
and reused on every subsequent view — **the LLM is never called twice for the same
tenant-listing pair** unless the tenant updates their preferences.

---

## 7. LLM failure handling

If `GROQ_API_KEY` is missing, the Groq call times out (12 seconds via `AbortController`),
or the response cannot be parsed into the expected JSON shape, the service transparently
falls back to a **rule-based scorer** (`fallbackScore` in `compatibilityService.js`) that:

- Awards/penalises based on whether rent falls inside `[budgetMin, budgetMax]`
- Awards/penalises based on location string matching
- Penalises gender-preference mismatch
- Adds a small bonus per amenity (capped at 5 pts)

The `method` field (`llm` vs `fallback`) is stored with every score so it is fully
auditable. No request ever fails because the LLM is unavailable — see `SYSTEM_DESIGN.md`.

---

## 8. Notable design choices

- **Groq LLM** (`llama-3.3-70b-versatile`) chosen for reliability, speed, and a
  generous free tier over Gemini — same JSON prompt structure, drop-in replacement.
- **Compatibility cache invalidation** on profile update — `PUT /auth/me` deletes
  all `CompatibilityScore` docs for that tenant so fresh scores are computed on the
  next browse, without requiring a manual DB flush.
- **Cached, not recomputed** scores (unique index + findOneAndUpdate upsert) — avoids
  re-billing the LLM API on every page view.
- **Graceful degradation** everywhere: email failures are logged not thrown, Groq
  failures fall back to rules, missing Cloudinary credentials mean listings are
  created without photos instead of failing.
- **Rate limiting + Helmet** on the API as baseline production hardening.

See `SYSTEM_DESIGN.md` for the full architecture write-up.
