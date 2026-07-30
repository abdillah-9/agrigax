const db = require("../configs/db");

module.exports.getPaymentMethods = async ({ offset, limit, activeOnly = true }) => {
  const query = db("payment_methods").select("*").orderBy("display_order", "asc");

  if (activeOnly) {
    query.where({ is_active: true });
  }

  const [{ count }] = await query.clone().clearSelect().count({ count: "*" });
  const rows = await query.offset(offset).limit(limit);

  return { rows, total: Number(count) };
};

module.exports.getPaymentMethodById = async (id) => {
  return db("payment_methods").where({ id }).first();
};

module.exports.createPaymentMethod = async (data) => {
  const [id] = await db("payment_methods").insert(data);
  return module.exports.getPaymentMethodById(id);
};

module.exports.updatePaymentMethod = async (id, updates) => {
  await db("payment_methods")
    .where({ id })
    .update({ ...updates, updated_at: db.fn.now() });

  return module.exports.getPaymentMethodById(id);
};
