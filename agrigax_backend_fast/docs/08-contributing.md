# Agrigax Backend — Contributing Guide

**Authoritative source for business rules**: [`docs/01-subscription-requirements-v2.md`](./01-subscription-requirements-v2.md). This document covers process and convention only — how to structure, name, branch, commit, and review code that implements that specification. It does not define or alter any business rule.

---

## 1. Folder Structure

The project uses a flat, layer-first structure — one file per module per layer, not per-module subfolders. New subscription modules must follow the same pattern as every existing module (`auth`, `listings`, `bookings`, etc.):

```
src/
  configs/          # cross-cutting config: db.js, cors.js, accessPolicy.js
  controllers/      # one file per module, e.g. subscriptionPlans.js
  services/         # one file per module — business rules live here (§4.6, §5, §7)
  repositories/      # one file per module — Knex queries only, no business logic
  routes/           # one file per module — binds HTTP method+path to a controller
  validations/      # one file per module — Joi schemas
  middlewares/      # cross-cutting middleware, e.g. requireActiveSubscription.js
  errors/           # AppError.js and any typed error subclasses
  utils/            # shared helpers: pagination.js, formatters.js, response.js
  jobs/             # new for this system — the scheduled expiry job (§7) has no
                     # existing analogue; create this directory in Phase 1
migrations/         # timestamp_description.js, e.g. 20260801000000_subscription_plans.js
docs/               # this documentation set
```

**New files for the subscription domain** should be named to match the table/resource, mirroring the existing convention (`payments.js`, `wallets.js`, etc.):

| Layer | Files to add |
|---|---|
| `routes/` | `subscriptionPlans.js`, `paymentMethods.js`, `subscriptionRequests.js`, `vendorSubscriptions.js` (or fold into fewer files if the resource is small — match existing project judgment, e.g. `admin.js` already aggregates several concerns) |
| `controllers/` | mirrors `routes/` |
| `services/` | mirrors `routes/`, plus a dedicated file for the activation transaction (§4.6) since it's shared by both registration (§5.1) and approval (§9) |
| `repositories/` | `subscriptionPlans.js`, `paymentMethods.js`, `subscriptionRequests.js`, `vendorSubscriptions.js`, `subscriptionRequestLogs.js` |
| `validations/` | mirrors `routes/` |
| `middlewares/` | `requireActiveSubscription.js` |
| `jobs/` | `expireSubscriptions.js` (or similar) — the expiry + pre-expiry checks from §7 |

Retiring `payments`/`wallet` (§2) means deleting their files from every layer above, not just their routes.

---

## 2. Coding Standards

- Follow the existing layered flow strictly: `routes → controllers → services → repositories`. Controllers never query the database directly; services never format HTTP responses; repositories never contain business rules (see [`07-architecture-overview.md §2`](./07-architecture-overview.md#2-layered-architecture)).
- Validation lives in `validations/` (Joi), invoked via the existing `validate` middleware — do not hand-roll validation inside controllers.
- Async route handlers are wrapped with the existing `asyncHandler` middleware, matching every current module.
- Errors are thrown as `AppError` (or a subclass) and handled by the existing `errorHandler` middleware — do not `res.status().json()` an error directly from a controller.
- Transactions (§4.6, §7) are opened and committed/rolled back entirely within the **service** layer — a repository method should never open its own transaction that a service can't participate in.
- No business rule (plan limits, activation atomicity, expiry fallback) is ever implemented in a controller or repository — see [`09-business-rules.md`](./09-business-rules.md) for the full rule set and confirm placement against [`07-architecture-overview.md §2`](./07-architecture-overview.md#2-layered-architecture).

---

## 3. Naming Conventions

| Item | Convention | Example |
|---|---|---|
| Source files | `camelCase.js`, one per module, matching across all layers | `subscriptionRequests.js` in `routes/`, `controllers/`, `services/`, `repositories/`, `validations/` |
| Migration files | `<timestamp>_<snake_case_description>.js`, matching existing migrations | `20260801000000_subscription_plans.js` |
| Database tables/columns | `snake_case`, matching §4 of the requirements doc exactly (`vendor_subscriptions`, `is_default_vendor_plan`) | — |
| API JSON fields | `camelCase` in request/response bodies (per [`02-api-specification.md §1`](./02-api-specification.md#1-conventions)), translated to/from `snake_case` DB columns at the repository/service boundary | `isDefaultVendorPlan` in JSON ↔ `is_default_vendor_plan` in DB |
| Test files | `<module>.test.js`, colocated with the file under test, matching the existing `auth.test.js` pattern | `subscriptionRequests.test.js` next to `subscriptionRequests.js` |
| Business rule references in code comments/PRs | Cite the stable ID from [`09-business-rules.md`](./09-business-rules.md), e.g. `// BR-030` | — |

---

## 4. Git Workflow

- `main` is always deployable. All work happens on a branch off `main`, merged via pull request — no direct commits to `main`.
- Keep branches scoped to one roadmap phase or one bounded piece of it (see [`03-development-roadmap.md`](./03-development-roadmap.md)) — a branch implementing Phase 5's approval workflow shouldn't also carry unrelated Phase 9 reporting changes.
- Rebase on `main` before opening a PR if the branch has drifted; avoid merge commits from `main` into a feature branch when a rebase is clean.

### Branch Naming

`<type>/<short-description>`, where `type` is one of:

| Type | Use for |
|---|---|
| `feat` | New functionality (e.g. `feat/subscription-approval-workflow`) |
| `fix` | Bug fix |
| `chore` | Tooling, config, non-functional cleanup |
| `docs` | Documentation-only changes (e.g. `docs/api-specification`) |
| `test` | Test-only additions/fixes |
| `refactor` | No behavior change |

### Commit Message Convention

Conventional Commits style: `<type>(<scope>): <summary>`

```
feat(subscriptions): add atomic approval transaction

Implements the deactivate-old/create-new/log sequence from
requirements §4.6 and §5, per BR-031/BR-032.
```

- `type` matches the branch-type table above.
- `scope` is the module name (`subscriptions`, `auth`, `notifications`, etc.).
- Body explains *why*, with a `§`/`BR-###` citation back to the requirements doc or business-rules catalog when the commit implements a specific rule — this makes `git blame` self-documenting against the source of truth.

---

## 5. Pull Request Checklist

- [ ] PR description states which roadmap phase ([`03-development-roadmap.md`](./03-development-roadmap.md)) and/or which `BR-###` rules ([`09-business-rules.md`](./09-business-rules.md)) this PR implements.
- [ ] No business rule was invented or altered beyond what the requirements doc specifies — if a decision was needed that the requirements doc leaves open (§12), the PR description says so explicitly rather than silently picking an answer.
- [ ] New endpoints match their contract in [`02-api-specification.md`](./02-api-specification.md) (path, method, request/response shape, status codes).
- [ ] New/changed tables match [`04-database-schema.md`](./04-database-schema.md) exactly (columns, types, nullability, FKs).
- [ ] Tests added per [`05-testing-strategy.md`](./05-testing-strategy.md) for the layer(s) touched — at minimum, service-layer tests for any new business rule.
- [ ] Any transaction touching `vendor_subscriptions` preserves the "at most one active row per vendor, never zero" invariant (BR-030, BR-033) — covered by a test, not just manual verification.
- [ ] No secrets, credentials, or real vendor payment data in the diff.
- [ ] Migrations are additive/backward-compatible unless explicitly flagged and approved as a breaking change (see [`06-deployment-guide.md §5`](./06-deployment-guide.md#5-database-migration-strategy)).

---

## 6. Code Review Checklist

For the reviewer, not just the author:

- [ ] Does the change belong in the layer it's in? (No business logic in a controller or repository — §2 above.)
- [ ] For anything touching `vendor_subscriptions` or `subscription_requests`: is the write inside a transaction, and does the transaction follow the deactivate/expire-before-create ordering required by BR-032/BR-039?
- [ ] For anything touching `subscription_plans.is_default_vendor_plan`: does it preserve the "exactly one default plan" invariant (BR-010)?
- [ ] Does every new admin endpoint enforce admin-role authorization, and every vendor-scoped endpoint enforce ownership? (See [`06-deployment-guide.md §10`](./06-deployment-guide.md#10-security-checklist).)
- [ ] Is any part of this change resolving, or silently assuming an answer to, one of the open decisions in §12 of the requirements doc? If so, was that flagged and confirmed with whoever owns the requirements doc, rather than decided unilaterally in code?
- [ ] Do new/changed tests actually exercise the negative and edge cases listed for the relevant module in [`05-testing-strategy.md`](./05-testing-strategy.md), not just the happy path?

---

## 7. Migration Guidelines

- One logical schema change per migration file — don't combine, e.g., creating `subscription_plans` and `payment_methods` in one file, even though they're both Phase 1 work (see [`04-database-schema.md §7`](./04-database-schema.md#7-migration-order) for the required order).
- Every migration must have a working `down` (reversal) for use in development/staging. Production reversal of a migration touching subscription data is a last resort per [`06-deployment-guide.md §7`](./06-deployment-guide.md#7-rollback-strategy), not a routine operation — but the code must still support it for lower environments.
- Column types, nullability, and defaults must match [`04-database-schema.md`](./04-database-schema.md) exactly — that document is the migration's specification, not a suggestion.
- New foreign keys must match the dependency order in [`04-database-schema.md §7`](./04-database-schema.md#7-migration-order); a migration must never reference a table that hasn't been created by an earlier migration.
- Retiring `payments`/`wallet` tables (§2 of the requirements doc) is its own migration, separate from adding the five new subscription tables, so the two changes can be reasoned about and rolled back independently (see [`06-deployment-guide.md §5`](./06-deployment-guide.md#5-database-migration-strategy)).

---

## 8. Seeder Guidelines

- Follow the seeding order in [`04-database-schema.md §8`](./04-database-schema.md#8-seeding-order): plans before payment methods before users before requests/history.
- A production seeder may only ever create the single mandatory `is_default_vendor_plan = true` bootstrap row — never paid plans, never real payment methods, never demo vendors/requests. See [`06-deployment-guide.md §6`](./06-deployment-guide.md#6-seeder-strategy).
- Development/staging seeders may create richer fixture data (multiple plans, multiple payment methods, sample approved/rejected requests) but must never produce a second `is_default_vendor_plan = true` row — this violates BR-010 and will break registration in ways that are confusing to debug.
- Seeders that create vendor users should rely on the real registration path (or the same service call it uses) so the Starter auto-assignment side effect (§5.1) runs exactly as it would in production, rather than hand-inserting a `vendor_subscriptions` row and risking it drifting out of sync with the real logic.

---

## 9. Cross-References

- What each contribution should implement: [`03-development-roadmap.md`](./03-development-roadmap.md).
- The rules every change must respect: [`09-business-rules.md`](./09-business-rules.md).
- The contracts every change must match: [`02-api-specification.md`](./02-api-specification.md), [`04-database-schema.md`](./04-database-schema.md).
- How to verify a change is correct before merging: [`05-testing-strategy.md`](./05-testing-strategy.md).
