import { describe, test, expect, afterEach } from "vitest";
const {
  db,
  createTestVendor,
  createTestPlan,
  getDefaultPlan,
  cleanupVendor,
  cleanupPlan,
} = require("../fixtures");
const { runExpiryJob, runPreExpiryCheck } = require("../../../src/services/subscriptionExpiry");

let vendorId;
let planId;

afterEach(async () => {
  await cleanupVendor(vendorId);
  await cleanupPlan(planId);
  vendorId = planId = undefined;
});

describe("subscriptionExpiry.runExpiryJob (Phase 7 — §7, §12.1, §12.2)", () => {
  test("expires a past-due paid row and atomically creates a permanent Starter fallback row", async () => {
    vendorId = await createTestVendor();
    const plan = await createTestPlan();
    planId = plan.id;
    const defaultPlan = await getDefaultPlan();
    expect(defaultPlan, "an is_default_vendor_plan=true row must exist for this suite to run").toBeDefined();

    const [paidRowId] = await db("vendor_subscriptions").insert({
      vendor_id: vendorId,
      plan_id: plan.id,
      status: "active",
      start_date: db.raw("DATE_SUB(NOW(), INTERVAL 40 DAY)"),
      end_date: db.raw("DATE_SUB(NOW(), INTERVAL 10 DAY)"), // already past due
    });

    const result = await runExpiryJob();
    expect(result.failed).toBe(0);

    const expiredRow = await db("vendor_subscriptions").where({ id: paidRowId }).first();
    expect(expiredRow.status).toBe("expired");

    const activeRows = await db("vendor_subscriptions").where({ vendor_id: vendorId, status: "active" });
    expect(activeRows).toHaveLength(1);
    expect(Number(activeRows[0].plan_id)).toBe(defaultPlan.id);
    expect(activeRows[0].end_date).toBeNull();
    expect(activeRows[0].created_from_request_id).toBeNull();

    const notifications = await db("notifications").where({ user_id: vendorId, title: "Subscription expired" });
    expect(notifications).toHaveLength(1);
  });

  test("never selects a permanent (end_date=null) row for expiry", async () => {
    vendorId = await createTestVendor();
    const defaultPlan = await getDefaultPlan();

    await db("vendor_subscriptions").insert({
      vendor_id: vendorId,
      plan_id: defaultPlan.id,
      status: "active",
      start_date: db.fn.now(),
      end_date: null,
    });

    await runExpiryJob();

    const row = await db("vendor_subscriptions").where({ vendor_id: vendorId }).first();
    expect(row.status).toBe("active");
    expect(row.end_date).toBeNull();
  });

  test("is idempotent — a second run does not reprocess an already-expired row", async () => {
    vendorId = await createTestVendor();
    const plan = await createTestPlan();
    planId = plan.id;

    await db("vendor_subscriptions").insert({
      vendor_id: vendorId,
      plan_id: plan.id,
      status: "active",
      start_date: db.raw("DATE_SUB(NOW(), INTERVAL 40 DAY)"),
      end_date: db.raw("DATE_SUB(NOW(), INTERVAL 10 DAY)"),
    });

    await runExpiryJob();
    const afterFirstRun = await db("vendor_subscriptions").where({ vendor_id: vendorId });
    expect(afterFirstRun).toHaveLength(2); // expired paid row + new Starter row

    await runExpiryJob();
    const afterSecondRun = await db("vendor_subscriptions").where({ vendor_id: vendorId });
    expect(afterSecondRun).toHaveLength(2); // unchanged — no duplicate fallback row
  });
});

describe("subscriptionExpiry.runPreExpiryCheck (Phase 7 — §7 point 4, §10)", () => {
  test("notifies a vendor whose subscription expires in exactly 7 days, once", async () => {
    vendorId = await createTestVendor();
    const plan = await createTestPlan();
    planId = plan.id;

    await db("vendor_subscriptions").insert({
      vendor_id: vendorId,
      plan_id: plan.id,
      status: "active",
      start_date: db.fn.now(),
      end_date: db.raw("DATE_ADD(NOW(), INTERVAL 7 DAY)"),
    });

    await runPreExpiryCheck();

    const notifications = await db("notifications").where({
      user_id: vendorId,
      title: "Subscription expires in 7 days",
    });
    expect(notifications).toHaveLength(1);

    // Running it again the same day must not duplicate the warning.
    await runPreExpiryCheck();
    const afterSecondRun = await db("notifications").where({
      user_id: vendorId,
      title: "Subscription expires in 7 days",
    });
    expect(afterSecondRun).toHaveLength(1);
  });

  test("does not notify a subscription that is not at a 7-day or 3-day boundary", async () => {
    vendorId = await createTestVendor();
    const plan = await createTestPlan();
    planId = plan.id;

    await db("vendor_subscriptions").insert({
      vendor_id: vendorId,
      plan_id: plan.id,
      status: "active",
      start_date: db.fn.now(),
      end_date: db.raw("DATE_ADD(NOW(), INTERVAL 20 DAY)"),
    });

    await runPreExpiryCheck();

    const notifications = await db("notifications").where({ user_id: vendorId });
    expect(notifications).toHaveLength(0);
  });
});
