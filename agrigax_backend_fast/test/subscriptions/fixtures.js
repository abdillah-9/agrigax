// Shared fixture helpers for the subscription test suite. This suite is
// deliberately isolated from the app-wide harness (which is broken —
// src/services/auth.test.js, supertest/*.test.js — see
// docs/03-development-roadmap.md Phase 10) via its own npm script and its
// own directory, per docs/05-testing-strategy.md §9.
//
// Per docs/05-testing-strategy.md §1, service-layer tests need a real
// database. This project has no separate test-database configuration
// (src/configs/db.js always connects to the "development" knexfile entry),
// so these fixtures run against that same database, using clearly-prefixed,
// uniquely-suffixed rows and thorough afterEach/afterAll cleanup so nothing
// persists and nothing collides with real seed data (e.g. the one
// is_default_vendor_plan=true row every environment needs).

const db = require("../../src/configs/db");

const TEST_PREFIX = "subtest_";
let counter = 0;
const uniqueSuffix = () => `${Date.now()}_${counter++}`;

module.exports.db = db;

module.exports.createTestVendor = async () => {
  const suffix = uniqueSuffix();
  const [id] = await db("users").insert({
    username: `${TEST_PREFIX}vendor_${suffix}`,
    full_name: "Test Vendor",
    phone: `+2557${String(Math.floor(10000000 + Math.random() * 89999999))}`,
    email: null,
    password_hash: "test-hash",
    avatar: null,
    active_role: "provider",
    is_verified: true,
    is_suspended: false,
  });
  return id;
};

module.exports.createTestAdmin = async () => {
  const suffix = uniqueSuffix();
  const [id] = await db("users").insert({
    username: `${TEST_PREFIX}admin_${suffix}`,
    full_name: "Test Admin",
    phone: `+2557${String(Math.floor(10000000 + Math.random() * 89999999))}`,
    email: null,
    password_hash: "test-hash",
    avatar: null,
    active_role: "admin",
    is_verified: true,
    is_suspended: false,
  });
  return id;
};

module.exports.createTestPlan = async (overrides = {}) => {
  const { features, limits, ...rest } = overrides;

  const [id] = await db("subscription_plans").insert({
    name: `${TEST_PREFIX}plan_${uniqueSuffix()}`,
    description: "Test plan",
    price: 1000,
    currency: "TZS",
    duration_days: 30,
    features: JSON.stringify(features ?? { analytics: true }),
    limits: JSON.stringify(limits ?? { maxListings: 10, maxFeaturedListings: 2 }),
    is_default_vendor_plan: false,
    is_active: true,
    ...rest,
  });

  return db("subscription_plans").where({ id }).first();
};

module.exports.createTestPaymentMethod = async () => {
  const [id] = await db("payment_methods").insert({
    name: `${TEST_PREFIX}method_${uniqueSuffix()}`,
    type: "mobile_money",
    phone_number: "0700000000",
    display_order: 999,
    is_active: true,
  });

  return id;
};

module.exports.getDefaultPlan = async () => {
  return db("subscription_plans").where({ is_default_vendor_plan: true }).first();
};

module.exports.cleanupVendor = async (vendorId) => {
  if (!vendorId) return;

  const requestIds = await db("subscription_requests").select("id").where({ vendor_id: vendorId });
  const ids = requestIds.map((r) => r.id);

  if (ids.length) {
    await db("subscription_request_logs").whereIn("request_id", ids).del();
  }

  // vendor_subscriptions.created_from_request_id references
  // subscription_requests.id with no ON DELETE clause (§4.4) — the
  // referencing row must go first or the FK constraint rejects the delete.
  await db("vendor_subscriptions").where({ vendor_id: vendorId }).del();
  await db("subscription_requests").where({ vendor_id: vendorId }).del();
  await db("notifications").where({ user_id: vendorId }).del();
  await db("auth_otps").where({ user_id: vendorId }).del();
  await db("user_sessions").where({ user_id: vendorId }).del();
  await db("users").where({ id: vendorId }).del();
};

module.exports.cleanupPlan = async (planId) => {
  if (!planId) return;
  await db("subscription_plans").where({ id: planId }).del();
};

module.exports.cleanupPaymentMethod = async (id) => {
  if (!id) return;
  await db("payment_methods").where({ id }).del();
};
