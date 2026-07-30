// Per docs/05-testing-strategy.md §5, middleware tests should not require a
// real database — the gating decision is tested in isolation by stubbing the
// repository functions with vi.spyOn on the shared CJS exports objects (the
// middleware calls them as vendorSubscriptionsRepo.findActiveByVendor /
// subscriptionPlansRepo.getPlanById, so spies on those objects take effect).
import { describe, test, expect, vi, beforeEach, afterAll } from "vitest";

const vendorSubscriptionsRepo = require("../../../src/repositories/vendorSubscriptions");
const subscriptionPlansRepo = require("../../../src/repositories/subscriptionPlans");
const { requireActiveSubscription } = require("../../../src/middlewares/requireActiveSubscription");

let findActiveByVendor;
let getPlanById;

const runMiddleware = (req, requiredCheck) =>
  new Promise((resolve) => {
    const next = (err) => resolve(err);
    requireActiveSubscription(requiredCheck)(req, {}, next);
  });

beforeEach(() => {
  vi.restoreAllMocks();
  findActiveByVendor = vi
    .spyOn(vendorSubscriptionsRepo, "findActiveByVendor")
    .mockResolvedValue(undefined);
  getPlanById = vi.spyOn(subscriptionPlansRepo, "getPlanById").mockResolvedValue(undefined);
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe("requireActiveSubscription (Phase 6 — §8)", () => {
  test("401s when there is no authenticated user", async () => {
    const err = await runMiddleware({ user: null });
    expect(err).toMatchObject({ statusCode: 401 });
  });

  test("403s (SUBSCRIPTION_REQUIRED) when the vendor has no active subscription", async () => {
    findActiveByVendor.mockResolvedValue(undefined);

    const err = await runMiddleware({ user: { id: 1 } });
    expect(err).toMatchObject({ statusCode: 403, errors: { code: "SUBSCRIPTION_REQUIRED" } });
  });

  test("403s when the active row's end_date has already passed", async () => {
    findActiveByVendor.mockResolvedValue({
      plan_id: 1,
      end_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    });

    const err = await runMiddleware({ user: { id: 1 } });
    expect(err).toMatchObject({ statusCode: 403 });
  });

  test("passes for a permanent subscription (end_date=null)", async () => {
    findActiveByVendor.mockResolvedValue({ plan_id: 1, end_date: null });

    const req = { user: { id: 1 } };
    const err = await runMiddleware(req);
    expect(err).toBeUndefined();
    expect(req.subscription).toBeDefined();
  });

  test("passes for an active row whose end_date is still in the future", async () => {
    findActiveByVendor.mockResolvedValue({
      plan_id: 1,
      end_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    const err = await runMiddleware({ user: { id: 1 } });
    expect(err).toBeUndefined();
  });

  describe("feature/limit checks", () => {
    test("passes a features.<key> check when the flag is true", async () => {
      findActiveByVendor.mockResolvedValue({ plan_id: 1, end_date: null });
      getPlanById.mockResolvedValue({ features: { analytics: true }, limits: {} });

      const err = await runMiddleware({ user: { id: 1 } }, "features.analytics");
      expect(err).toBeUndefined();
    });

    test("blocks a features.<key> check when the flag is false", async () => {
      findActiveByVendor.mockResolvedValue({ plan_id: 1, end_date: null });
      getPlanById.mockResolvedValue({ features: { analytics: false }, limits: {} });

      const err = await runMiddleware({ user: { id: 1 } }, "features.analytics");
      expect(err).toMatchObject({ statusCode: 403 });
    });

    test("passes a limits.<key> check when the value is greater than zero", async () => {
      findActiveByVendor.mockResolvedValue({ plan_id: 1, end_date: null });
      getPlanById.mockResolvedValue({ features: {}, limits: { maxFeaturedListings: 5 } });

      const err = await runMiddleware({ user: { id: 1 } }, "limits.maxFeaturedListings");
      expect(err).toBeUndefined();
    });

    test("blocks a limits.<key> check when the value is zero", async () => {
      findActiveByVendor.mockResolvedValue({ plan_id: 1, end_date: null });
      getPlanById.mockResolvedValue({ features: {}, limits: { maxFeaturedListings: 0 } });

      const err = await runMiddleware({ user: { id: 1 } }, "limits.maxFeaturedListings");
      expect(err).toMatchObject({ statusCode: 403 });
    });

    test("blocks when the requested key is missing from the plan entirely", async () => {
      findActiveByVendor.mockResolvedValue({ plan_id: 1, end_date: null });
      getPlanById.mockResolvedValue({ features: {}, limits: {} });

      const err = await runMiddleware({ user: { id: 1 } }, "limits.maxFeaturedListings");
      expect(err).toMatchObject({ statusCode: 403 });
    });
  });
});
