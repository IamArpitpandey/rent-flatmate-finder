# System Design — FlatMatch (Rent & Flatmate Finder)

## 1. Compatibility scoring design

Every tenant carries a `preferences` sub-document (preferred location, budget
range, move-in date, lifestyle tags, a free-text "about"). Every listing
carries structured facts (rent, city/address, room type, furnishing, gender
preference, amenities). When a tenant views or expresses interest in a
listing, `compatibilityService.getOrComputeCompatibility(tenant, listing)`
runs.

It first checks `CompatibilityScore`, a dedicated collection with a unique
compound index on `(tenant, listing)`. If a score already exists it is
returned immediately — **the LLM is never called twice for the same pair**.
This matters for cost (Groq API calls consume rate-limit quota) and for
latency (a browse page rendering 20 listings should not fire 20 fresh LLM
calls on every refresh). A `force` flag exists and is used automatically
when a tenant edits their preferences — `PUT /auth/me` calls
`CompatibilityScore.deleteMany({ tenant })` so the next browse triggers a
fresh Groq computation rather than returning stale scores.

On a cache miss, the service builds a single structured prompt containing
both JSON profiles and asks the Groq LLM to return `{ score, explanation }`
as strict JSON, weighting budget fit and location match highest, then move-in
date and lifestyle/amenity fit. The response is parsed defensively (fenced
code blocks stripped, score clamped 0–100, explanation length-capped at 500
characters) before being upserted into `CompatibilityScore` with
`method: "llm"`.

Ranking reuses the same cache: `GET /listings` computes or reads a score per
result for the logged-in tenant and sorts descending — so "ranked by AI
compatibility" is a byproduct of the same call path used for the detail page,
with no separate ranking service needed.

## 2. LLM integration and fallback

**Model:** `llama-3.3-70b-versatile` served via the Groq API — chosen for
its fast inference, reliable JSON output, and a generous free tier that suits
demo and grading traffic without billing concerns.

The Groq call is wrapped in a 12-second `AbortController` timeout and a
try/catch at the call site. On **any** failure — missing API key, network
error, timeout, non-200 HTTP status, or a response that does not parse into
`{score, explanation}` — the service falls back to `fallbackScore()`, a
deterministic rule-based function that:

- Awards points if rent falls inside `[budgetMin, budgetMax]`; partial
  credit if it is within 15% of the maximum; a penalty otherwise.
- Awards/penalises based on substring matching between the tenant's preferred
  location and the listing's city or address fields.
- Penalises a gender-preference mismatch when the listing specifies one.
- Adds a small bonus per amenity, capped at 5 points.

The result is stored with `method: "fallback"` so it is auditable which
scores came from the model versus the rule engine. Critically, **the request
path that rendered the listing or created the interest never fails** because
of an LLM outage — the user receives a slightly less nuanced score with a
transparent explanation string noting it is a rule-based estimate.

## 3. Real-time chat implementation

Chat is scoped to an `Interest` document, not a generic "conversation"
entity — a tenant and owner can only message once an interest has moved to
`accepted`, keeping the data model aligned with the product rule ("chat
opens once interest is accepted").

Socket.io authenticates each connection in `io.use()` middleware by
verifying the same JWT used for REST (read from `socket.handshake.auth.token`
or the `token` cookie), then joins the socket to a personal room
`user:<id>` for direct notifications.

`chat:join` verifies the requester is a participant of the specific
`Interest` and that its status is `accepted` before joining room
`chat:<interestId>`. `chat:message` re-validates participancy and status
server-side (never trusts the client), persists the message via Mongoose,
populates the sender's public fields, and broadcasts to the room. It also
creates a `Notification` document and emits `notification:new` to the
recipient's personal room even if they are not currently inside the chat
view — so notifications work whether or not the tab is open. Typing
indicators are a lightweight, non-persisted `chat:typing` broadcast.

All messages are persisted in the `Message` collection (indexed on
`interest + createdAt`) so the full conversation history is available on
page load via `GET /chat/:interestId` before Socket.io takes over for
new messages.

## 4. Notification flow

Two channels, driven by the same events, deliberately decoupled so one
failing does not block the other:

1. **In-app** (`Notification` model + Socket.io `notification:new` push) —
   created synchronously as part of the triggering request (interest
   created, interest responded to, new chat message).

2. **Email via Brevo SMTP** (Nodemailer transporter pointed at
   `smtp-relay.brevo.com:587`) — fired via `sendEmail()`, which is
   fire-and-forget from the controller's perspective: it never throws into
   the request handler. If `SMTP_USER` / `SMTP_PASS` are not configured
   the email is logged and skipped rather than erroring, so the core flow
   still works in environments without email set up (e.g. a fresh clone
   before `.env` is filled in).

   Brevo is used instead of Gmail SMTP because it provides a professional
   sender identity, 300 free transactional emails per day, and does not
   require Gmail 2-Step Verification or App Passwords.

Interest creation branches on `compatibilityScore >= HIGH_MATCH_THRESHOLD`
(default 80, configurable via env) to select between the standard
`interestReceived` email template and the escalated `highMatchInterest`
template with a distinct subject line — satisfying the "high compatibility
score" email requirement without a separate polling job, since the score is
already computed synchronously when the interest is created.

When an owner responds, the tenant receives an `interestAccepted` or
`interestDeclined` email via the same fire-and-forget path, ensuring the
notification flow never blocks the API response regardless of SMTP
availability.
