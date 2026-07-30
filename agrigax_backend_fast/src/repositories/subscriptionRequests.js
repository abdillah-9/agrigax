const db = require("../configs/db");

module.exports.createRequest = async (data) => {
  const [id] = await db("subscription_requests").insert(data);
  return module.exports.getRequestById(id);
};

module.exports.getRequestById = async (id) => {
  return db("subscription_requests").where({ id }).first();
};

module.exports.getRequestsByVendor = async ({ vendor_id, offset, limit, status }) => {
  const query = db("subscription_requests").where({ vendor_id }).orderBy("created_at", "desc");

  if (status) {
    query.andWhere({ status });
  }

  const [{ count }] = await query.clone().count({ count: "*" });
  const rows = await query.offset(offset).limit(limit);

  return { rows, total: Number(count) };
};

module.exports.getAllRequests = async ({ offset, limit, status, vendor_id }) => {
  const query = db("subscription_requests").orderBy("created_at", "desc");

  if (status) {
    query.andWhere({ status });
  }

  if (vendor_id) {
    query.andWhere({ vendor_id });
  }

  const [{ count }] = await query.clone().count({ count: "*" });
  const rows = await query.offset(offset).limit(limit);

  return { rows, total: Number(count) };
};

// Status-transition writes always run inside the caller's activation
// transaction (§4.6) — never called with the plain db instance.
module.exports.updateRequestStatus = async (trx, id, updates) => {
  await trx("subscription_requests")
    .where({ id })
    .update({ ...updates, updated_at: trx.fn.now() });

  return trx("subscription_requests").where({ id }).first();
};

// §9 Reporting: all revenue is derived from approved requests only — there
// is no live payment gateway, so this doubles as the manual transaction log.
// Grouped by verified_at (when the request became actual revenue), not
// created_at (when it was merely submitted).
module.exports.getTotalRevenue = async () => {
  const [{ total }] = await db("subscription_requests").where({ status: "approved" }).sum({ total: "amount" });
  return Number(total) || 0;
};

module.exports.getMonthlyRevenue = async () => {
  return db("subscription_requests")
    .where({ status: "approved" })
    .select(db.raw("DATE_FORMAT(verified_at, '%Y-%m') as period"))
    .sum({ revenue: "amount" })
    .groupByRaw("DATE_FORMAT(verified_at, '%Y-%m')")
    .orderBy("period", "asc");
};

module.exports.getYearlyRevenue = async () => {
  return db("subscription_requests")
    .where({ status: "approved" })
    .select(db.raw("YEAR(verified_at) as period"))
    .sum({ revenue: "amount" })
    .groupByRaw("YEAR(verified_at)")
    .orderBy("period", "asc");
};

module.exports.countByStatus = async (status) => {
  const [{ count }] = await db("subscription_requests").where({ status }).count({ count: "*" });
  return Number(count);
};

module.exports.getRequestsByStatusAndDateRange = async ({ status, from, to, offset, limit }) => {
  const query = db("subscription_requests").orderBy("created_at", "desc");

  if (status) query.andWhere({ status });
  if (from) query.andWhere("created_at", ">=", from);
  if (to) query.andWhere("created_at", "<=", to);

  const [{ count }] = await query.clone().count({ count: "*" });
  const rows = await query.offset(offset).limit(limit);

  return { rows, total: Number(count) };
};
