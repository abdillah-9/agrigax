# Agrigax Backend — API Specification

**Authoritative source**: [`docs/01-subscription-requirements-v2.md`](./01-subscription-requirements-v2.md). Every business rule, field, status enum, and workflow referenced below (`§N`) is defined there. This document does not introduce new business rules — it defines the REST surface (paths, methods, request/response shapes, HTTP status codes) needed to implement the rules already specified in the requirements document.

---

## 0. Scope

The requirements document governs the **vendor subscription system**. This API specification covers:

1. The five new subscription tables and their endpoints (§4 of the requirements doc): `subscription_plans`, `payment_methods`, `subscription_requests`, `vendor_subscriptions`, `subscription_request_logs`.
2. Admin reporting endpoints (§9 "Reporting").
3. The one new side effect on the existing `auth` registration endpoint (§5.1, Starter auto-assignment).
4. The `requireActiveSubscription` gate applied to existing `listings`/`bookings` endpoints (§8) — documented as a cross-cutting effect on those routes, not a re-specification of their full existing contracts.
5. The two existing `notifications` endpoints, plus the five new events that must be wired into them (§10).

**Explicitly out of scope**: `users`, `categories`, `favorites`, `reviews`, `messages`, `disputes`. The requirements document states these modules are "unaffected by this document" (§1). Their existing contracts are unchanged and are not reproduced here.

**Removed**: `payments`, `wallet`. Per §2 and §4 of the requirements doc, these modules are retired; no endpoints for them appear in this specification.

---

## 1. Conventions

These are API-design conventions needed to make the specification implementable. They are not business rules from the requirements document.

| Convention | Value |
|---|---|
| Base path | `/api/v1` (prefix omitted from endpoint paths below for brevity) |
| Format | JSON request/response bodies, `Content-Type: application/json`, except file upload (§6.5) |
| Authentication | JWT access token, delivered via httpOnly cookie (per §1 stack: "JWT access/refresh via httpOnly cookies") |
| Timestamps | ISO 8601, UTC (e.g. `2026-07-13T09:00:00Z`) |
| IDs | Integers, matching the `id` PK convention in §4 of the requirements doc |
| Pagination | `?page=1&pageSize=20` on all list endpoints; response wrapped as `{ "data": [...], "pagination": { "page": 1, "pageSize": 20, "total": 42 } }` |
| Error envelope | `{ "error": { "code": "STRING_CODE", "message": "human-readable" } }` |
| Standard error codes | `VALIDATION_ERROR` (400), `UNAUTHENTICATED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `CONFLICT` (409) |

**Authorization roles** referenced below map to the actors defined in §1 of the requirements doc: **Vendor** (role = vendor/provider) and **Admin**. Customers hold no subscription and are never authorized against any endpoint in this document (§8).

---

## 2. Auth — Modified Endpoint

Only one existing `auth` endpoint changes behavior under this document. Its full existing request/response contract (fields, password rules, OTP flow) is unchanged and out of scope here — only the new side effect is specified.

#### POST `/auth/register` (existing endpoint — new side effect only)

| | |
|---|---|
| Authentication | None (public) |
| Authorization | None |
| Path Parameters | None |
| Query Parameters | None |

**Business Rules (new)**
- BR: When the created user has the vendor role, the backend must, in the same request lifecycle, look up the plan flagged `is_default_vendor_plan = true` and create a `vendor_subscriptions` row for that vendor: `status=active`, `start_date=now`, `end_date=null`, `created_from_request_id=null` (§5.1). No `subscription_requests` or `subscription_request_logs` row is created for this event (§5.1.3).
- This is one of exactly three ways a `vendor_subscriptions` row is ever created (§5, second paragraph).
- Customer registrations are unaffected — no subscription row is created for customers (§1, §8).

**Example Response (vendor registration, relevant excerpt only)**
```json
{
  "user": { "id": 501, "role": "vendor", "...": "..." },
  "subscription": {
    "id": 9001,
    "planId": 1,
    "status": "active",
    "startDate": "2026-07-13T09:00:00Z",
    "endDate": null
  }
}
```

---

## 3. Subscription Plans — Vendor-Facing

#### GET `/subscriptions/plans`

| | |
|---|---|
| Description | List plans a vendor can browse/select for upgrade (§6 step 1) |
| Authentication | Required |
| Authorization | Vendor |
| Path Parameters | None |
| Query Parameters | `page`, `pageSize` |
| Request Body | None |

**Validation Rules**: None (read-only).

**Business Rules**
- Only rows where `is_active = true` are returned (§6 step 1: "active plans only"; §4.1 `is_active`).
- Each plan exposes `features` and `limits` as separate objects, never merged (§4.1).

**Success Response** — `200 OK`
```json
{
  "data": [
    {
      "id": 2,
      "name": "Business",
      "description": "For growing vendors",
      "price": "25000.00",
      "currency": "TZS",
      "durationDays": 30,
      "features": { "analytics": true, "prioritySupport": false, "verifiedBadge": true },
      "limits": { "maxListings": 50, "maxFeaturedListings": 5, "maxImagesPerListing": 15 }
    }
  ],
  "pagination": { "page": 1, "pageSize": 20, "total": 3 }
}
```

**Error Responses**: `401 UNAUTHENTICATED`.

---

#### GET `/subscriptions/plans/:id`

| | |
|---|---|
| Description | View a single plan's detail before upgrading |
| Authentication | Required |
| Authorization | Vendor |
| Path Parameters | `id` — plan ID |
| Query Parameters | None |
| Request Body | None |

**Business Rules**: A plan with `is_active = false` is still viewable by ID if the vendor already holds/held a subscription referencing it, but is not offered for new selection (§4.1: "inactive plans are hidden from vendor selection but historical subscriptions referencing them remain valid").

**Success Response** — `200 OK`: same shape as one item in §3's list.

**Error Responses**: `401 UNAUTHENTICATED`, `404 NOT_FOUND`.

---

## 4. Payment Methods — Vendor-Facing

#### GET `/subscriptions/payment-methods`

| | |
|---|---|
| Description | Application displays payment instructions pulled from active `payment_methods` rows (§6 step 2) |
| Authentication | Required |
| Authorization | Vendor |
| Path Parameters | None |
| Query Parameters | None |
| Request Body | None |

**Business Rules**
- Only `is_active = true` rows are returned (§4.2).
- Rows are ordered by `display_order` ascending so the frontend never hardcodes payment method order (§4.2).

**Success Response** — `200 OK`
```json
{
  "data": [
    { "id": 1, "name": "M-Pesa", "type": "mobile_money", "phoneNumber": "0700000000", "instructions": "Pay and keep the confirmation SMS.", "displayOrder": 1 },
    { "id": 2, "name": "CRDB Bank", "type": "bank_account", "accountName": "Agrigax Ltd", "accountNumber": "0150-XXXXXXX", "displayOrder": 2 }
  ]
}
```

**Error Responses**: `401 UNAUTHENTICATED`.

---

## 5. Subscription Requests — Vendor-Facing

#### POST `/subscriptions/requests`

| | |
|---|---|
| Description | Vendor submits a manual payment proof to request a plan upgrade (§6 step 4) |
| Authentication | Required |
| Authorization | Vendor |
| Path Parameters | None |
| Query Parameters | None |

**Request Body**
```json
{
  "planId": 2,
  "paymentMethodId": 1,
  "amount": "25000.00",
  "transactionReference": "MPESA-QK123XYZ",
  "receiptUrl": "https://storage.example.com/receipts/abc123.jpg",
  "notes": "Paid via M-Pesa on 2026-07-13"
}
```

**Validation Rules** (derived from §4.3 field definitions)
- `planId` — required, must reference an existing, `is_active = true` `subscription_plans` row.
- `paymentMethodId` — required, must reference an existing `payment_methods` row (§4.2, §4.3: "should reference a `payment_methods` row ... rather than being free text").
- `amount` — required, decimal, > 0.
- `transactionReference` — required, non-empty string (§4.3: "vendor-supplied reference/transaction ID").
- `receiptUrl` — optional, string (§4.3: nullable).
- `notes` — optional, string (§4.3: nullable).

**Business Rules**
- Creates a `subscription_requests` row with `status = pending` (§6 step 4).
- **Open decision (§12.7, unresolved in the source document)**: whether a vendor may have more than one `pending` request simultaneously, or must resolve/withdraw a prior one first. This endpoint's duplicate-request behavior (whether to reject with `409 CONFLICT` or allow it) **cannot be finalized until §12.7 is resolved.** Implementers must not assume an answer.
- Does **not** touch `vendor_subscriptions` — creating a request never changes the vendor's active plan (§4.3: "a request/approval record, not a subscription itself").

**Success Response** — `201 Created`
```json
{
  "id": 771,
  "vendorId": 501,
  "planId": 2,
  "paymentMethodId": 1,
  "amount": "25000.00",
  "transactionReference": "MPESA-QK123XYZ",
  "receiptUrl": "https://storage.example.com/receipts/abc123.jpg",
  "notes": "Paid via M-Pesa on 2026-07-13",
  "status": "pending",
  "createdAt": "2026-07-13T09:05:00Z"
}
```

**Error Responses**: `400 VALIDATION_ERROR`, `401 UNAUTHENTICATED`, `404 NOT_FOUND` (invalid `planId`/`paymentMethodId`), `409 CONFLICT` (pending §12.7).

---

#### GET `/subscriptions/requests`

| | |
|---|---|
| Description | Vendor views their own request history and status (§6 step 5) |
| Authentication | Required |
| Authorization | Vendor (own requests only) |
| Path Parameters | None |
| Query Parameters | `status` (one of `pending\|approved\|rejected\|expired`), `page`, `pageSize` |
| Request Body | None |

**Business Rules**: Scoped to `vendor_id = current user` only — a vendor can never see another vendor's requests (§1 actor separation).

**Success Response** — `200 OK`: array of request objects (shape as in §5's `POST` response), plus `pagination`.

**Error Responses**: `401 UNAUTHENTICATED`.

---

#### GET `/subscriptions/requests/:id`

| | |
|---|---|
| Description | Vendor views a single request's detail |
| Authentication | Required |
| Authorization | Vendor, and only if `request.vendor_id === current user` |
| Path Parameters | `id` — request ID |
| Query Parameters | None |
| Request Body | None |

**Success Response** — `200 OK`: single request object.

**Error Responses**: `401 UNAUTHENTICATED`, `403 FORBIDDEN` (request belongs to another vendor), `404 NOT_FOUND`.

---

## 6. Vendor Subscriptions — Vendor-Facing

#### GET `/subscriptions/current`

| | |
|---|---|
| Description | Vendor's current plan, derived from their `active` `vendor_subscriptions` row (§4.4: "A vendor's current plan is derived by querying for their `vendor_subscriptions` row with `status = active`") |
| Authentication | Required |
| Authorization | Vendor |
| Path Parameters | None |
| Query Parameters | None |
| Request Body | None |

**Business Rules**
- Exactly one `active` row always exists for an authenticated vendor — every vendor holds at least the permanent Starter plan from registration onward (§8, last paragraph; §12.1). This endpoint should never legitimately 404 for a vendor account.
- Response includes the resolved plan's `features` and `limits` so the frontend can gate UI without a second request.

**Success Response** — `200 OK`
```json
{
  "id": 9001,
  "planId": 1,
  "plan": { "name": "Starter", "features": { "analytics": false }, "limits": { "maxListings": 5 } },
  "status": "active",
  "startDate": "2026-01-10T08:00:00Z",
  "endDate": null
}
```

**Error Responses**: `401 UNAUTHENTICATED`.

---

#### GET `/subscriptions/history`

| | |
|---|---|
| Description | Vendor's own past subscription periods |
| Authentication | Required |
| Authorization | Vendor (own history only) |
| Path Parameters | None |
| Query Parameters | `page`, `pageSize` |
| Request Body | None |

**Business Rules**: This is a supporting endpoint, not an explicitly enumerated requirement — it surfaces the full per-vendor history that §4.4 requires the system to preserve ("Immutable once created ... preserves full subscription history per vendor"). No new business rule is introduced; it exposes existing data.

**Success Response** — `200 OK`: array of `vendor_subscriptions` rows for the current vendor, most recent first, plus `pagination`.

**Error Responses**: `401 UNAUTHENTICATED`.

---

## 7. Admin — Plan Management (§9 "Plans")

#### POST `/admin/subscriptions/plans`

| | |
|---|---|
| Description | Create a plan |
| Authentication | Required |
| Authorization | Admin |
| Path Parameters | None |
| Query Parameters | None |

**Request Body**
```json
{
  "name": "Business",
  "description": "For growing vendors",
  "price": "25000.00",
  "currency": "TZS",
  "durationDays": 30,
  "features": { "analytics": true, "prioritySupport": false, "verifiedBadge": true },
  "limits": { "maxListings": 50, "maxFeaturedListings": 5 },
  "isDefaultVendorPlan": false,
  "isActive": true
}
```

**Validation Rules** (§4.1)
- `name` — required, string.
- `description` — required, text.
- `price` — required, decimal ≥ 0.
- `currency` — required, string.
- `durationDays` — required, integer > 0.
- `features` — required, object of booleans.
- `limits` — required, object of numbers.
- `isDefaultVendorPlan` — boolean, default `false`.
- `isActive` — boolean, default `true`.

**Business Rules**
- **Exactly one** plan system-wide may have `isDefaultVendorPlan = true` (§4.1: "exactly one plan should be flagged as the auto-assigned registration plan"). Setting this flag `true` on a new or edited plan must atomically unset it on whichever plan currently holds it.
- Plan names/pricing/features are fully admin-configurable — nothing about tiers is hardcoded (§3).

**Success Response** — `201 Created`: the created plan object.

**Error Responses**: `400 VALIDATION_ERROR`, `401 UNAUTHENTICATED`, `403 FORBIDDEN` (non-admin).

---

#### GET `/admin/subscriptions/plans`

| | |
|---|---|
| Description | List all plans, including inactive ones (admin view, unlike the vendor-facing §3 endpoint) |
| Authentication | Required |
| Authorization | Admin |
| Query Parameters | `isActive` (optional filter), `page`, `pageSize` |

**Success Response** — `200 OK`: array of plan objects (all, regardless of `is_active`) + `pagination`.

**Error Responses**: `401 UNAUTHENTICATED`, `403 FORBIDDEN`.

---

#### GET `/admin/subscriptions/plans/:id`

Same as §3's vendor detail endpoint, but authorized for Admin and not filtered by `is_active`.

**Error Responses**: `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 NOT_FOUND`.

---

#### PATCH `/admin/subscriptions/plans/:id`

| | |
|---|---|
| Description | Edit a plan — price, duration, features, limits, description (§9: "Edit a plan (price, duration, features, limits, description)"). Also used to disable a plan by setting `isActive: false` — the requirements doc lists "disable" as a distinct admin capability, but it is the same underlying field mutation as "edit," so no separate route is defined. |
| Authentication | Required |
| Authorization | Admin |
| Path Parameters | `id` — plan ID |

**Request Body**: any subset of the fields from the `POST` body above.

**Validation Rules**: same per-field rules as `POST`, applied only to fields present in the request.

**Business Rules**
- Setting `isActive: false` hides the plan from vendor selection (§3, §4) without invalidating historical subscriptions/requests that reference it (§4.1, §9).
- The single-default-plan invariant from `POST` applies identically here.

**Success Response** — `200 OK`: the updated plan object.

**Error Responses**: `400 VALIDATION_ERROR`, `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 NOT_FOUND`.

---

#### DELETE `/admin/subscriptions/plans/:id`

| | |
|---|---|
| Description | Delete a plan (§9: "Delete a plan, if no `vendor_subscriptions` or `subscription_requests` reference it (otherwise disable instead)") |
| Authentication | Required |
| Authorization | Admin |
| Path Parameters | `id` — plan ID |

**Business Rules**
- Hard delete is only permitted if zero `vendor_subscriptions` rows and zero `subscription_requests` rows reference this `plan_id` (§9). Otherwise the request must be rejected — the caller should use the disable path (`PATCH` with `isActive: false`) instead.
- A plan flagged `isDefaultVendorPlan = true` should not be deletable at all while it holds that flag, since every vendor is guaranteed an active default-plan subscription (§8) — reassign the flag to another plan first.

**Success Response** — `204 No Content`.

**Error Responses**: `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 NOT_FOUND`, `409 CONFLICT` (referenced by existing rows, or currently the default plan).

---

## 8. Admin — Payment Methods (§9 "Configuration", §4.2)

Requirements doc scope for this resource is narrower than plans: "create, edit, and activate/deactivate" only — no delete capability is listed (§9).

#### POST `/admin/payment-methods`

| Authentication | Required | | Authorization | Admin |
|---|---|---|---|---|

**Request Body**
```json
{
  "name": "M-Pesa",
  "type": "mobile_money",
  "accountName": null,
  "accountNumber": null,
  "phoneNumber": "0700000000",
  "instructions": "Pay and keep the confirmation SMS.",
  "displayOrder": 1,
  "isActive": true
}
```

**Validation Rules** (§4.2)
- `name` — required, string.
- `type` — required, string (`mobile_money | bank_account | other`, per §4.2).
- `accountName`, `accountNumber`, `phoneNumber` — nullable strings; which are relevant is informed by `type` (§4.2).
- `instructions` — nullable text.
- `displayOrder` — required, integer.
- `isActive` — boolean, default `true`.

**Success Response** — `201 Created`: the created payment method object.

**Error Responses**: `400 VALIDATION_ERROR`, `401 UNAUTHENTICATED`, `403 FORBIDDEN`.

---

#### GET `/admin/payment-methods`

Lists all payment methods including inactive ones. Query: `isActive`, `page`, `pageSize`.

**Error Responses**: `401 UNAUTHENTICATED`, `403 FORBIDDEN`.

---

#### PATCH `/admin/payment-methods/:id`

Edits any subset of the `POST` fields, including toggling `isActive` (this is the "activate/deactivate" capability from §9 — no separate route).

**Business Rules**: `subscription_requests` rows already reference a specific `payment_methods` row by ID (§4.2, §4.3), so editing instructions on an existing method does not retroactively change what past vendors were told — only new requests see the updated instructions.

**Success Response** — `200 OK`: updated object.

**Error Responses**: `400 VALIDATION_ERROR`, `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 NOT_FOUND`.

---

## 9. Admin — Subscription Requests (§9 "Subscription requests", §5, §4.5)

#### GET `/admin/subscription-requests`

| | |
|---|---|
| Description | View all subscription requests, filterable by status (§9) |
| Authentication | Required |
| Authorization | Admin |
| Query Parameters | `status` (`pending\|approved\|rejected\|expired`), `vendorId`, `page`, `pageSize` |

**Success Response** — `200 OK`: array of request objects + `pagination`.

**Error Responses**: `401 UNAUTHENTICATED`, `403 FORBIDDEN`.

---

#### GET `/admin/subscription-requests/:id`

| | |
|---|---|
| Description | View a single request plus its full audit trail (§9: "View the audit trail (`subscription_request_logs`) for a given request — who approved/rejected it, when, and any comment") |
| Authentication | Required |
| Authorization | Admin |
| Path Parameters | `id` |

**Business Rules**: The audit trail requirement is satisfied by embedding the `subscription_request_logs` rows for this request inline in the response, rather than a separate endpoint, since a request's logs are always viewed in the context of that request (§4.5, §9).

**Success Response** — `200 OK`
```json
{
  "id": 771,
  "vendorId": 501,
  "planId": 2,
  "status": "approved",
  "verifiedBy": 12,
  "verifiedAt": "2026-07-13T10:00:00Z",
  "logs": [
    { "id": 1, "adminId": 12, "action": "approved", "comment": null, "createdAt": "2026-07-13T10:00:00Z" }
  ]
}
```

**Error Responses**: `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 NOT_FOUND`.

---

#### POST `/admin/subscription-requests/:id/approve`

| | |
|---|---|
| Description | Approve a pending request, triggering the full activation workflow (§5, §4.6) |
| Authentication | Required |
| Authorization | Admin |
| Path Parameters | `id` — request ID |
| Request Body | None (or optional `{ "comment": "..." }` for the approval log entry) |

**Validation Rules**: The target request must currently have `status = pending`. Approving a request that is not `pending` is invalid.

**Business Rules — all within one atomic transaction (§4.6, §5)**
1. Deactivate the vendor's current `active` `vendor_subscriptions` row **first** (§4.6 rule 3).
2. Insert a new `vendor_subscriptions` row: `start_date=now`, `end_date = now + plan.duration_days`, `status=active`, `created_from_request_id = request.id` (§5 diagram).
3. Mark the request `status = approved`, set `verified_by` and `verified_at` (§4.3).
4. Insert a `subscription_request_logs` row with `action = approved` (§4.5 — mandatory, not optional).
5. Send a "subscription approved" notification (§10).
6. **Open decision (§12.6, unresolved)**: if the vendor already has an active *paid* plan (not just Starter) when this approval happens, whether the new period starts immediately (replacing remaining days) or stacks after the current `end_date` is not finalized in the source document. The recommended-but-unconfirmed default noted there is immediate replacement, consistent with the deactivate-then-create pattern in §4.6 — implementers should treat this as provisional until §12.6 is formally resolved.
7. If any step fails, the entire transaction rolls back — the vendor's prior subscription remains active and the request remains `pending` (§4.6 rule 2).
8. A vendor can never end up with more than one `active` `vendor_subscriptions` row, even momentarily (§4.6 rule 1).

**Success Response** — `200 OK`: the updated request object (status = approved) plus the newly created `vendor_subscriptions` row.

**Error Responses**: `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 NOT_FOUND`, `409 CONFLICT` (request not `pending`).

---

#### POST `/admin/subscription-requests/:id/reject`

| | |
|---|---|
| Description | Reject a pending request (§6 step 7) |
| Authentication | Required |
| Authorization | Admin |
| Path Parameters | `id` — request ID |

**Request Body**
```json
{ "comment": "Transaction reference does not match bank statement" }
```

**Validation Rules**: The target request must currently have `status = pending`. `comment` is optional at the schema level (§4.5: nullable) but strongly recommended since it doubles as the vendor-facing rejection reason.

**Business Rules — within one transaction (§5 diagram)**
1. Set `status = rejected` on the request.
2. Insert a `subscription_request_logs` row with `action = rejected`, `comment = reason` (§4.5 — this is where the rejection reason lives; §4.3 has no separate reason field, per the resolved §12.4 decision).
3. Notify the vendor (§10).
4. The vendor's existing active subscription is **untouched** — rejection never changes `vendor_subscriptions` (§5 diagram: reject path has no subscription-table writes).

**Success Response** — `200 OK`: the updated request object (status = rejected).

**Error Responses**: `400 VALIDATION_ERROR`, `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 NOT_FOUND`, `409 CONFLICT` (request not `pending`).

---

## 10. Admin — Vendor Subscriptions (§9 "Subscriptions")

#### GET `/admin/vendor-subscriptions`

| | |
|---|---|
| Description | Operational view over `vendor_subscriptions`, covering all four admin capabilities in §9 ("View subscription history", "View currently active subscriptions", "View expired subscriptions", "View upcoming expirations") through query parameters rather than four separate routes |
| Authentication | Required |
| Authorization | Admin |
| Query Parameters | `vendorId`, `planId`, `status` (`pending\|active\|expired\|cancelled`), `expiringWithinDays` (integer — when set, filters to `status=active AND end_date <= now + N days`, per §9's "upcoming expirations" definition), `page`, `pageSize` |

**Mapping to §9 requirements**

| §9 capability | Query |
|---|---|
| View subscription history | no filters (or `vendorId`/`planId` only) |
| View currently active subscriptions | `status=active` |
| View expired subscriptions | `status=expired` |
| View upcoming expirations | `status=active&expiringWithinDays=7` (or `3`, matching §10's pre-expiry notification windows) |

**Success Response** — `200 OK`: array of `vendor_subscriptions` rows + `pagination`.

**Error Responses**: `401 UNAUTHENTICATED`, `403 FORBIDDEN`.

---

## 11. Admin — Reporting (§9 "Reporting")

All revenue/payment figures are derived entirely from **approved** `subscription_requests` rows, since there is no live payment gateway (§9, closing note).

#### GET `/admin/reports/revenue`

| Query Parameters | `period` = `total \| monthly \| yearly` |
|---|---|

**Business Rules**: sums `amount` on `subscription_requests` where `status = approved`, grouped per §9 ("Total revenue", "Monthly revenue", "Yearly revenue").

**Success Response** — `200 OK`
```json
{ "period": "monthly", "data": [ { "month": "2026-06", "revenue": "450000.00" }, { "month": "2026-07", "revenue": "125000.00" } ] }
```

**Error Responses**: `400 VALIDATION_ERROR` (invalid `period`), `401 UNAUTHENTICATED`, `403 FORBIDDEN`.

---

#### GET `/admin/reports/vendors`

**Business Rules** (§9): three counts —
- `activeVendors` — vendors with any `vendor_subscriptions` row currently `status = active`.
- `starterVendors` — active subscribers currently on the plan flagged `is_default_vendor_plan`.
- `paidVendors` — active subscribers on any non-default plan.

**Success Response** — `200 OK`
```json
{ "activeVendors": 340, "starterVendors": 210, "paidVendors": 130 }
```

**Error Responses**: `401 UNAUTHENTICATED`, `403 FORBIDDEN`.

---

#### GET `/admin/reports/requests`

| Query Parameters | `status` (`pending\|approved\|rejected`), `from`, `to` (date range) |
|---|---|

**Business Rules** (§9): counts/lists of requests by status, filterable by date range for `approved`/`rejected`.

**Success Response** — `200 OK`: `{ "status": "approved", "count": 87, "data": [...] }`.

**Error Responses**: `400 VALIDATION_ERROR`, `401 UNAUTHENTICATED`, `403 FORBIDDEN`.

---

#### GET `/admin/reports/expirations`

**Business Rules** (§9): "Expired subscriptions (count/list)" and "Upcoming expirations (as above, surfaced here as a report in addition to the operational list)" — this is the reporting-oriented counterpart to §10's operational `expiringWithinDays` filter.

**Success Response** — `200 OK`: `{ "expiredCount": 45, "upcoming": { "in7Days": 12, "in3Days": 4 } }`.

**Error Responses**: `401 UNAUTHENTICATED`, `403 FORBIDDEN`.

---

## 12. Notifications (§10)

The two existing `notifications` endpoints (list, mark-read) are unchanged in contract. What changes is that five events must now actually call `createNotification` internally (§10: "`createNotification` exists but is never called by anything"). These are **internal triggers, not endpoints** — no vendor/admin ever calls them directly.

| Event | Triggered by | Recipient |
|---|---|---|
| Subscription request approved | `POST /admin/subscription-requests/:id/approve` | Vendor |
| Subscription request rejected | `POST /admin/subscription-requests/:id/reject` | Vendor |
| Subscription expires in 7 days | Scheduled pre-expiry check (§7, §10) | Vendor |
| Subscription expires in 3 days | Scheduled pre-expiry check (§7, §10) | Vendor |
| Subscription expired | Scheduled expiry job (§7) | Vendor |

**GET `/notifications`** and **PATCH `/notifications/:id/read`** — existing contracts, unchanged. Out of scope for this document beyond noting delivery is in-app only; no email/SMS provider exists yet (§10, closing note).

---

## 13. Existing Endpoints Gated by `requireActiveSubscription` (§8)

These `listings`/`bookings` endpoints already exist and are unchanged in request/response shape. This document adds one thing: a subscription check that can now return a new error before the existing handler runs.

| Existing endpoint (unchanged shape) | New gate |
|---|---|
| Create listing | `requireActiveSubscription()` — must have an `active`, non-expired subscription |
| Publish/unpublish listing | `requireActiveSubscription()` |
| Accept a booking | `requireActiveSubscription()` |
| Promote/feature a listing | `requireActiveSubscription('limits.maxFeaturedListings')` — additionally requires `plan.limits.maxFeaturedListings > 0` |
| Any `features`-gated action (e.g. analytics view) | `requireActiveSubscription('features.<key>')` — requires that boolean flag `=== true` |

**New Error Response** (added to all gated endpoints) — `403 FORBIDDEN`
```json
{ "error": { "code": "SUBSCRIPTION_REQUIRED", "message": "An active subscription with this feature is required." } }
```

**Business Rules**: Per §8, this only triggers once a vendor's active period has lapsed and the expiry job has run — every vendor has *some* active subscription (Starter at minimum) from registration onward, so "no active subscription" never occurs for a normal vendor account (§8, last paragraph; reinforced by §12.1's permanent-Starter resolution). Customers are never subject to this gate (§8).

---

## 14. Cross-References

- Field types, enums, and table relationships: [`04-database-schema.md`](./04-database-schema.md).
- Which phase each endpoint group is built in: [`03-development-roadmap.md`](./03-development-roadmap.md).
- Full business-rule catalog with IDs: [`09-business-rules.md`](./09-business-rules.md).
- Sequence/flow diagrams for the approval and expiry transactions: [`07-architecture-overview.md`](./07-architecture-overview.md).
