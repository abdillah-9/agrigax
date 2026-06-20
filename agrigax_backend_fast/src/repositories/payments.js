const db = require("../configs/db");

module.exports.listPayments = async ({ offset, limit, status }) => {
  const query = db("payments").orderBy("created_at", "desc");

  if (status) {
    const dbStatus = status === "completed" ? "paid" : status;
    query.where({ status: dbStatus });
  }

  const [{ count }] = await query.clone().count({ count: "*" });
  const rows = await query.offset(offset).limit(limit);

  return { rows, total: Number(count) };
};

module.exports.getPaymentById = async (id) => {
  return db("payments").where({ id }).first();
};

module.exports.countPayments = async () => {
  const [{ count }] = await db("payments").count({ count: "*" });
  return Number(count);
};
