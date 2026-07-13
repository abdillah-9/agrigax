# Agrigax Backend — Manual Subscription Verification: Requirements (v2)

Status: planning document only. No application code was changed to produce this file.

Supersedes the earlier draft of this document, which assumed automated payment gateways (Stripe/Paystack/Flutterwave, webhooks, recurring billing). **That model has been replaced.** Agrigax does not process payments inside the application. All vendor payments happen off-platform and are verified manually by an admin.

*Revision note: this pass refines the architecture (payment methods configuration, audit trail, subscription integrity guarantees, expanded reporting, terminology cleanup) without changing the manual-verification business model established above. A later pass (mentor review) split `features`/`limits`, added a `pending` vendor-subscription status, added payment-method display ordering, and resolved the Starter-permanence and expired-vendor-fallback open decisions — see §4.1, §4.4, §4.2, §12.1, and §12.2.*

---

## 1. Current App — Feature Inventory (v1, "agrigax_backend_fast")

**Stack**: Node.js, Express 5, Knex + MySQL, JWT (access/refresh via httpOnly cookies), Joi validation, layered architecture (`routes → controllers → services → repositories`).

**Actors**
- **Customer** — browses listings, books services, messages providers, leaves reviews. **Customers are outside the subscription system. This document governs vendor subscriptions only.**
- **Vendor / Provider** — publishes listings, accepts/manages bookings, messages customers. Subject to subscription gating (this document).
- **Admin** — moderates the marketplace, manages subscription plans, verifies payment requests, views reporting.

**Modules present today** (unchanged by this document except where noted in §4–§9)

| Module | What it does | Completeness |
|---|---|---|
| `auth` | Register/login, JWT access+refresh cookies, OTP phone verification (OTP is currently `console.log`'d, not actually sent), password reset | Functional, tests broken |
| `users` | Profile, settings, public provider listing | Functional |
| `listings` | Provider CRUD, images, categories, admin approval workflow | Functional — will gain a subscription gate, see §7 |
| `bookings` | Create/accept/reject/complete/cancel; also owns dispute sub-flows | Functional, no payment linkage (correct — bookings stay unpaid in-app) |
| `categories` | Admin CRUD + public listing | Functional |
| `favorites` | Toggle/list favorites | Functional |
| `reviews` | Create/update/delete + admin moderation | Functional |
| `messages` | Conversations between customer/provider + admin view | Functional |
| `notifications` | List/mark-read only — nothing in the app currently creates a notification row | Non-functional today; this document requires wiring it up (§8) |
| `payments` | DB table + admin read-only view, no gateway | **To be removed entirely — see §2 and §4** |
| `wallet` | Self-reported deposit/withdraw ledger, no gateway | **Out of scope / recommended for removal — not part of the subscription model** |
| `disputes` | Route file is empty; logic lives inside `bookings` | Functional but oddly placed — unaffected by this document |
| `admin` | Aggregated dashboards/moderation across all modules | Functional — gains subscription/request management (§8) |

---

## 2. Current Payment Module — State (for removal)

The existing `payments` and `wallet` modules were built against an assumption of automated payment gateways or a spendable balance. Neither has real gateway integration today (no Stripe/Paystack/Flutterwave SDK, no webhook handler, `payments.controller.js` is an empty file, `payments.routes.js` registers zero endpoints). Since Agrigax is not processing payments in-app at all under this business model, this module is not "finished" — it is **removed and replaced** by the manual subscription system in §4.

Everything described in this document (subscription plans, requests, vendor subscriptions) is a clean replacement, not an extension of the old `payments`/`wallet` tables.

---

## 3. New Business Model

- Agrigax does **not** process any payment inside the application. No gateway, no card capture, no webhook, no automated charging exists anywhere in this design.
- **Customers never pay anything**, for anything, at any point covered by this document.
- **Only vendors subscribe.** A subscription determines what a vendor is allowed to do on the platform (listing limits, featured placement, premium features, etc. — defined per plan).
- Every vendor is automatically placed on the **Starter Plan** at registration, at no cost and with no manual step.
- Admins define all other plans (e.g. Business, Premium, Enterprise) through plan management endpoints. **Plan names, pricing, and features are fully admin-configurable — nothing about plan tiers is hardcoded in application logic.** The only structurally special plan is "whichever plan is currently flagged `is_default_vendor_plan`," which application logic auto-assigns at registration (see §5.1). The flag is named specifically (rather than a generic `is_default`) to stay unambiguous if other kinds of default plans — e.g. a default plan per region or per referral channel — are introduced later.
- Upgrading from one plan to another is a **manual, admin-verified process**: the vendor pays off-platform (mobile money, bank transfer, etc.), submits proof of payment in-app, and an admin approves or rejects that submission. Approval is the only trigger that ever creates or changes a `vendor_subscriptions` record.

---

## 4. Database Model

All gateway-oriented concepts from the prior draft are removed: `subscription_transactions`, `gateway_customer_id`, `gateway_subscription_id`, `raw_gateway_payload`, webhook tables/handlers, and any recurring-billing/invoice/retry state. They are replaced by the tables below.

### 4.1 `subscription_plans`
Defines the catalog of plans vendors can be on. Fully admin-managed; no plan is hardcoded except by reference to "the plan currently marked as default."

| Field | Type | Notes |
|---|---|---|
| `id` | PK | |
| `name` | string | e.g. "Starter", "Business" — admin-defined, not hardcoded in code |
| `description` | text | shown to vendors when choosing a plan |
| `price` | decimal | 0 for Starter; admin-set for others |
| `currency` | string | |
| `duration_days` | integer | length of one subscription period, e.g. 30, 90, 365 |
| `features` | JSON | boolean capability flags, e.g. `{"analytics": true, "prioritySupport": false, "verifiedBadge": true}` — read by application logic, not hardcoded per plan name |
| `limits` | JSON | numeric quotas, e.g. `{"maxListings": 20, "maxFeaturedListings": 5, "maxImagesPerListing": 15, "maxCategories": 10, "maxBookingsPerMonth": 100, "maxPromotions": 3, "maxBranches": 1, "storageLimitMb": 500}` — split out from `features` specifically so booleans and numbers never mix in one object; middleware reads `plan.features.analytics` vs `plan.limits.maxListings` as two clearly-typed lookups instead of one ambiguous one |
| `is_default_vendor_plan` | boolean | exactly one plan should be flagged as the auto-assigned registration plan (conventionally "Starter", but the flag — not the name — is what the backend checks) |
| `is_active` | boolean | inactive plans are hidden from vendor selection but historical subscriptions referencing them remain valid |
| `created_at` / `updated_at` | timestamp | |

**Why `features`/`limits` stay JSON (for now):** a fully relational alternative was evaluated — a `subscription_features` catalog table (`id, key, display_name, description`) plus a `plan_features` join table (`plan_id, feature_id, value`) — which would let new feature/limit keys be added via admin UI/data rather than a schema change, and would support querying "which plans have feature X ≥ Y" directly in SQL. For a v2 marketplace with a handful of plans and a handful of flags/quotas, that normalization adds two tables and join complexity without a corresponding benefit yet — two JSON columns are simpler to build, and every check in application code (`requireActiveSubscription`, listing-limit checks) reads a known, small set of keys regardless of storage shape. **Recommended path**: keep `features` and `limits` as JSON for v2, and revisit the relational `subscription_features`/`plan_features` design in a later version once the number of flags/quotas and plan combinations grows large enough that admin-managed catalog entries (without code changes) become worth the added complexity.

### 4.2 `payment_methods`
Stores the payment instructions vendors see when upgrading, fully admin-managed so methods can be added, edited, or disabled without a deploy.

| Field | Type | Notes |
|---|---|---|
| `id` | PK | |
| `name` | string | display name, e.g. "M-Pesa", "Bank Transfer" |
| `type` | string | e.g. `mobile_money \| bank_account \| other` — informs which of the fields below are relevant/shown |
| `account_name` | string (nullable) | e.g. account holder name for a bank transfer |
| `account_number` | string (nullable) | e.g. bank account number |
| `phone_number` | string (nullable) | e.g. mobile money number |
| `instructions` | text (nullable) | free-text extra guidance shown alongside the structured fields above |
| `display_order` | integer | controls the order methods appear on the vendor-facing upgrade screen (e.g. M-Pesa before Bank Transfer), so the frontend never hardcodes ordering |
| `is_active` | boolean | inactive methods are hidden from the vendor-facing plan/upgrade screen |
| `created_at` / `updated_at` | timestamp | |

A `subscription_requests.payment_method` value (§4.3) should reference a `payment_methods` row (by id or name) rather than being free text, so historical requests stay traceable to a specific configured method even if instructions change later.

### 4.3 `subscription_requests`
Represents a vendor's manual payment submission when requesting an upgrade. This is a request/approval record, not a subscription itself.

| Field | Type | Notes |
|---|---|---|
| `id` | PK | |
| `vendor_id` | FK → users | |
| `plan_id` | FK → subscription_plans | plan being requested |
| `payment_method` | FK → payment_methods | which admin-configured method the vendor used (see §4.2, §6) |
| `amount` | decimal | amount the vendor claims to have paid |
| `transaction_reference` | string | vendor-supplied reference/transaction ID from their payment |
| `receipt_url` | string (nullable) | storage-provider-agnostic reference (URL or file key) to the uploaded proof of payment — works with S3, Supabase Storage, Cloudinary, or any future storage backend without a schema change |
| `notes` | text (nullable) | optional vendor note |
| `status` | enum | `pending \| approved \| rejected \| expired` |
| `verified_by` | FK → users (nullable) | admin who actioned the request |
| `verified_at` | timestamp (nullable) | |
| `created_at` / `updated_at` | timestamp | |

`status = expired` covers requests left pending too long without admin action (policy TBD, see §12).

### 4.4 `vendor_subscriptions`
Represents actual, historical subscription periods. **Immutable once created** — approving a new request always inserts a new row; existing rows are never edited except to flip their `status` (e.g. `active → expired`, `active → cancelled`). This preserves full subscription history per vendor.

| Field | Type | Notes |
|---|---|---|
| `id` | PK | |
| `vendor_id` | FK → users | |
| `plan_id` | FK → subscription_plans | |
| `status` | enum | `pending \| active \| expired \| cancelled` — `pending` covers a row created but not yet in effect (future-dated start, scheduled plan change, data migration). No v2 flow in this document produces a `pending` row (every row created here goes straight to `active`); it's included now so the model doesn't need a breaking migration when those cases show up later |
| `start_date` | date/timestamp | set at approval time |
| `end_date` | date/timestamp (nullable) | `start_date + plan.duration_days` for paid plans; **`null` for the default (`is_default_vendor_plan`) plan specifically — Starter is permanent and never expires** (§12.1) |
| `created_from_request_id` | FK → subscription_requests (nullable) | null for the auto-assigned Starter subscription created at registration, since it has no request behind it |
| `created_at` / `updated_at` | timestamp | |

A vendor's **current** plan is derived by querying for their `vendor_subscriptions` row with `status = active`.

### 4.5 `subscription_request_logs`
Audit trail for every action taken on a subscription request. Provides accountability for who approved/rejected what and why, independent of the mutable `status`/`verified_by`/`verified_at` fields on `subscription_requests` itself.

| Field | Type | Notes |
|---|---|---|
| `id` | PK | |
| `request_id` | FK → subscription_requests | |
| `admin_id` | FK → users | admin who performed the action |
| `action` | enum | `approved \| rejected` (extendable later, e.g. `reassigned`, `commented`) |
| `comment` | text (nullable) | admin's note — doubles as the rejection reason when `action = rejected` |
| `created_at` | timestamp | |

**Every approval or rejection must automatically generate a `subscription_request_logs` row** as part of the same transaction described in §4.6 — this is not an optional/manual admin step.

### 4.6 Subscription Integrity Requirements

These are implementation requirements, not implications to be inferred from the rest of the document:

1. **A vendor can never have more than one active (`status = active`) `vendor_subscriptions` row at a time.** This is enforced by application logic (not solely a DB constraint), since MySQL/Knex do not straightforwardly express "at most one active row per vendor" as a simple unique constraint against a filtered condition — the invariant must be maintained procedurally, as described below.
2. **Subscription activation is a single atomic database transaction.** Approving a request (or auto-assigning Starter at registration) must not be able to leave the system in a partial state (e.g. old subscription deactivated but new one failed to insert). All writes for one activation — deactivating the prior subscription, inserting the new `vendor_subscriptions` row, updating the `subscription_requests` status/verifier, and inserting the `subscription_request_logs` row — happen inside one transaction that either fully commits or fully rolls back.
3. **Approval always deactivates the vendor's existing active subscription *before* creating the new one**, within that same transaction — never the reverse order, and never leaving both rows `active` simultaneously even momentarily within application logic.

---

## 5. Subscription Lifecycle

```
Vendor registers
      ↓
Backend auto-assigns the default (Starter) plan
   → creates a vendor_subscriptions row (status=active, created_from_request_id=null)
      ↓
Vendor browses available plans, decides to upgrade
      ↓
Vendor views admin-configured payment instructions for a plan
      ↓
Vendor pays off-platform (mobile money / bank transfer / etc.)
      ↓
Vendor submits a subscription_request (plan, method, reference, optional receipt/notes)
   → status = pending
      ↓
Admin reviews the request
      ↓
   ┌─────────────┴─────────────┐
Reject                       Approve
   ↓                             ↓
Backend, in one transaction:  Backend, in one atomic transaction (see §4.6):
 - status = rejected            - deactivates the vendor's current active subscription first
 - logs a subscription_          - creates a new vendor_subscriptions row:
   request_logs row                 start_date = now
   (action=rejected,                end_date = now + plan.duration_days
   comment=reason)                  status = active
 - notify vendor                    created_from_request_id = request.id
                                 - marks the request approved (verified_by, verified_at)
                                 - logs a subscription_request_logs row (action=approved)
                                 - sends "subscription approved" notification
      ↓
Subscription runs until end_date
      ↓
Scheduled job detects expiry (see §7)
   → old row: status = expired
   → new vendor_subscriptions row auto-created for the default (Starter) plan, status = active
      ↓
Vendor is back on Starter — never locked out, can submit a new upgrade request any time
```

**The admin never manually edits `vendor_subscriptions` rows.** There are exactly three ways a `vendor_subscriptions` row is created, and all three are backend-triggered, never a manual admin edit: (a) automatic Starter assignment at registration (§5.1), (b) automatic creation immediately after an admin approves a `subscription_requests` row, and (c) automatic Starter fallback when the expiry job lapses a paid plan (§7). The admin's only direct action anywhere in this system is approve/reject on a request; everything downstream is backend logic, executed atomically per §4.6.

### 5.1 Starter auto-assignment
At vendor account creation (in the existing `auth`/registration flow), after the user row is created with a vendor role, the backend must:
1. Look up the plan flagged `is_default_vendor_plan = true`.
2. Create a `vendor_subscriptions` row for that vendor: `status=active`, `start_date=now`, `end_date=null` — the default (Starter) plan is permanent and never expires (§12.1), so `plan.duration_days` on the default plan is not used to compute an expiry here.
3. No `subscription_requests` row is created for this — it's system-assigned, not vendor-submitted. No `subscription_request_logs` row is created either, since there is no admin action to audit.

---

## 6. Manual Payment Flow (Vendor-Facing)

1. **Vendor selects a plan** to upgrade to, from `GET /subscriptions/plans` (active plans only).
2. **Application displays payment instructions** for that plan — pulled from the active rows in `payment_methods` (§4.2): mobile money number, bank account number/name, or whatever other methods are currently configured. These instructions are **data, not code** — stored and editable by admins, not hardcoded strings in the app.
3. **Vendor pays off-platform**, using whichever method they chose.
4. **Vendor submits a subscription request** in-app: selected plan, `payment_method` reference, transaction/reference number, optional receipt upload (stored as `receipt_url`), optional notes. This creates a `subscription_requests` row with `status = pending`.
5. Vendor can view their own request history and current status (`pending / approved / rejected / expired`).
6. **Admin reviews** the request (cross-referencing the reference number/receipt against their actual mobile money or bank statement — this reconciliation happens outside the application, by the admin, manually).
7. **Admin approves or rejects.** Approval triggers the automatic backend workflow in §5. Rejection sets `status = rejected` and notifies the vendor; the reason (if any) is captured in the `comment` field of the corresponding `subscription_request_logs` row (§4.5) rather than a separate field on `subscription_requests` itself.

---

## 7. Subscription Expiry

A scheduled job (cron / background worker — the app has no existing job runner today, so this is new infrastructure) runs periodically (e.g. hourly or daily) and:

1. Finds all `vendor_subscriptions` rows where `status = active AND end_date < now`. Since the default (Starter) plan's row always has `end_date = null` (§12.1, §5.1), this query naturally never selects it — only paid-plan rows can expire.
2. Marks each as `status = expired`.
3. **Resolved (§12.1, §12.2): expiry means automatic, permanent fallback to Starter, not lockout.** In the same transaction that marks the paid `vendor_subscriptions` row `expired`, the job creates a new `vendor_subscriptions` row for the default (`is_default_vendor_plan`) plan — `status=active`, `start_date=now`, `end_date=null`, `created_from_request_id=null` — exactly like the registration-time auto-assignment in §5.1. The vendor keeps editing their profile, receiving notifications, submitting new subscription requests, and browsing plans throughout; they only lose the premium `features`/`limits` tied to the expired plan. A vendor is never in a state with zero active `vendor_subscriptions` rows.
4. Triggers expiry-related notifications where applicable (expired; and separately, the 7-day/3-day pre-expiry warnings, which should be a second scheduled check against `end_date` rather than something detected only at the moment of expiry).

This job is the only automatic process in the entire subscription system — everything else (assigning Starter, activating an upgrade) is triggered by a specific event (registration, admin approval), not by polling.

---

## 8. Access Control — `requireActiveSubscription` Middleware

A new middleware, conceptually:

```
requireActiveSubscription(requiredFeature?)
```

Checks that the authenticated vendor has a `vendor_subscriptions` row with `status = active` and `end_date >= now`, and optionally that the associated plan's `features`/`limits` JSON satisfies a specific requirement — e.g. `plan.limits.maxFeaturedListings > 0` before allowing a "promote listing" action, or `plan.features.analytics === true` before allowing access to the analytics dashboard.

Applied to vendor-only actions such as:
- Create listing
- Publish/unpublish listing
- Accept a booking
- Promote/feature a listing
- Any other feature gated by a plan's `features` flags (e.g. analytics access, priority support queue)

**Customers are completely unaffected** — they hold no subscription and this middleware is never applied to any customer-facing route (browsing, booking as a customer, messaging, reviewing).

Since every vendor always has *some* active subscription (Starter at minimum, from the moment of registration), "no active subscription" only occurs if their period has lapsed and the expiry job has run — this is a simpler mental model than "some vendors have never subscribed."

---

## 9. Admin Requirements

Admins must be able to:

**Plans**
- Create a plan
- Edit a plan (price, duration, features, limits, description)
- Disable a plan (`is_active = false`) — hides it from vendor selection without breaking existing subscriptions referencing it
- Delete a plan, if no `vendor_subscriptions` or `subscription_requests` reference it (otherwise disable instead — hard delete of a referenced plan would break history)

**Subscription requests**
- View all subscription requests (filterable by status)
- Approve a request (triggers §5 workflow)
- Reject a request (with a comment, recorded via §4.5 audit log)
- View the audit trail (`subscription_request_logs`) for a given request — who approved/rejected it, when, and any comment

**Subscriptions**
- View subscription history (all vendor_subscriptions, filterable by vendor/plan/status)
- View currently active subscriptions
- View expired subscriptions
- View upcoming expirations (e.g. active subscriptions with `end_date` within the next N days) — supports proactive vendor outreach and powers the 7-day/3-day notification checks

**Reporting**
- Total revenue (sum of `amount` on **approved** `subscription_requests`, all-time)
- Monthly revenue (approved request amounts grouped by month)
- Yearly revenue (approved request amounts grouped by year)
- Active vendors (vendors with any `vendor_subscriptions` row currently `status = active`)
- Starter vendors (active subscribers currently on the plan flagged `is_default_vendor_plan`)
- Paid vendors (active subscribers on any non-default plan)
- Pending requests (count/list of `subscription_requests` with `status = pending`)
- Approved requests (count/list, filterable by date range)
- Rejected requests (count/list, filterable by date range)
- Expired subscriptions (count/list of `vendor_subscriptions` with `status = expired`)
- Upcoming expirations (as above, surfaced here as a report in addition to the operational list)

Since there is no live gateway, all revenue/payment reporting is derived entirely from **approved** `subscription_requests` rows — this doubles as the manual "transaction log" for the business model.

**Configuration**
- Manage `payment_methods` (§4.2): create, edit, and activate/deactivate the mobile money numbers, bank accounts, and any other payment instructions shown to vendors — admin-editable data, not hardcoded in the app, so instructions can change without a deploy

---

## 10. Notifications

Required notification events (this also finally forces the currently-dormant `notifications` module — where `createNotification` exists but is never called by anything — to be wired into real application flows):

- Subscription request approved
- Subscription request rejected
- Subscription expires in 7 days
- Subscription expires in 3 days
- Subscription expired

Delivery channel (in-app only vs. also email/SMS) depends on whatever notification delivery mechanism v2 ends up using — out of scope for this document beyond noting that the existing `notifications` module only supports in-app list/mark-read today, with no outbound delivery integrated (see original app-wide gap list in the prior report: no SMS/email provider exists yet).

---

## 11. Future Compatibility — Automated Gateways (v3)

**The subscription domain is intentionally separated from the payment domain, making the architecture payment-provider agnostic. Manual verification can later be replaced with automated gateways without redesigning the subscription lifecycle.**

Concretely, `subscription_requests` (how a payment gets verified) is a distinct table from `vendor_subscriptions` (the actual entitlement record), and `payment_methods` (how a vendor is told to pay) is distinct from both. That separation is what makes the replacement narrow:

- Today: vendor manually submits payment proof against admin-configured `payment_methods` → admin manually approves → backend auto-activates.
- Future: a gateway checkout/webhook automatically creates and immediately approves the equivalent request-record → the exact same activation logic in §4.6/§5 runs (deactivate old subscription, create new `vendor_subscriptions` row, log the action, send notification).

Everything from "a request is approved" onward — subscription activation, atomicity guarantees, history preservation, expiry handling, `requireActiveSubscription` middleware, notifications, admin reporting — **already represents the final target architecture** and would not need to change. Only the payment request *creation* step changes when automated gateways are introduced.

---

## 12. Open Decisions (need your input before implementation)

1. ~~Starter plan expiry~~ — **Resolved**: the default (Starter) plan is permanent and never expires. Its `vendor_subscriptions` row always has `end_date=null` (§4.4, §5.1), so `plan.duration_days` is meaningless for whichever plan is flagged `is_default_vendor_plan` and is simply not applied to it.
2. ~~Expired vendor fallback~~ — **Resolved**: when a paid plan expires, the vendor automatically and permanently falls back to Starter-level access rather than losing access entirely (§5, §7). A vendor is never locked out — they can still edit their profile, browse plans, and submit a new upgrade request at any time; they simply lose the premium `features`/`limits` of the expired plan.
3. **Pending request expiry policy** — how long can a `subscription_requests` row sit at `pending` before it's auto-marked `expired` (abandoned request), if at all?
4. ~~Rejection reason~~ — **Resolved**: captured via the `comment` field on the `subscription_request_logs` audit row (§4.5) rather than a separate field on `subscription_requests`.
5. ~~Payment methods configuration~~ — **Resolved**: a dedicated `payment_methods` table (§4.2).
6. **Plan changes mid-period** — if a vendor with an active paid plan submits a new upgrade/downgrade request and it's approved, does the new period start immediately (losing remaining days on the old plan) or stack after the current `end_date`? Recommend: immediate replacement, consistent with "always deactivate the old row, create a new one" in §4.6.
7. **Multiple pending requests** — can a vendor have more than one `pending` request at once, or must a prior pending request be resolved/withdrawn before submitting another?

---

## 13. Suggested Rollout Phases

1. **Foundation** — migrations for `subscription_plans`, `payment_methods`, `subscription_requests`, `vendor_subscriptions`, `subscription_request_logs`; remove/retire the old `payments` and `wallet` modules (routes, controllers, services, repositories, validations, migrations as appropriate).
2. **Starter auto-assignment** — wire into vendor registration in the existing `auth` flow, keyed off `is_default_vendor_plan`.
3. **Plan management** — admin CRUD endpoints for `subscription_plans`, and CRUD for `payment_methods`.
4. **Manual request flow** — vendor-facing "view plans → view payment instructions (from `payment_methods`) → submit request" endpoints, plus receipt upload handling (`receipt_url`, storage-provider agnostic).
5. **Admin approval workflow** — approve/reject endpoints, with the atomic activation transaction from §4.6/§5 (deactivate-then-create, in one transaction) plus automatic `subscription_request_logs` creation on every approve/reject.
6. **Access control** — implement and apply `requireActiveSubscription` to the vendor actions listed in §8.
7. **Expiry job** — scheduled task for marking expired subscriptions, plus the 7-day/3-day pre-expiry check.
8. **Notifications** — wire all five events in §10 into the (currently dormant) notifications module.
9. **Admin reporting** — history, active/expired/upcoming views, the expanded revenue/vendor/request reports in §9, and the audit-log view per request.
10. **Testing** — given the app-wide test suite is currently non-functional, build subscription-module tests on a fixed harness rather than the existing broken one: Starter auto-assignment, request submission, approval activation logic (including the deactivate-old/create-new atomicity guarantee in §4.6 and the "never more than one active subscription" invariant), audit log creation, expiry job correctness (including the permanent Starter-fallback creation and its `end_date=null` invariant, §12.1–§12.2), and middleware gating.

---

## 14. Status — Frozen for Implementation

This document (Subscription Requirements v2) is frozen at the architecture level. The remaining open items in §12 (pending-request expiry policy, mid-period plan changes, multiple pending requests) are implementation/product choices, not architectural gaps — they can be decided during rollout without revisiting the schema.

Before writing code, produce a companion **API Specification** document: endpoints, request/response payloads, status codes, validation rules, authentication requirements. That document becomes the frontend/backend contract and should live alongside this one, not inside it.
