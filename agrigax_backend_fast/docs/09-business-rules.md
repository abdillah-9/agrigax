# Agrigax Backend — Business Rules Catalog

**Authoritative source**: [`docs/01-subscription-requirements-v2.md`](./01-subscription-requirements-v2.md). Every rule below is extracted, not invented, from that document — the `§` citation in each row points to where it is defined. This catalog only organizes existing rules under stable identifiers (`BR-001`, `BR-002`, ...) for cross-referencing from code, tests, and PRs.

Rules are grouped by the requirements-doc section they come from. IDs are stable once assigned — do not renumber; append new rules at the end of their section's range if the requirements doc is later amended.

---

## 1. Business Model (§3)

| ID | Description | Reason | Related Tables | Related Endpoints |
|---|---|---|---|---|
| BR-001 | Agrigax never processes payment inside the application — no gateway, card capture, webhook, or automated charging exists anywhere in the system. | The business model is manual, off-platform payment with admin verification, not automated billing. | — | All subscription endpoints — [`02-api-specification.md`](./02-api-specification.md) |
| BR-002 | Customers never pay anything, at any point, for anything covered by this system. | Only vendors are monetized; the marketplace is free for customers. | — | — |
| BR-003 | Only vendors hold subscriptions; a subscription determines what a vendor may do on the platform (listing limits, featured placement, premium features). | Subscriptions are the vendor-side monetization/gating mechanism. | `subscription_plans`, `vendor_subscriptions` | §6 (vendor-facing), §13 (gate) |
| BR-004 | Every vendor is automatically placed on the Starter plan at registration, at no cost and with no manual step. | Vendors must never be in a state with zero subscription; onboarding must be frictionless. | `vendor_subscriptions` | §2 `POST /auth/register` |
| BR-005 | Plan names, pricing, and features/limits are fully admin-configurable; nothing about plan tiers is hardcoded in application logic. | Lets the business change pricing/tiers without a deploy. | `subscription_plans` | §7 (admin plan management) |
| BR-006 | The only structurally special plan is whichever one is flagged `is_default_vendor_plan`; application logic auto-assigns it at registration, identified by the flag, never by name. | Keeps the system unambiguous even if the "Starter" name changes, and leaves room for other kinds of default plans later (e.g. per-region). | `subscription_plans` | §2, §7 |
| BR-007 | Upgrading plans is a manual, admin-verified process: vendor pays off-platform, submits proof in-app, admin approves or rejects. | No payment gateway exists; a human must reconcile the claimed payment against a real bank/mobile-money statement. | `subscription_requests` | §5, §9 |

---

## 2. Subscription Plans — `subscription_plans` (§4.1)

| ID | Description | Reason | Related Tables | Related Endpoints |
|---|---|---|---|---|
| BR-008 | `features` stores only boolean capability flags (e.g. `analytics`, `prioritySupport`, `verifiedBadge`). | Keeps a clean, single-typed lookup for capability checks. | `subscription_plans` | §13 (`requireActiveSubscription`) |
| BR-009 | `limits` stores only numeric quotas (e.g. `maxListings`, `maxFeaturedListings`), kept in a column separate from `features`. | Prevents booleans and numbers mixing in one object; `plan.features.X` vs. `plan.limits.Y` are unambiguous, differently-typed lookups. | `subscription_plans` | §13 |
| BR-010 | At most one `subscription_plans` row may have `is_default_vendor_plan = true` at any time. | There must be exactly one unambiguous auto-assign target for registration (BR-004) and expiry fallback (BR-030). | `subscription_plans` | §7 `POST`/`PATCH /admin/subscriptions/plans` |
| BR-011 | Setting `is_active = false` on a plan hides it from vendor selection but leaves historical subscriptions/requests that reference it valid. | Plans must be retirable without breaking subscription history. | `subscription_plans`, `vendor_subscriptions`, `subscription_requests` | §3, §7 |

---

## 3. Payment Methods — `payment_methods` (§4.2)

| ID | Description | Reason | Related Tables | Related Endpoints |
|---|---|---|---|---|
| BR-012 | A `subscription_requests.payment_method` value must reference a `payment_methods` row by ID, never free text. | Keeps historical requests traceable to a specific configured method even if instructions later change. | `payment_methods`, `subscription_requests` | §5 `POST /subscriptions/requests` |
| BR-013 | Payment methods are ordered on the vendor-facing screen by `display_order`. | The frontend must never hardcode payment-method order. | `payment_methods` | §4 `GET /subscriptions/payment-methods` |
| BR-014 | Setting `is_active = false` on a payment method hides it from the vendor-facing upgrade screen. | Methods must be retirable without a deploy or data loss. | `payment_methods` | §4, §8 |

---

## 4. Subscription Requests — `subscription_requests` (§4.3, §6)

| ID | Description | Reason | Related Tables | Related Endpoints |
|---|---|---|---|---|
| BR-015 | A request's `status` is one of `pending \| approved \| rejected \| expired`. | Models the full lifecycle of a manual payment claim. | `subscription_requests` | §5, §9 |
| BR-016 | `status = expired` covers requests left `pending` too long without admin action. | Abandoned requests must not sit as `pending` forever. | `subscription_requests` | §9 |
| BR-016a | **Open / not yet a rule** — the exact threshold for how long a request may sit `pending` before auto-expiry is undecided (§12.3). | — | `subscription_requests` | §5 `POST /subscriptions/requests` |
| BR-017 | Vendor selects a plan to upgrade to from the list of `is_active = true` plans only. | Inactive plans are retired from new selection (BR-011). | `subscription_plans` | §3 `GET /subscriptions/plans` |
| BR-018 | Payment instructions shown to a vendor are pulled from active `payment_methods` rows — data, not hardcoded strings. | Instructions must be editable by admins without a deploy. | `payment_methods` | §4 `GET /subscriptions/payment-methods` |
| BR-019 | Submitting a request creates a `subscription_requests` row with `status = pending` and does **not** modify `vendor_subscriptions`. | A request is a claim to be verified, not an entitlement — the two are architecturally distinct (§11). | `subscription_requests` | §5 `POST /subscriptions/requests` |
| BR-020 | A vendor can view their own request history and current status, scoped to their own requests only. | Vendors must be able to track a submission without admin involvement; must never see another vendor's requests. | `subscription_requests` | §5 `GET /subscriptions/requests`, `GET /subscriptions/requests/:id` |
| BR-020a | **Open / not yet a rule** — whether a vendor may hold more than one `pending` request simultaneously, or must resolve a prior one first, is undecided (§12.7). | — | `subscription_requests` | §5 `POST /subscriptions/requests` |
| BR-021 | Admin reconciliation of a request's reference number/receipt against the real bank/mobile-money statement happens manually, outside the application. | No gateway exists to verify payment automatically — this is the entire premise of the manual model (BR-007). | — | §9 |
| BR-022 | Rejecting a request sets `status = rejected` and notifies the vendor; it never modifies `vendor_subscriptions`. | Rejection must not affect the vendor's existing entitlement. | `subscription_requests` | §9 `POST /admin/subscription-requests/:id/reject` |
| BR-023 | The reason for a rejection is captured in the `comment` field of the corresponding `subscription_request_logs` row, not a separate field on `subscription_requests`. | Resolved decision (§12.4) — keeps the audit trail as the single source of "why," rather than duplicating a reason field. | `subscription_request_logs` | §9 `POST /admin/subscription-requests/:id/reject` |

---

## 5. Vendor Subscriptions — `vendor_subscriptions` (§4.4, §12.1, §12.2)

| ID | Description | Reason | Related Tables | Related Endpoints |
|---|---|---|---|---|
| BR-024 | A `vendor_subscriptions` row is immutable once created — a new row is always inserted on activation; existing rows are only ever updated to flip `status`. | Preserves complete, tamper-free subscription history per vendor. | `vendor_subscriptions` | §6 `GET /subscriptions/history` |
| BR-025 | A row's `status` is one of `pending \| active \| expired \| cancelled`. `pending` is reserved for future use (future-dated start, scheduled plan change, migration) — no v2 flow produces it. | Keeps the model forward-compatible without a breaking migration later. | `vendor_subscriptions` | — |
| BR-026 | `end_date = start_date + plan.duration_days` for a paid plan's row. | Defines when a paid period lapses. | `vendor_subscriptions`, `subscription_plans` | §9 approval workflow |
| BR-027 | `end_date` is always `null` for the row on the plan flagged `is_default_vendor_plan` — the default (Starter) plan is permanent and never expires. | Resolved decision (§12.1); a vendor must never be locked out for lacking a paid plan. | `vendor_subscriptions` | §6 `GET /subscriptions/current` |
| BR-028 | `created_from_request_id` is `null` for both the registration-time Starter row (BR-004) and every expiry-fallback Starter row (BR-030) — neither has a request behind it. | Only admin-approved upgrades trace back to a request. | `vendor_subscriptions`, `subscription_requests` | — |
| BR-029 | A vendor's current plan is derived by querying their `vendor_subscriptions` row with `status = active`. | Single source of truth for "what plan is this vendor on right now." | `vendor_subscriptions` | §6 `GET /subscriptions/current` |
| BR-030 | A vendor can never have more than one `active` `vendor_subscriptions` row at a time; this is enforced procedurally by application logic, not a simple DB constraint. | MySQL/Knex cannot straightforwardly express "at most one active row per vendor" as a filtered unique constraint. | `vendor_subscriptions` | §9 approve, §7 expiry job |
| BR-031 | Subscription activation (approval or Starter auto-assignment) is a single atomic database transaction; a failure anywhere in it rolls back every write in it. | Prevents partial states, e.g. old subscription deactivated but new one failed to insert. | `vendor_subscriptions`, `subscription_requests`, `subscription_request_logs` | §9 `POST /admin/subscription-requests/:id/approve` |
| BR-032 | Approval always deactivates the vendor's existing active subscription **before** creating the new one, within the same transaction — never the reverse order, never both rows `active` simultaneously even momentarily. | Guarantees BR-030 holds at every instant, not just at rest. | `vendor_subscriptions` | §9 approve |
| BR-033 | There are exactly three ways a `vendor_subscriptions` row is ever created: (a) automatic Starter assignment at registration, (b) automatic creation after an admin approves a request, (c) automatic Starter fallback when the expiry job lapses a paid plan. An admin never manually edits a `vendor_subscriptions` row. | Keeps entitlement changes fully auditable and system-driven — no untracked manual edits. | `vendor_subscriptions` | §2, §5, §9, §7 |

---

## 6. Subscription Request Logs — `subscription_request_logs` (§4.5)

| ID | Description | Reason | Related Tables | Related Endpoints |
|---|---|---|---|---|
| BR-034 | Every approval or rejection automatically generates a `subscription_request_logs` row, as part of the same transaction as the status change — never an optional or manual admin step. | Accountability for who approved/rejected what and why, independent of the request's own mutable fields. | `subscription_request_logs` | §9 approve/reject |

---

## 7. Subscription Lifecycle & Expiry (§5, §5.1, §7)

| ID | Description | Reason | Related Tables | Related Endpoints |
|---|---|---|---|---|
| BR-035 | At registration, the backend looks up the plan flagged `is_default_vendor_plan = true` and creates an `active` `vendor_subscriptions` row for the new vendor, `end_date = null`. | Implements BR-004 concretely. | `vendor_subscriptions`, `subscription_plans` | §2 `POST /auth/register` |
| BR-036 | No `subscription_requests` or `subscription_request_logs` row is created for the registration-time Starter assignment. | It is system-assigned, not vendor-submitted; there is no admin action to audit. | — | §2 |
| BR-037 | A scheduled job runs periodically (hourly or daily) and finds all `vendor_subscriptions` rows where `status = active AND end_date < now`. | Paid periods must lapse without manual intervention. | `vendor_subscriptions` | §7 (job, no HTTP endpoint) |
| BR-038 | Each row found by BR-037 is marked `status = expired`. | Marks the paid period as over. | `vendor_subscriptions` | §7 |
| BR-039 | In the same transaction as BR-038, the job creates a new `vendor_subscriptions` row for the default plan (`status=active`, `start_date=now`, `end_date=null`, `created_from_request_id=null`) — expiry means automatic, permanent fallback to Starter, never lockout. | Resolved decision (§12.2); a vendor keeps editing their profile, receiving notifications, submitting new requests, and browsing plans throughout — they only lose the expired plan's premium `features`/`limits`. | `vendor_subscriptions` | §7 |
| BR-040 | The expiry job triggers expiry-related notifications, and a **separate** scheduled check (not the same query as BR-037) handles the 7-day/3-day pre-expiry warnings. | Pre-expiry warnings must not depend on the expiry moment itself. | `vendor_subscriptions`, `notifications` | §12 (event table) |
| BR-041 | The expiry job is the only automatic/polling process in the entire subscription system — every other state change is triggered by a specific event (registration, admin approval). | Keeps the system's behavior predictable and mostly event-driven. | — | — |

---

## 8. Access Control (§8)

| ID | Description | Reason | Related Tables | Related Endpoints |
|---|---|---|---|---|
| BR-042 | `requireActiveSubscription` checks that the authenticated vendor has a `vendor_subscriptions` row with `status = active` and (`end_date` is `null` or `end_date >= now`), optionally also checking a specific `features`/`limits` requirement. | Central gating mechanism for all plan-dependent vendor actions. | `vendor_subscriptions`, `subscription_plans` | §13 |
| BR-043 | The middleware is applied to: create listing, publish/unpublish listing, accept a booking, promote/feature a listing, and any other action gated by a plan's `features` flags. | Enumerates exactly which vendor actions are plan-gated. | — | §13 |
| BR-044 | Customers are never subject to `requireActiveSubscription` — they hold no subscription and the middleware is never applied to any customer-facing route. | Customers are entirely outside the subscription system (BR-002). | — | §13 |
| BR-045 | Because every vendor always has some active subscription from the moment of registration onward (BR-004, BR-039), "no active subscription" is not a normal, persistent state for a vendor account. | Simpler mental model than "some vendors have never subscribed." | `vendor_subscriptions` | §13 |

---

## 9. Admin Requirements (§9)

| ID | Description | Reason | Related Tables | Related Endpoints |
|---|---|---|---|---|
| BR-046 | Admins can create, edit, and disable (`is_active=false`) plans. | Plans must be fully manageable without a deploy (BR-005). | `subscription_plans` | §7 |
| BR-047 | Admins can hard-delete a plan **only if** no `vendor_subscriptions` or `subscription_requests` row references it; otherwise they must disable it instead. | Hard delete of a referenced plan would break subscription history (BR-024). | `subscription_plans`, `vendor_subscriptions`, `subscription_requests` | §7 `DELETE /admin/subscriptions/plans/:id` |
| BR-048 | Admins can view all subscription requests, filterable by status; approve or reject a request (rejection requires a comment, recorded via BR-023); and view the full audit trail for a given request. | Core admin verification workflow. | `subscription_requests`, `subscription_request_logs` | §9 |
| BR-049 | Admins can view subscription history (all vendors), currently active subscriptions, expired subscriptions, and upcoming expirations (active subscriptions with `end_date` within the next N days). | Operational visibility into the entitlement table. | `vendor_subscriptions` | §10 `GET /admin/vendor-subscriptions` |
| BR-050 | Total/monthly/yearly revenue reporting sums `amount` on `subscription_requests` where `status = approved`. | There is no live gateway — approved requests double as the manual transaction log. | `subscription_requests` | §11 `GET /admin/reports/revenue` |
| BR-051 | "Active vendors" = vendors with any `vendor_subscriptions` row currently `status=active`; "Starter vendors" = active subscribers on the default-flagged plan; "paid vendors" = active subscribers on any non-default plan. | Defines the three admin-facing vendor-count categories precisely. | `vendor_subscriptions`, `subscription_plans` | §11 `GET /admin/reports/vendors` |
| BR-052 | Admins can view pending/approved/rejected request counts and lists, the latter two filterable by date range. | Operational and reporting visibility into the request pipeline. | `subscription_requests` | §11 `GET /admin/reports/requests` |
| BR-053 | Admins can view expired-subscription counts/lists and upcoming-expiration counts/lists as a report, in addition to the operational list from BR-049. | §9 explicitly separates operational views from aggregate reporting views. | `vendor_subscriptions` | §11 `GET /admin/reports/expirations` |
| BR-054 | Admins can create, edit, and activate/deactivate `payment_methods`; no delete capability is specified for this resource. | Payment instructions must be admin-editable data, not hardcoded (BR-018). | `payment_methods` | §8 |

---

## 10. Notifications (§10)

| ID | Description | Reason | Related Tables | Related Endpoints |
|---|---|---|---|---|
| BR-055 | Five events must trigger a notification: subscription request approved, subscription request rejected, subscription expires in 7 days, subscription expires in 3 days, subscription expired. | Vendors must be proactively informed of every state change to their entitlement. | `notifications` | §9 approve/reject, §7 job |
| BR-056 | Notification delivery is in-app only for v2 (list/mark-read); no email/SMS provider exists yet. | No outbound delivery integration exists in the current app. | `notifications` | §12 `GET /notifications` |

---

## 11. Future Compatibility (§11)

| ID | Description | Reason | Related Tables | Related Endpoints |
|---|---|---|---|---|
| BR-057 | The subscription domain (`subscription_requests`, `vendor_subscriptions`, `payment_methods`) is architecturally separated from the payment domain, so manual verification can later be replaced by automated gateways without redesigning the subscription lifecycle. | Keeps the system payment-provider agnostic; only the request-*creation* step would change in a future gateway integration. | `subscription_requests`, `vendor_subscriptions`, `payment_methods` | — |

---

## 12. Open Decisions — Not Yet Rules

These items are explicitly **unresolved** in the requirements document (§12) and must not be treated as rules until decided there. They are listed here only so implementers know exactly what is still undecided, cross-referenced to the provisional rules above that depend on them.

| Requirements §12 item | Depends on / blocks |
|---|---|
| §12.3 — Pending request expiry policy (exact threshold) | BR-016a |
| §12.6 — Plan changes mid-period (immediate replacement vs. stacking); a recommendation (immediate replacement) is noted but not confirmed | BR-032's timing when the vendor already holds an active *paid* plan |
| §12.7 — Multiple pending requests allowed or not | BR-020a |

Resolved items (already reflected as rules above, not repeated here): §12.1 (BR-027), §12.2 (BR-039), §12.4 (BR-023), §12.5 (BR-012–BR-014).

---

## 13. Cross-References

- Full rule text and rationale in context: [`01-subscription-requirements-v2.md`](./01-subscription-requirements-v2.md).
- Endpoints implementing these rules: [`02-api-specification.md`](./02-api-specification.md).
- Tables enforcing these rules: [`04-database-schema.md`](./04-database-schema.md).
- Tests verifying these rules: [`05-testing-strategy.md`](./05-testing-strategy.md).
