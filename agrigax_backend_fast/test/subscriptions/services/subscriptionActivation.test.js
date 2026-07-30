import { describe, test, expect, afterEach } from "vitest";
const {
  db,
  createTestVendor,
  createTestAdmin,
  createTestPlan,
  createTestPaymentMethod,
  getDefaultPlan,
  cleanupVendor,
  cleanupPlan,
  cleanupPaymentMethod,
} = require("../fixtures");
const { assignDefaultPlan, approveRequest, rejectRequest } = require("../../../src/services/subscriptionActivation");
const { findActiveByVendor } = require("../../../src/repositories/vendorSubscriptions");
const { getLogsByRequest } = require("../../../src/repositories/subscriptionRequestLogs");

let vendorId;
let adminId;
let planId;
let paymentMethodId;
let requestId;

afterEach(async () => {
  await cleanupVendor(vendorId);
  await cleanupVendor(adminId);
  await cleanupPlan(planId);
  await cleanupPaymentMethod(paymentMethodId);
  vendorId = adminId = planId = paymentMethodId = requestId = undefined;
});

describe("subscriptionActivation.assignDefaultPlan (Phase 2 — Starter auto-assignment)", () => {
  test("creates exactly one active vendor_subscriptions row with end_date=null, referencing the default plan", async () => {
    vendorId = await createTestVendor();
    const defaultPlan = await getDefaultPlan();
    expect(defaultPlan, "an is_default_vendor_plan=true row must exist for this suite to run").toBeDefined();

    await db.transaction((trx) => assignDefaultPlan(trx, vendorId));

    const rows = await db("vendor_subscriptions").where({ vendor_id: vendorId });
    expect(rows).toHaveLength(1);
    expect(rows[0].status).toBe("active");
    expect(rows[0].end_date).toBeNull();
    expect(Number(rows[0].plan_id)).toBe(defaultPlan.id);
    expect(rows[0].created_from_request_id).toBeNull();
  });
});

describe("subscriptionActivation.approveRequest (Phase 5 — §4.6 atomic activation)", () => {
  test("deactivates the old row, creates a new active one, marks the request approved, and writes exactly one log row", async () => {
    vendorId = await createTestVendor();
    adminId = await createTestAdmin();
    const plan = await createTestPlan({ duration_days: 30 });
    planId = plan.id;
    paymentMethodId = await createTestPaymentMethod();

    // Vendor starts on Starter (mirrors real registration behaviour).
    await db.transaction((trx) => assignDefaultPlan(trx, vendorId));
    const starterRow = await findActiveByVendor(vendorId);

    const [reqId] = await db("subscription_requests").insert({
      vendor_id: vendorId,
      plan_id: plan.id,
      payment_method: paymentMethodId,
      amount: plan.price,
      transaction_reference: "TEST-REF-1",
      status: "pending",
    });
    requestId = reqId;

    const { request, subscription } = await approveRequest(adminId, requestId);

    expect(request.status).toBe("approved");
    expect(Number(request.verified_by)).toBe(adminId);
    expect(request.verified_at).toBeTruthy();

    expect(subscription.status).toBe("active");
    expect(Number(subscription.plan_id)).toBe(plan.id);
    expect(Number(subscription.created_from_request_id)).toBe(requestId);
    expect(subscription.end_date).toBeTruthy();

    // §4.6 rule 1: never more than one active row per vendor.
    const activeRows = await db("vendor_subscriptions").where({ vendor_id: vendorId, status: "active" });
    expect(activeRows).toHaveLength(1);
    expect(activeRows[0].id).toBe(subscription.id);

    // The old Starter row was deactivated, not deleted (BR-024 immutability).
    const oldRow = await db("vendor_subscriptions").where({ id: starterRow.id }).first();
    expect(oldRow.status).toBe("cancelled");

    // Exactly one audit log row for this approval (§4.5).
    const logs = await getLogsByRequest(requestId);
    expect(logs).toHaveLength(1);
    expect(logs[0].action).toBe("approved");
    expect(Number(logs[0].admin_id)).toBe(adminId);

    const notifications = await db("notifications").where({ user_id: vendorId, title: "Subscription approved" });
    expect(notifications).toHaveLength(1);
  });

  test("rejects approving a request that is not pending (409)", async () => {
    vendorId = await createTestVendor();
    adminId = await createTestAdmin();
    const plan = await createTestPlan();
    planId = plan.id;
    paymentMethodId = await createTestPaymentMethod();

    await db.transaction((trx) => assignDefaultPlan(trx, vendorId));

    const [reqId] = await db("subscription_requests").insert({
      vendor_id: vendorId,
      plan_id: plan.id,
      payment_method: paymentMethodId,
      amount: plan.price,
      transaction_reference: "TEST-REF-2",
      status: "approved", // already actioned
    });
    requestId = reqId;

    await expect(approveRequest(adminId, requestId)).rejects.toMatchObject({ statusCode: 409 });
  });

  test("404s for a non-existent request", async () => {
    adminId = await createTestAdmin();
    await expect(approveRequest(adminId, 999999999)).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("subscriptionActivation.rejectRequest (Phase 5 — reject path)", () => {
  test("marks the request rejected, logs the reason, and never touches vendor_subscriptions", async () => {
    vendorId = await createTestVendor();
    adminId = await createTestAdmin();
    const plan = await createTestPlan();
    planId = plan.id;
    paymentMethodId = await createTestPaymentMethod();

    await db.transaction((trx) => assignDefaultPlan(trx, vendorId));
    const starterRow = await findActiveByVendor(vendorId);

    const [reqId] = await db("subscription_requests").insert({
      vendor_id: vendorId,
      plan_id: plan.id,
      payment_method: paymentMethodId,
      amount: plan.price,
      transaction_reference: "TEST-REF-3",
      status: "pending",
    });
    requestId = reqId;

    const rejected = await rejectRequest(adminId, requestId, "reference does not match statement");

    expect(rejected.status).toBe("rejected");

    const logs = await getLogsByRequest(requestId);
    expect(logs).toHaveLength(1);
    expect(logs[0].action).toBe("rejected");
    expect(logs[0].comment).toBe("reference does not match statement");

    // Vendor's active subscription is completely untouched by a rejection.
    const activeRow = await findActiveByVendor(vendorId);
    expect(activeRow.id).toBe(starterRow.id);
    expect(activeRow.status).toBe("active");

    const notifications = await db("notifications").where({
      user_id: vendorId,
      title: "Subscription request rejected",
    });
    expect(notifications).toHaveLength(1);
  });
});
