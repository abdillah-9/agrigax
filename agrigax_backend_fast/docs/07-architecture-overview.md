# Agrigax Backend — Architecture Overview

**Authoritative source**: [`docs/01-subscription-requirements-v2.md`](./01-subscription-requirements-v2.md). This document visualizes the flows and structures already specified there. No new architectural decisions are introduced — diagrams and prose only explain how the pieces in §4–§8 fit together at runtime. No implementation code.

---

## 1. System Architecture

Agrigax Backend is a monolithic Node.js/Express API over MySQL (§1). The subscription system is one bounded domain within it, deliberately isolated from the payment domain (§11):

```mermaid
flowchart LR
    subgraph Client
        VendorApp[Vendor Frontend]
        AdminApp[Admin Frontend]
        CustomerApp[Customer Frontend]
    end

    subgraph API["Agrigax Backend (Express)"]
        Auth[auth]
        Subs[subscriptions domain]
        Listings[listings]
        Bookings[bookings]
        Notif[notifications]
        Job[Scheduled Job Runner]
    end

    DB[(MySQL)]

    VendorApp --> Auth
    VendorApp --> Subs
    VendorApp --> Listings
    VendorApp --> Bookings
    AdminApp --> Subs
    CustomerApp --> Listings
    CustomerApp --> Bookings

    Auth --> DB
    Subs --> DB
    Listings --> DB
    Bookings --> DB
    Notif --> DB
    Job --> Subs
    Job --> Notif

    Listings -. requireActiveSubscription .-> Subs
    Bookings -. requireActiveSubscription .-> Subs
```

**Customers never touch the subscription domain** (§1, §8) — the dotted lines show the only coupling: existing modules calling into the subscription domain's middleware to check gating, not the reverse.

---

## 2. Layered Architecture

Every module, including the five new subscription tables' modules, follows the existing layering (§1):

```mermaid
flowchart TD
    Route[Routes] --> Controller[Controllers]
    Controller --> Service[Services]
    Service --> Repository[Repositories]
    Repository --> DB[(MySQL via Knex)]

    Route -.->|"validation (Joi)"| Controller
    Service -.->|"transactions (§4.6)"| DB
```

| Layer | Responsibility in the subscription domain |
|---|---|
| Routes | Bind HTTP method + path to a controller; attach `requireActiveSubscription` where relevant (listings/bookings only, §8) |
| Controllers | Joi validation, auth/role checks, shape the HTTP response |
| Services | All business rules from §3–§9: the single-default-plan invariant, the activation transaction (§4.6), expiry-and-fallback (§7) |
| Repositories | Knex queries against the five subscription tables (§4) |

Business rules live in the **service** layer exclusively — repositories are dumb data access, controllers are dumb HTTP translation. This is what makes the atomicity guarantees in §4.6 testable in isolation (see [`05-testing-strategy.md §3`](./05-testing-strategy.md#3-service-tests)).

---

## 3. Request Flow — Vendor Submits a Subscription Request

```mermaid
sequenceDiagram
    participant V as Vendor (client)
    participant R as Route
    participant C as Controller
    participant S as Service
    participant Rp as Repository
    participant DB as MySQL

    V->>R: POST /subscriptions/requests
    R->>C: dispatch
    C->>C: Joi validation (planId, paymentMethodId, amount, reference)
    C->>S: submitRequest(vendorId, payload)
    S->>Rp: findActivePlan(planId)
    Rp->>DB: SELECT ... WHERE id=? AND is_active=true
    DB-->>Rp: plan row
    S->>Rp: findPaymentMethod(paymentMethodId)
    Rp->>DB: SELECT ...
    DB-->>Rp: method row
    S->>Rp: insertRequest(status=pending, ...)
    Rp->>DB: INSERT INTO subscription_requests
    DB-->>Rp: new row
    Rp-->>S: request
    S-->>C: request
    C-->>V: 201 Created
```

This flow never touches `vendor_subscriptions` (§4.3) — submission is purely a `subscription_requests` write.

---

## 4. Authentication Flow — Vendor Registration with Starter Auto-Assignment

```mermaid
sequenceDiagram
    participant V as New Vendor
    participant Auth as auth service
    participant Subs as subscriptions service
    participant DB as MySQL

    V->>Auth: POST /auth/register (role=vendor)
    Auth->>DB: INSERT INTO users
    DB-->>Auth: user row
    Auth->>Subs: assignDefaultPlan(userId)
    Subs->>DB: SELECT * FROM subscription_plans WHERE is_default_vendor_plan=true
    DB-->>Subs: default plan (Starter)
    Subs->>DB: INSERT INTO vendor_subscriptions (status=active, end_date=null, created_from_request_id=null)
    DB-->>Subs: vendor_subscriptions row
    Subs-->>Auth: ok
    Auth-->>V: 201 Created (user + subscription)
```

Per §5.1: no `subscription_requests` or `subscription_request_logs` row is created here — this is system-assigned, not vendor-submitted.

---

## 5. Subscription Flow — Full Lifecycle

This is the diagram from §5 of the requirements document, restated visually:

```mermaid
stateDiagram-v2
    [*] --> Starter: Registration (§5.1)\nend_date=null, permanent (§12.1)
    Starter --> PendingRequest: Vendor submits\nsubscription_request (§6)
    PendingRequest --> Rejected: Admin rejects (§6.7)\nlog written, vendor unaffected
    Rejected --> Starter
    PendingRequest --> PaidActive: Admin approves (§4.6, §5)\natomic: deactivate old → create new → log
    PaidActive --> PaidExpired: end_date < now\nexpiry job (§7)
    PaidExpired --> Starter: Automatic fallback (§7, §12.2)\nsame transaction as expiry
    Starter --> PendingRequest: Vendor can upgrade again,\nany time (§12.2)
    PaidActive --> PendingRequest: Vendor submits another\nupgrade/downgrade request
```

**Key invariant carried through every state above**: at most one `vendor_subscriptions` row is `active` per vendor at any instant (§4.6 rule 1); a vendor is never in a state with zero active rows (§7 point 3).

---

## 6. Transaction Boundaries (§4.6)

The two places where multiple writes must succeed or fail together:

```mermaid
flowchart TD
    subgraph "Transaction A — Approval (§4.6, §5)"
        A1[Deactivate current active\nvendor_subscriptions row] --> A2[Insert new active\nvendor_subscriptions row]
        A2 --> A3[Update subscription_requests\nstatus=approved, verified_by, verified_at]
        A3 --> A4[Insert subscription_request_logs\naction=approved]
    end

    subgraph "Transaction B — Expiry + Fallback (§7)"
        B1[Mark paid vendor_subscriptions\nrow status=expired] --> B2[Insert new Starter\nvendor_subscriptions row\nend_date=null]
    end

    A1 -.rollback on any failure.-> A1
    B1 -.rollback on any failure.-> B1
```

**Rule, restated from §4.6 and §7**: order matters — deactivate/expire the old row strictly before creating the new one, and both writes commit or roll back as a single unit. Never a moment with two `active` rows, never a moment with zero.

A third, simpler transaction boundary is registration-time Starter assignment (§5.1) — a single insert, not a deactivate-then-create pair, since there is no prior row to deactivate.

---

## 7. Middleware Flow — `requireActiveSubscription` (§8)

```mermaid
flowchart TD
    Req[Incoming request to a gated route\ne.g. POST /listings] --> MW{requireActiveSubscription}
    MW --> Q1[Query vendor's active\nvendor_subscriptions row]
    Q1 --> Found{Active row found\nAND end_date is null\nOR end_date >= now?}
    Found -->|No| Block[403 SUBSCRIPTION_REQUIRED]
    Found -->|Yes| Feature{Optional feature/limit\ncheck requested?}
    Feature -->|No| Allow[Proceed to controller]
    Feature -->|Yes| Check{plan.features.X === true\nOR plan.limits.Y > 0 ?}
    Check -->|No| Block
    Check -->|Yes| Allow
```

Applied only to the vendor actions enumerated in §8 (create listing, publish/unpublish, accept booking, promote/feature listing, other `features`-gated actions). Never applied to any customer-facing route.

---

## 8. Scheduled Jobs (§7)

The only polling process in the system — everything else is event-triggered (registration, admin approval):

```mermaid
flowchart TD
    Cron[Scheduler: hourly or daily] --> ExpiryCheck[Expiry Check\nstatus=active AND end_date < now]
    ExpiryCheck --> Found{Any rows found?}
    Found -->|No| Idle[No-op]
    Found -->|Yes| PerVendor[For each: Transaction B\n(§6 above) — expire + Starter fallback]
    PerVendor --> Notify1[Notify: subscription expired]

    Cron --> PreExpiryCheck["Pre-expiry Check\n(separate query, §7 point 4)"]
    PreExpiryCheck --> Day7{end_date within 7 days?}
    Day7 -->|Yes, not yet notified| Notify7[Notify: expires in 7 days]
    PreExpiryCheck --> Day3{end_date within 3 days?}
    Day3 -->|Yes, not yet notified| Notify3[Notify: expires in 3 days]
```

Note per §7: the pre-expiry check is explicitly a **second**, separate scheduled check against `end_date` — not something detected only at the moment of expiry.

---

## 9. Notification Flow (§10)

```mermaid
flowchart LR
    subgraph Triggers
        T1[Admin approves request]
        T2[Admin rejects request]
        T3[Pre-expiry check: 7 days]
        T4[Pre-expiry check: 3 days]
        T5[Expiry job: expired]
    end

    T1 --> CN[createNotification]
    T2 --> CN
    T3 --> CN
    T4 --> CN
    T5 --> CN
    CN --> DB[(notifications table)]
    DB --> List[GET /notifications]
    DB --> Read[PATCH /notifications/:id/read]
```

Per §10: delivery is in-app only for v2 — `createNotification` exists today but is called by nothing; this document's five triggers are what finally wire it up. No email/SMS provider exists yet.

---

## 10. Future Compatibility — Where a Gateway Would Plug In (§11)

```mermaid
flowchart LR
    subgraph Today["Today (Manual, this document)"]
        M1[Vendor pays off-platform] --> M2[Vendor submits\nsubscription_request]
        M2 --> M3[Admin manually approves]
    end

    subgraph Future["v3 (Automated Gateway)"]
        F1[Gateway checkout/webhook] --> F2["Auto-creates + auto-approves\nequivalent request-record"]
    end

    M3 --> Shared[Transaction A — §6 above:\nactivation, atomicity, history,\nexpiry, middleware, notifications,\nadmin reporting]
    F2 --> Shared
```

Per §11: everything downstream of "a request is approved" already represents the final target architecture. Only the request *creation* step (manual submission vs. gateway webhook) changes in a future version.

---

## 11. Cross-References

- Every table referenced in these diagrams: [`04-database-schema.md`](./04-database-schema.md).
- Every endpoint referenced in these flows: [`02-api-specification.md`](./02-api-specification.md).
- Build order for the pieces shown here: [`03-development-roadmap.md`](./03-development-roadmap.md).
- Test coverage for each transaction boundary and flow: [`05-testing-strategy.md`](./05-testing-strategy.md).
