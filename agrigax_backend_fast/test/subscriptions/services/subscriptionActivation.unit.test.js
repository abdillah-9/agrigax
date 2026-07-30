// Isolated, DB-free test for the one branch that would be unsafe to exercise
// against the real database: flipping is_default_vendor_plan off would race
// with every other DB-backed test file in this suite that relies on it
// existing. Stubbing findDefaultPlan with vi.spyOn on the shared CJS exports
// object keeps this scenario fully isolated (the service calls it as
// subscriptionPlansRepo.findDefaultPlan, so the spy takes effect).
import { describe, test, expect, vi, afterAll } from "vitest";

const subscriptionPlansRepo = require("../../../src/repositories/subscriptionPlans");
const { assignDefaultPlan } = require("../../../src/services/subscriptionActivation");

afterAll(() => {
  vi.restoreAllMocks();
});

describe("subscriptionActivation.assignDefaultPlan — misconfiguration (Phase 2)", () => {
  test("fails loudly (500) when no plan is flagged is_default_vendor_plan, rather than silently skipping", async () => {
    vi.spyOn(subscriptionPlansRepo, "findDefaultPlan").mockResolvedValue(undefined);

    const fakeTrx = Object.assign(() => {}, { fn: { now: () => "NOW()" } });

    await expect(assignDefaultPlan(fakeTrx, 1)).rejects.toMatchObject({ statusCode: 500 });
  });
});
