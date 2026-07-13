// Bootstraps the one mandatory row every environment needs before any vendor
// can register: a plan flagged is_default_vendor_plan=true (requirements §5.1,
// docs/06-deployment-guide.md §6 — this is the only subscription_plans row a
// production seeder should ever create; paid plans are admin-created via the API).
const STARTER_PLAN = {
  name: "Starter",
  description: "Free plan every vendor starts on at registration.",
  price: 0,
  currency: "TZS",
  duration_days: 30,
  features: JSON.stringify({ analytics: false, prioritySupport: false, verifiedBadge: false }),
  limits: JSON.stringify({ maxListings: 5, maxFeaturedListings: 0, maxImagesPerListing: 5 }),
  is_default_vendor_plan: true,
  is_active: true,
};

exports.up = async function (knex) {
  const existingDefault = await knex("subscription_plans")
    .where({ is_default_vendor_plan: true })
    .first();

  if (existingDefault) {
    return;
  }

  await knex("subscription_plans").insert(STARTER_PLAN);
};

exports.down = async function (knex) {
  await knex("subscription_plans").where({ name: STARTER_PLAN.name, price: 0 }).del();
};
