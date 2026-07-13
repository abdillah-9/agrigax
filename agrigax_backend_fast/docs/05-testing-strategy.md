# Agrigax Backend — Testing Strategy

**Authoritative source**: [`docs/01-subscription-requirements-v2.md`](./01-subscription-requirements-v2.md). Every test scenario below verifies a specific rule from that document (cited by `§N`). This document defines *what* to test and *why*, not test code — see [`03-development-roadmap.md`](./03-development-roadmap.md) Phase 10 for when this work happens.

**Context**: the app-wide test suite is currently broken (`§1`: "tests broken" on `auth`). The subscription module's test suite must be independently runnable and must not inherit that breakage.

---

## 1. Test Layers

Following the existing layered architecture (`routes → controllers → services → repositories`, §1):

| Layer | What it verifies | Depends on real DB? |
|---|---|---|
| Repository | Correct SQL/Knex queries against real tables | Yes (test DB) |
| Service | Business rules, transaction orchestration | Yes (test DB) — services own the transactions in §4.6 |
| Controller | Request validation, response shape, status codes | No — repository/service layer mocked |
| Middleware | Access-control decisions | No — mocked subscription/plan data |
| Integration | Full request → DB → response, across layers | Yes (test DB) |
| Scheduled job | Expiry/fallback correctness over time | Yes (test DB), with manipulable clock |

---

## 2. Repository Tests

**What should be tested**: that each repository method issues the correct query and returns correctly shaped rows, for all five subscription tables (§4.1–§4.5).

| Positive | Negative | Edge |
|---|---|---|
| `subscription_plans.findActive()` returns only `is_active=true` rows | Querying a non-existent plan ID returns `null`/empty, not an error | A plan with `is_default_vendor_plan=true` and one with `false` are both returned correctly by `findDefault()` vs. general list |
| `vendor_subscriptions.findActiveByVendor(id)` returns the one active row | A vendor with only an expired row returns none | A vendor with `end_date=null` (Starter) is correctly treated as "active forever," never filtered out by an `end_date` comparison |
| `subscription_requests.findByStatus('pending')` returns only pending rows | Filtering by an invalid enum value is rejected at the validation layer, not silently ignored by the repository | Pagination boundaries (`page` beyond last page returns empty array, not an error) |
| `subscription_request_logs.findByRequest(id)` returns rows ordered oldest→newest | Querying logs for a request with zero actions returns `[]` | A request with both an `approved` and a later `rejected`-then-reopened log (if ever supported) orders correctly by `created_at` |

---

## 3. Service Tests

This is where the highest-value tests live — the business rules in §4.6, §5, §7 are enforced at the service layer, not the DB layer.

### 3.1 `subscription_plans` service
- **Positive**: creating a plan with `is_default_vendor_plan=true` unsets the flag on the prior default plan, atomically.
- **Negative**: deleting a plan referenced by any `vendor_subscriptions` or `subscription_requests` row is rejected (§9).
- **Edge**: deleting the currently-flagged default plan is rejected even if unreferenced by any subscription, since every vendor's future registration depends on a default plan existing.

### 3.2 `payment_methods` service
- **Positive**: toggling `is_active` hides/shows the method from vendor-facing queries without deleting historical `subscription_requests` references.
- **Negative**: N/A — no delete capability exists for this resource per §9; a test should confirm no delete method is exposed at all.
- **Edge**: editing `display_order` correctly re-sorts vendor-facing listings without needing to touch other rows' order values.

### 3.3 `subscription_requests` service
- **Positive**: submitting a request creates a `pending` row and does not touch `vendor_subscriptions` (§4.3).
- **Negative**: submitting with a `planId` for an `is_active=false` plan is rejected.
- **Edge**: submitting with a `planId`/`paymentMethodId` that doesn't exist returns 404, not a DB constraint error leaking to the client.

### 3.4 Activation service (§4.6 — the core of the whole system)
- **Positive**: approving a `pending` request when the vendor's current active row is Starter — deactivates Starter, creates a new `active` paid row, marks the request `approved`, writes exactly one `approved` log row, all as one transaction.
- **Positive**: approving when the vendor's current active row is already a *different* paid plan — same sequence, old paid row deactivated first.
- **Negative**: approving a request that is not `pending` (e.g. already `approved` or `rejected`) is rejected, no writes occur.
- **Negative**: a forced failure injected between "deactivate old row" and "insert new row" causes a full rollback — the old row is still `active`, no new row exists, the request is still `pending`, no log row was written.
- **Edge**: two concurrent approval attempts on the same request — only one may succeed; the loser sees a `409`-equivalent, not a duplicate activation.
- **Edge (invariant test)**: after any sequence of approve operations, a direct query for `vendor_subscriptions WHERE vendor_id=X AND status='active'` never returns more than one row (§4.6 rule 1) — run this as a property-style check after a randomized sequence of approvals in a test suite, not just after one hand-picked scenario.
- **Positive (reject path)**: rejecting a `pending` request sets `status=rejected`, writes exactly one `rejected` log row with the comment, and makes zero writes to `vendor_subscriptions`.

### 3.5 Expiry/fallback service (§7, §12.1, §12.2)
- **Positive**: a paid `vendor_subscriptions` row with `end_date` in the past is marked `expired`, and a new Starter row (`status=active`, `end_date=null`) is created, in the same transaction.
- **Negative**: a paid row with `end_date` in the future is untouched by the job.
- **Edge**: the permanent Starter row (`end_date=null`) is never selected by the expiry query — `null < now` must evaluate as excluded, not as a matching row.
- **Edge**: a vendor who is expired and then re-approved for a new paid plan before the *next* job run is not double-processed — the job only acts on rows that are still `active` at run time.
- **Edge (invariant test)**: after the job runs over any dataset, no vendor has zero `active` rows.

### 3.6 Pre-expiry notification service (§7 point 4, §10)
- **Positive**: a subscription crossing the 7-day threshold triggers exactly one "expires in 7 days" notification.
- **Positive**: a subscription crossing the 3-day threshold triggers exactly one "expires in 3 days" notification, independent of whether the 7-day one already fired.
- **Negative**: a subscription 10 days from expiry does not trigger either notification.
- **Edge**: running the check twice in the same day for the same subscription does not produce duplicate notifications (idempotency).

---

## 4. Controller Tests

**What should be tested**: request validation, authentication/authorization enforcement, and response shape — with the service layer mocked.

| Module | Positive | Negative | Edge |
|---|---|---|---|
| Plans (admin) | Valid create/edit payload returns 201/200 with expected shape | Missing required field (`name`, `price`, etc.) returns 400 with field-level detail | Non-admin caller (vendor JWT) returns 403, not 404 |
| Payment methods (admin) | Valid create returns 201 | Invalid `type` enum value returns 400 | — |
| Subscription requests (vendor) | Valid submission returns 201 | Vendor requesting another vendor's request by ID returns 403 | Unauthenticated call returns 401, not a validation error |
| Approve/reject (admin) | Approving a pending request returns 200 with updated status | Approving a non-existent ID returns 404 | Approving an already-approved request returns 409, not a silent 200 |
| Reporting (admin) | Valid query params return aggregated data | Invalid `period` value on revenue endpoint returns 400 | Empty dataset returns zeroed aggregates, not an error or `null` |

---

## 5. Middleware Tests (`requireActiveSubscription`, §8)

**What should be tested**: the gating decision in isolation, with subscription/plan data mocked — no real DB required.

| Positive | Negative | Edge |
|---|---|---|
| Vendor with an active subscription and no feature requirement passes through | Vendor with no active subscription (e.g. all rows expired, job hasn't run — see edge case below) is blocked with `403 SUBSCRIPTION_REQUIRED` | A vendor account should never actually reach "no active row" per §8's invariant — but the middleware must fail safe (block, not crash or allow) if it somehow does |
| Vendor with `limits.maxFeaturedListings > 0` passes a feature-gated check | Vendor with `limits.maxFeaturedListings = 0` is blocked from the promote-listing action | A plan missing the requested key entirely (e.g. `limits.maxFeaturedListings` undefined rather than `0`) is treated as failing the check, not as passing by accident |
| Vendor with `features.analytics === true` passes an analytics-gated check | Vendor with `features.analytics === false` is blocked | — |
| — | Customer JWT never reaches this middleware at all (§8) | A route mistakenly wired with this middleware for a customer-only action should be caught by a route-configuration test, not just runtime behavior |

---

## 6. Scheduled Job Tests (§7)

**What should be tested**: correctness under time manipulation, since this is the only polling process in the system (§7, closing paragraph).

- **Positive**: seed one expired paid row and one non-expired paid row; run the job once; assert only the expired one transitions, and exactly one new Starter row is created.
- **Negative**: run the job with zero eligible rows; assert no writes occur and no notifications fire.
- **Edge**: run the job twice in immediate succession; assert the second run is a no-op for rows already processed by the first (idempotency — a row already `expired` with its Starter-fallback already created must not be reprocessed).
- **Edge**: simulate a job failure mid-batch (one vendor's transaction throws); assert other vendors in the same batch are unaffected (each vendor's expire-and-fallback is its own transaction, not one transaction for the whole batch) and the failed vendor's row remains in its pre-failure state for retry on the next run.

---

## 7. Authentication Tests

Scoped to the one new side effect on `auth` (§5.1) — the rest of the `auth` module's existing test coverage is out of scope for this document.

- **Positive**: registering a vendor produces exactly one `active` Starter `vendor_subscriptions` row (`end_date=null`) as an atomic part of registration.
- **Negative**: registering a customer produces zero `vendor_subscriptions` rows.
- **Edge**: if the default-plan lookup fails (misconfigured environment, no plan flagged), registration must fail with a clear error rather than silently creating a vendor with no subscription (which would break the "every vendor always has an active subscription" invariant §8 relies on).

---

## 8. Integration Tests

End-to-end, across all layers, against a real test database — these are the tests that most directly validate the requirements document's flows.

- **Full upgrade flow**: register vendor → `GET /subscriptions/plans` → `POST /subscriptions/requests` → admin `POST .../approve` → `GET /subscriptions/current` reflects the new paid plan.
- **Full rejection flow**: register vendor → submit request → admin rejects with a comment → vendor's `GET /subscriptions/current` is unchanged → `GET /subscriptions/requests/:id` shows `rejected` and the admin's comment is visible via the logs.
- **Full expiry-and-fallback flow**: approve a short-`duration_days` plan → advance the test clock past `end_date` → run the expiry job → vendor's `GET /subscriptions/current` shows Starter again, and `GET /subscriptions/history` shows the full three-row history (Starter → paid → Starter).
- **Middleware integration**: a vendor blocked from promoting a listing on Starter succeeds after an approved upgrade to a plan with `maxFeaturedListings > 0`, using the real middleware and real DB state (not mocks).

---

## 9. Recommended Test Folder Structure

Mirrors the existing layered architecture and module boundaries (§1), scoped to the new subscription modules:

```
test/
  subscriptions/
    repositories/
      subscription-plans.repository.test.js
      payment-methods.repository.test.js
      subscription-requests.repository.test.js
      vendor-subscriptions.repository.test.js
      subscription-request-logs.repository.test.js
    services/
      subscription-plans.service.test.js
      payment-methods.service.test.js
      subscription-requests.service.test.js
      activation.service.test.js        # §4.6 approve/reject transaction
      expiry.service.test.js            # §7 expiry + fallback
      pre-expiry-notifications.service.test.js
    controllers/
      subscription-plans.controller.test.js
      payment-methods.controller.test.js
      subscription-requests.controller.test.js
      admin-reports.controller.test.js
    middleware/
      require-active-subscription.test.js
    jobs/
      expiry-job.test.js
    integration/
      upgrade-flow.test.js
      rejection-flow.test.js
      expiry-fallback-flow.test.js
      middleware-gating-flow.test.js
  auth/
    registration-starter-assignment.test.js   # §5.1 side effect only
  fixtures/
    plans.js            # default (Starter) + one paid plan
    payment-methods.js
    users.js
```

**Rationale**: repository/service/controller/middleware tests are grouped by architectural layer (matching `§1`'s stated layering), so a developer working on one layer can run just that directory. Integration tests live separately since they cross all layers and are slower. The one `auth` test file stays in the existing `auth` test directory since it tests a hook inside that module, not a new module.

---

## 10. Cross-References

- What each test is protecting: [`09-business-rules.md`](./09-business-rules.md).
- When each test suite is built: [`03-development-roadmap.md`](./03-development-roadmap.md) Phase 10 (and inline per-phase "Testing Requirements").
- Endpoint contracts under test: [`02-api-specification.md`](./02-api-specification.md).
