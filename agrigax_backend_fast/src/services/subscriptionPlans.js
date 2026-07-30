const AppError = require("../errors/AppError");
const {
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  isPlanReferenced,
} = require("../repositories/subscriptionPlans");

// Vendor-facing: active plans only (requirements §6 step 1, §4.1 is_active).
module.exports.listPlans = async (pagination) => {
  return getPlans({ ...pagination, activeOnly: true });
};

module.exports.getPlan = async (id) => {
  const plan = await getPlanById(id);

  if (!plan || !plan.is_active) {
    throw new AppError("Plan not found", 404);
  }

  return plan;
};

// Admin-facing: all plans, including inactive ones (§9 "Plans").
module.exports.adminListPlans = async (pagination) => {
  return getPlans({ ...pagination, activeOnly: false });
};

module.exports.adminGetPlan = async (id) => {
  const plan = await getPlanById(id);

  if (!plan) {
    throw new AppError("Plan not found", 404);
  }

  return plan;
};

module.exports.createPlan = async (body) => {
  return createPlan({
    name: body.name,
    description: body.description,
    price: body.price,
    currency: body.currency,
    duration_days: body.duration_days,
    features: JSON.stringify(body.features),
    limits: JSON.stringify(body.limits),
    is_default_vendor_plan: body.is_default_vendor_plan ?? false,
    is_active: body.is_active ?? true,
  });
};

module.exports.updatePlan = async (id, body) => {
  const plan = await getPlanById(id);

  if (!plan) {
    throw new AppError("Plan not found", 404);
  }

  const updates = { ...body };

  if (updates.features !== undefined) {
    updates.features = JSON.stringify(updates.features);
  }

  if (updates.limits !== undefined) {
    updates.limits = JSON.stringify(updates.limits);
  }

  return updatePlan(id, updates);
};

module.exports.removePlan = async (id) => {
  const plan = await getPlanById(id);

  if (!plan) {
    throw new AppError("Plan not found", 404);
  }

  // Every vendor must always have a default plan to fall back to (requirements
  // §8, §12.1) — the currently-flagged default can never be deleted outright.
  if (plan.is_default_vendor_plan) {
    throw new AppError(
      "Cannot delete the default vendor plan — assign the default flag to another plan first",
      409
    );
  }

  // Hard delete only if unreferenced; otherwise the caller must disable instead
  // (requirements §9: "Delete a plan, if no vendor_subscriptions or
  // subscription_requests reference it (otherwise disable instead)").
  if (await isPlanReferenced(id)) {
    throw new AppError(
      "Plan is referenced by existing subscriptions or requests — disable it instead of deleting",
      409
    );
  }

  await deletePlan(id);
};
