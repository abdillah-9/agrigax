// Dev/test subscription catalog so the upgrade flow is testable out of the
// box: one paid plan ("Business") and two payment methods (M-Pesa, bank
// transfer). In production these are admin-created via the API
// (docs/06-deployment-guide.md §6) — this migration is idempotent and only
// fills gaps, it never overwrites admin-managed rows.
const BUSINESS_PLAN = {
  name: "Business",
  description: "Paid plan with more listings, featured placement, and analytics.",
  price: 25000,
  currency: "TZS",
  duration_days: 30,
  features: JSON.stringify({ analytics: true, prioritySupport: false, verifiedBadge: true }),
  limits: JSON.stringify({ maxListings: 20, maxFeaturedListings: 5, maxImagesPerListing: 15 }),
  is_default_vendor_plan: false,
  is_active: true,
};

const PAYMENT_METHODS = [
  {
    name: "M-Pesa",
    type: "mobile_money",
    account_name: null,
    account_number: null,
    phone_number: "+255700000200",
    instructions: "Send to this number and use your username as the reference.",
    display_order: 0,
    is_active: true,
  },
  {
    name: "CRDB Bank Transfer",
    type: "bank_account",
    account_name: "Agrigax Ltd",
    account_number: "0150-1234567-00",
    phone_number: null,
    instructions: "Use your username as the transfer reference.",
    display_order: 1,
    is_active: true,
  },
];

exports.up = async function (knex) {
  const existingPlan = await knex("subscription_plans").where({ name: BUSINESS_PLAN.name }).first();

  if (!existingPlan) {
    await knex("subscription_plans").insert(BUSINESS_PLAN);
  }

  for (const method of PAYMENT_METHODS) {
    const existing = await knex("payment_methods").where({ name: method.name }).first();

    if (!existing) {
      await knex("payment_methods").insert(method);
    }
  }
};

exports.down = async function (knex) {
  const referenced = await knex("subscription_requests")
    .join("subscription_plans", "subscription_requests.plan_id", "subscription_plans.id")
    .where("subscription_plans.name", BUSINESS_PLAN.name)
    .first();

  // Only remove the seeded plan if nothing references it (mirrors the
  // delete-only-if-unreferenced rule in requirements §9).
  if (!referenced) {
    const activeSubs = await knex("vendor_subscriptions")
      .join("subscription_plans", "vendor_subscriptions.plan_id", "subscription_plans.id")
      .where("subscription_plans.name", BUSINESS_PLAN.name)
      .first();

    if (!activeSubs) {
      await knex("subscription_plans").where({ name: BUSINESS_PLAN.name }).del();
    }
  }

  for (const method of PAYMENT_METHODS) {
    const used = await knex("subscription_requests")
      .join("payment_methods", "subscription_requests.payment_method", "payment_methods.id")
      .where("payment_methods.name", method.name)
      .first();

    if (!used) {
      await knex("payment_methods").where({ name: method.name }).del();
    }
  }
};
