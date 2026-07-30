import { describe, test, expect, afterEach } from "vitest";
const {
  db,
  createTestVendor,
  createTestPlan,
  createTestPaymentMethod,
  cleanupVendor,
  cleanupPlan,
  cleanupPaymentMethod,
} = require("../fixtures");
const {
  submitRequest,
  listMyRequests,
  getMyRequest,
} = require("../../../src/services/subscriptionRequests");

let vendorId;
let otherVendorId;
let planId;
let paymentMethodId;

afterEach(async () => {
  await cleanupVendor(vendorId);
  await cleanupVendor(otherVendorId);
  await cleanupPlan(planId);
  await cleanupPaymentMethod(paymentMethodId);
  vendorId = otherVendorId = planId = paymentMethodId = undefined;
});

describe("subscriptionRequests.submitRequest (Phase 4 — §6 step 4)", () => {
  test("creates a pending request and never touches vendor_subscriptions", async () => {
    vendorId = await createTestVendor();
    const plan = await createTestPlan();
    planId = plan.id;
    paymentMethodId = await createTestPaymentMethod();

    const request = await submitRequest(vendorId, {
      plan_id: plan.id,
      payment_method: paymentMethodId,
      amount: plan.price,
      transaction_reference: "TEST-SUBMIT-1",
    });

    expect(request.status).toBe("pending");
    expect(Number(request.vendor_id)).toBe(vendorId);

    const subs = await db("vendor_subscriptions").where({ vendor_id: vendorId });
    expect(subs).toHaveLength(0);
  });

  test("accepts camelCase field names identically to snake_case", async () => {
    vendorId = await createTestVendor();
    const plan = await createTestPlan();
    planId = plan.id;
    paymentMethodId = await createTestPaymentMethod();

    const request = await submitRequest(vendorId, {
      planId: plan.id,
      paymentMethodId,
      amount: plan.price,
      transactionReference: "TEST-SUBMIT-2",
    });

    expect(Number(request.plan_id)).toBe(plan.id);
    expect(Number(request.payment_method)).toBe(paymentMethodId);
  });

  test("rejects a request against an inactive plan (404)", async () => {
    vendorId = await createTestVendor();
    const plan = await createTestPlan({ is_active: false });
    planId = plan.id;
    paymentMethodId = await createTestPaymentMethod();

    await expect(
      submitRequest(vendorId, {
        plan_id: plan.id,
        payment_method: paymentMethodId,
        amount: plan.price,
        transaction_reference: "TEST-SUBMIT-3",
      })
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  test("rejects a request against a non-existent payment method (404)", async () => {
    vendorId = await createTestVendor();
    const plan = await createTestPlan();
    planId = plan.id;

    await expect(
      submitRequest(vendorId, {
        plan_id: plan.id,
        payment_method: 999999999,
        amount: plan.price,
        transaction_reference: "TEST-SUBMIT-4",
      })
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("subscriptionRequests ownership scoping (Phase 4 — §6 step 5)", () => {
  test("a vendor can only list and view their own requests", async () => {
    vendorId = await createTestVendor();
    otherVendorId = await createTestVendor();
    const plan = await createTestPlan();
    planId = plan.id;
    paymentMethodId = await createTestPaymentMethod();

    const request = await submitRequest(vendorId, {
      plan_id: plan.id,
      payment_method: paymentMethodId,
      amount: plan.price,
      transaction_reference: "TEST-SCOPE-1",
    });

    const { rows } = await listMyRequests(vendorId, { offset: 0, limit: 20 });
    expect(rows.map((r) => r.id)).toContain(request.id);

    const { rows: otherRows } = await listMyRequests(otherVendorId, { offset: 0, limit: 20 });
    expect(otherRows.map((r) => r.id)).not.toContain(request.id);

    await expect(getMyRequest(otherVendorId, request.id)).rejects.toMatchObject({ statusCode: 403 });
    await expect(getMyRequest(vendorId, 999999999)).rejects.toMatchObject({ statusCode: 404 });

    const own = await getMyRequest(vendorId, request.id);
    expect(own.id).toBe(request.id);
  });
});
