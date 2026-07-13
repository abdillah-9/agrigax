# Agrigax Backend — Deployment Guide

**Authoritative source**: [`docs/01-subscription-requirements-v2.md`](./01-subscription-requirements-v2.md). This document describes how to deploy the system that document specifies — it does not add or change business rules. No deployment scripts are included; this is operational guidance for whoever writes those scripts.

---

## 1. Environments

| Environment | Purpose | Data | Scheduled Job (§7) |
|---|---|---|---|
| **Development** | Local iteration | Seeded fixture data only (see [`04-database-schema.md §8`](./04-database-schema.md#8-seeding-order)) | Runs, but on a short interval (e.g. every few minutes) so expiry/fallback behavior is observable quickly |
| **Staging** | Pre-production verification, mirrors production config | Anonymized or synthetic data, never real vendor payment references | Runs on the production cadence (hourly/daily) |
| **Production** | Live system | Real vendor/admin data | Runs on the production cadence; failures must page/alert (§9 monitoring) |

Each environment runs the same codebase and migrations; only configuration (env vars, job cadence, external service credentials) differs.

---

## 2. Environment Variables

Grouped by concern. Names are illustrative — align with whatever `.env` convention the project already uses.

| Variable | Purpose | Notes |
|---|---|---|
| `NODE_ENV` | `development \| staging \| production` | Controls logging verbosity, error detail exposure |
| `PORT` | HTTP port | |
| `DATABASE_URL` / `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL connection (§1 stack: Knex + MySQL) | Never committed; injected per environment |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | Token signing (§1 stack: JWT access/refresh via httpOnly cookies) | Rotate independently per environment |
| `COOKIE_DOMAIN`, `COOKIE_SECURE` | httpOnly cookie configuration | `COOKIE_SECURE=true` required in staging/production (HTTPS only) |
| `RECEIPT_STORAGE_PROVIDER` | Which backend resolves `receipt_url` (§4.3: "storage-provider-agnostic ... works with S3, Supabase Storage, Cloudinary, or any future storage backend") | Requirements doc deliberately does not mandate one — this is an infrastructure choice |
| `RECEIPT_STORAGE_*` (bucket/key/region, or provider-specific equivalents) | Credentials/config for the chosen storage provider | Scoped to receipt uploads only |
| `SUBSCRIPTION_EXPIRY_JOB_CRON` | Cron expression for the expiry job (§7: "hourly or daily") | Exact cadence is an operational choice, not specified by the requirements doc |
| `SUBSCRIPTION_PRE_EXPIRY_JOB_CRON` | Cron expression for the separate 7-day/3-day pre-expiry check (§7 point 4) | Must run independently of the expiry job's own cadence |
| `LOG_LEVEL` | Logging verbosity | See §9 |

No payment-gateway credentials exist anywhere in this list — per §3/§11, there is no gateway integration in this version.

---

## 3. Docker (Conceptual)

**Image contents**: Node.js runtime matching the version the app targets, application code, production dependencies only (no dev dependencies in the final image layer).

**Build stages** (conceptual, no Dockerfile content here):
1. **Dependencies stage** — install and cache `node_modules`.
2. **Build stage** — any transpilation/bundling step the project uses (if none, skip).
3. **Runtime stage** — copy only what's needed to run: app code, production `node_modules`, no test files, no `docs/`.

**Process model**: the API server and the scheduled job runner (§7) are two logically separate concerns. Two viable shapes:
- **Single process**: the job scheduler runs in-process alongside the Express server (simplest, acceptable at v2's scale since §7 describes one lightweight periodic job, not a heavy worker fleet).
- **Split processes**: a dedicated worker container runs only the scheduler, sharing the same image but a different entrypoint/command. Preferred once job volume or reliability requirements grow.

Either shape must ensure only **one** instance of the expiry job runs per tick across all replicas — running it redundantly would attempt to re-expire already-expired rows, which the job's idempotency (per [`05-testing-strategy.md §6`](./05-testing-strategy.md#6-scheduled-job-tests-7)) should tolerate, but should still be avoided operationally (e.g. via a leader-election lock or a managed cron trigger that only fires once).

---

## 4. Docker Compose (Conceptual)

For local development, a compose setup conceptually needs:

| Service | Purpose |
|---|---|
| `api` | The Express app, built from the Dockerfile above, mapped to `PORT` |
| `mysql` | MySQL matching the production major version, with a persisted volume for local data continuity |
| `worker` (optional) | Only if the split-process shape from §3 is chosen locally too — otherwise the scheduler runs inside `api` |

Local environment variables mirror §2, pointed at the `mysql` service by its compose network name rather than a real host. No storage-provider credentials are needed locally if a local/dummy storage adapter is used for `receipt_url` in development.

---

## 5. Database Migration Strategy

Builds on [`04-database-schema.md §7`](./04-database-schema.md#7-migration-order) (ordering) and [`03-development-roadmap.md`](./03-development-roadmap.md) Phase 1 (when they're built).

- **Forward-only in production**: migrations run automatically (or via an explicit release step) before the new application version starts serving traffic, so no request ever hits code expecting a column that doesn't exist yet.
- **Order**: `subscription_plans` → `payment_methods` → `subscription_requests` → `vendor_subscriptions` → `subscription_request_logs`, matching FK dependency direction.
- **Retiring `payments`/`wallet`** (§2): dropping those tables is a separate, deliberately later step from adding the five new ones — never combined into one migration, so a failure in one doesn't entangle with the other. Confirm nothing in production still reads from `payments`/`wallet` before dropping (their controllers/routes are removed per [`03-development-roadmap.md`](./03-development-roadmap.md) Phase 1, but a dependent report or export script elsewhere could still reference the raw tables).
- **Zero-downtime consideration**: since the five new tables have no prior consumers, they can be created ahead of the code that uses them with no compatibility concern. The risk is entirely on the `payments`/`wallet` drop — treat that as a standard "remove a column/table only after the code that reads it is fully gone from every running instance" migration.

---

## 6. Seeder Strategy

Builds on [`04-database-schema.md §8`](./04-database-schema.md#8-seeding-order).

| Environment | What gets seeded |
|---|---|
| Development | Full fixture set: one default (Starter) plan, one or more paid plans, one or more payment methods, a handful of seeded vendors (to get their auto-assigned Starter rows) and optionally a sample approved/rejected request for admin-UI development |
| Staging | Same shape as development, but data should be clearly synthetic (no real phone numbers/bank details in `payment_methods`) |
| Production | **Only** the mandatory bootstrap seed: exactly one plan flagged `is_default_vendor_plan = true`. This must exist before the first vendor can register (§5.1 step 1) — treat it as a release-blocking precondition, not an optional nicety. Paid plans and real payment methods are then created by an admin through the API (§7 of the API spec), not by a seeder, since that data is business-owned. |

**Guardrail**: a seeder that creates a second `is_default_vendor_plan = true` row, or runs against production, is a bug — this violates BR-010 in [`09-business-rules.md`](./09-business-rules.md).

---

## 7. Rollback Strategy

- **Code rollback**: standard — redeploy the previous known-good image/version. Since new tables are additive, an old version of the code simply ignores them; this is safe.
- **Migration rollback**: only the five new tables' migrations should be written with a working `down` step (drop table), for use in development/staging only. Rolling back a migration in production after real vendor data exists in `vendor_subscriptions`/`subscription_requests` **destroys subscription history** (violates BR-024) — treat a production migration rollback as a last resort requiring explicit sign-off, not a routine operation.
- **Bad admin data rollback**: because `vendor_subscriptions` is immutable-by-design (BR-024), "undoing" a bad approval is not a `DELETE` — it is a new admin action (e.g. reject the vendor back down, or a future `cancelled` status transition) that produces a new, correctly-ordered row, preserving the audit trail rather than erasing it.
- **Scheduled job rollback**: if a bad deploy of the expiry job logic causes incorrect expirations, the fix is a corrective code deploy plus, if needed, a manual data-correction script — not a job "undo," since the job's idempotency guarantee (§7) is about not reprocessing already-expired rows, not about reversing a bad run.

---

## 8. Logging

- **What to log**: every subscription state transition — request created, request approved/rejected (with admin ID), `vendor_subscriptions` row created/expired (with the triggering event: registration, approval, or expiry-fallback per BR-033), notification sent.
- **What never to log**: raw payment proof contents beyond the `receipt_url` reference, or full vendor payment details beyond what's already stored in `subscription_requests` — no new sensitive data is introduced by this system, but standard care applies to `transaction_reference` and `notes` fields, which may contain vendor-entered free text.
- **Correlation**: log the `subscription_requests.id` and/or `vendor_subscriptions.id` alongside every related log line, so an admin approval action can be traced end-to-end through the atomic transaction described in [`07-architecture-overview.md §6`](./07-architecture-overview.md#6-transaction-boundaries-46).
- **Job logging**: each expiry-job run should log a summary (rows found, rows processed, rows failed) even when it processes zero rows — a silent job is indistinguishable from a broken one.

---

## 9. Monitoring

- **Scheduled job health**: alert if the expiry job (§7) hasn't run successfully within its expected cadence window (e.g. no successful run in the last 25 hours for a daily job) — since this is the *only* polling process in the system (§7, closing paragraph), its silent failure would let expired subscriptions retain elevated access indefinitely.
- **Invariant monitoring**: a periodic check (separate from the expiry job itself) that no vendor has more than one `active` `vendor_subscriptions` row, and no vendor has zero — this directly monitors BR-030/BR-033 in production, catching a bug in the activation transaction before it compounds.
- **Approval transaction failures**: alert on any rollback of the activation transaction (§4.6) — a rollback itself is correct behavior (the guarantee working as designed), but a high rate of rollbacks indicates an upstream bug worth investigating.
- **Notification delivery gaps**: track that each of the five required events (§10) actually produces a notification row at roughly the rate its trigger fires, to catch a silently-broken `createNotification` call site.

---

## 10. Security Checklist

- [ ] `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` are environment-specific, never reused across staging/production, and never committed.
- [ ] Cookies are `httpOnly` and `Secure` in staging/production (per §1 stack).
- [ ] Every admin-only endpoint in [`02-api-specification.md`](./02-api-specification.md) (plan management, payment-method management, request approval/rejection, reporting) enforces role-based authorization server-side, not just UI-level hiding.
- [ ] Every vendor-scoped endpoint (own requests, own subscription history) enforces ownership (`vendor_id = current user`), not just authentication.
- [ ] `receipt_url` accepts only a reference to a pre-uploaded file (via the storage provider from §2), never an arbitrary user-supplied URL that the backend would fetch/proxy — avoids SSRF via the receipt-upload path.
- [ ] Database credentials, storage-provider credentials, and JWT secrets are sourced from a secrets manager or environment injection in staging/production, never a checked-in `.env`.
- [ ] Rate limiting or equivalent abuse protection on `POST /subscriptions/requests`, since it's an unauthenticated-adjacent, vendor-writable endpoint that could otherwise be spammed.
- [ ] Admin approval/rejection actions are only reachable by authenticated admin sessions — no unauthenticated or vendor-role token can ever call them, verified by an automated authorization test (see [`05-testing-strategy.md §4`](./05-testing-strategy.md#4-controller-tests)).

---

## 11. Cross-References

- Phased build order that precedes deployment: [`03-development-roadmap.md`](./03-development-roadmap.md).
- Endpoints being deployed: [`02-api-specification.md`](./02-api-specification.md).
- Tables being migrated/seeded: [`04-database-schema.md`](./04-database-schema.md).
- Business rules the security/monitoring checks above protect: [`09-business-rules.md`](./09-business-rules.md).
