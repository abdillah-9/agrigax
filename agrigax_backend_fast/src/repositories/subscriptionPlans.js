const db = require("../configs/db");

module.exports.findDefaultPlan = async (trx = db) => {
  return trx("subscription_plans").where({ is_default_vendor_plan: true }).first();
};

module.exports.getPlans = async ({ offset, limit, activeOnly = true }) => {
  const query = db("subscription_plans").select("*").orderBy("price", "asc");

  if (activeOnly) {
    query.where({ is_active: true });
  }

  const [{ count }] = await query.clone().clearSelect().count({ count: "*" });
  const rows = await query.offset(offset).limit(limit);

  return { rows, total: Number(count) };
};

module.exports.getPlanById = async (id) => {
  return db("subscription_plans").where({ id }).first();
};

module.exports.createPlan = async (data) => {
  return db.transaction(async (trx) => {
    if (data.is_default_vendor_plan) {
      await trx("subscription_plans").update({ is_default_vendor_plan: false });
    }

    const [id] = await trx("subscription_plans").insert(data);
    return trx("subscription_plans").where({ id }).first();
  });
};

module.exports.updatePlan = async (id, updates) => {
  return db.transaction(async (trx) => {
    if (updates.is_default_vendor_plan) {
      await trx("subscription_plans").whereNot({ id }).update({ is_default_vendor_plan: false });
    }

    await trx("subscription_plans")
      .where({ id })
      .update({ ...updates, updated_at: trx.fn.now() });

    return trx("subscription_plans").where({ id }).first();
  });
};

module.exports.deletePlan = async (id) => {
  await db("subscription_plans").where({ id }).del();
};

module.exports.isPlanReferenced = async (id) => {
  const [{ count: subCount }] = await db("vendor_subscriptions").where({ plan_id: id }).count({ count: "*" });
  if (Number(subCount) > 0) return true;

  const [{ count: reqCount }] = await db("subscription_requests").where({ plan_id: id }).count({ count: "*" });
  return Number(reqCount) > 0;
};
