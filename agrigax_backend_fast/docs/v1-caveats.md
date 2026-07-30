# Agrigax V1 — Known Caveats & Limitations

Honest list of what is **not** production-ready in the current build, kept
separate from the feature docs so nobody discovers these in production.
Companion to [`01-subscription-requirements-v2.md`](./01-subscription-requirements-v2.md)
and [`03-development-roadmap.md`](./03-development-roadmap.md).

Status date: 2026-07-19. The core marketplace + manual subscription system is
functional end-to-end for all three roles (customer, vendor/provider, admin).
Everything below is a gap around the edges, in rough priority order.

---

## 1. OTP is never actually sent (blocker for real users)

There is no SMS/email provider integrated. Verification and password-reset
OTPs are returned inside the API response itself when `EXPOSE_OTP=true`
(see `.env.example`) and are otherwise only `console.log`'d on the server.

- Fine for: development, demos, seeded accounts (already verified).
- Before launch: integrate an SMS gateway (e.g. Africa's Talking, Twilio),
  set `EXPOSE_OTP=false`, and remove the `devOtp` field from auth responses.

## 2. Receipt "upload" is a URL field, not a file upload (blocker for real vendors)

`subscription_requests.receipt_url` is deliberately storage-agnostic
(requirements §4.3), but no storage backend exists yet — the vendor-facing
form asks for a *link* to a receipt rather than accepting a photo upload.

- Before launch: wire an upload endpoint to S3 / Supabase Storage /
  Cloudinary and have the frontend upload the file, then submit the returned
  URL/key as `receiptUrl`. No schema change needed.
- Same applies to listing images and user avatars (URL strings today).

## 3. Notifications are in-app only

All five subscription events (approved / rejected / 7-day / 3-day / expired)
correctly create notification rows, and the bell UI works — but nothing is
delivered outside the app. A vendor who never logs in never learns their
plan expired. Depends on the same provider decision as caveat 1.

## 4. Several admin screens are placeholders

The following admin pages render an "coming soon" stub and have no backend:
Roles & Permissions, Featured Services, Announcements, Push Notifications,
Banners, Advertisements, FAQs, Audit Logs (UI), Fraud Monitoring, System
Logs, User Analytics, Performance Reports, general Settings. They were
always scoped as V2+ extras; the links exist in the menu only.

## 5. App-wide test harness is broken (pre-existing)

The subscription module has its own passing suite (`npm test`, 26 tests,
isolated under `test/subscriptions/`). The older tests
(`src/services/auth.test.js`, `src/controllers/auth.test.js`, and the
legacy `agrigax_backend/supertest/*`) do not run — a known issue flagged in
the roadmap (Phase 10 note). New modules should follow the
`test/subscriptions/` pattern, not the old harness.

## 6. Open product decisions (deliberately unresolved)

From requirements §12 — implementation choices that were left open and are
currently *not enforced either way*:

- **Multiple pending requests** (§12.7): a vendor can currently submit more
  than one pending subscription request at a time.
- **Pending request expiry** (§12.3): requests left `pending` are never
  auto-expired; the `expired` status exists but no job sets it.
- **Mid-period plan changes** (§12.6): approving a new request immediately
  replaces the current plan — remaining days on the old plan are forfeited
  (this matches the recommendation in the doc, but it has not been
  product-confirmed).

## 7. Smaller items

- **Reviews are unmoderated by default**: any verified user can review any
  listing without having booked it, and reviews are auto-approved
  (`is_approved: true` on creation). Admin can hide/delete after the fact.
  See the V2 feature list for the planned booking-gated version.
- **Disputes logic lives inside the bookings module**; `routes/disputes.js`
  is a thin shell. Functional, just oddly placed (requirements §1).
- **Seeded dev accounts** (`vendor1/2`, `user1/2`, `admin1`, password
  `1234567890`) and the seeded Business plan / payment methods are created
  by migrations. They are safe for staging but **must not be seeded into a
  production database** — split them out or guard on `NODE_ENV` before a
  production deploy.
- **JWT secrets** default to trivial strings in local `.env` files; any
  shared environment needs long random values (see `.env.example`).
- **No rate limiting / brute-force protection** on auth endpoints.
