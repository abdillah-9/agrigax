const db = require("../configs/db");

module.exports.findActiveByVendor = async (vendor_id, trx = db) => {
  return trx("vendor_subscriptions").where({ vendor_id, status: "active" }).first();
};

module.exports.setSubscriptionStatus = async (trx, id, status) => {
  await trx("vendor_subscriptions").where({ id }).update({ status, updated_at: trx.fn.now() });
};

// §7 point 1: active rows past their end_date. Rows with end_date=null
// (the permanent default plan, §12.1) never match "< now" and are correctly
// excluded without any extra filter.
module.exports.findExpiredActive = async () => {
  return db("vendor_subscriptions")
    .where({ status: "active" })
    .whereNotNull("end_date")
    .where("end_date", "<", db.fn.now());
};

// §7 point 4: a separate check from findExpiredActive, bucketed to the exact
// calendar day so "expires in N days" fires once per subscription rather
// than for a whole trailing window.
module.exports.findExpiringOnDate = async (daysFromNow) => {
  return db("vendor_subscriptions")
    .where({ status: "active" })
    .whereNotNull("end_date")
    .whereRaw("DATE(end_date) = DATE(DATE_ADD(NOW(), INTERVAL ? DAY))", [daysFromNow]);
};

// Admin operational view (§9 "Subscriptions") — history/active/expired/
// upcoming all through one query via filters, per docs/02-api-specification.md §10.
module.exports.getAllSubscriptions = async ({ offset, limit, status, vendor_id, plan_id, expiringWithinDays }) => {
  const query = db("vendor_subscriptions").orderBy("created_at", "desc");

  if (status) query.andWhere({ status });
  if (vendor_id) query.andWhere({ vendor_id });
  if (plan_id) query.andWhere({ plan_id });

  if (expiringWithinDays) {
    query
      .andWhere({ status: "active" })
      .whereNotNull("end_date")
      .andWhere("end_date", "<=", db.raw("DATE_ADD(NOW(), INTERVAL ? DAY)", [expiringWithinDays]));
  }

  const [{ count }] = await query.clone().count({ count: "*" });
  const rows = await query.offset(offset).limit(limit);

  return { rows, total: Number(count) };
};

// Vendor-facing subscription history — all of the vendor's own rows,
// newest first (docs/02-api-specification.md §4).
module.exports.getHistoryByVendor = async ({ vendor_id, offset, limit }) => {
  const query = db("vendor_subscriptions").where({ vendor_id }).orderBy("created_at", "desc");

  const [{ count }] = await query.clone().count({ count: "*" });
  const rows = await query.offset(offset).limit(limit);

  return { rows, total: Number(count) };
};

module.exports.countByStatus = async (status) => {
  const [{ count }] = await db("vendor_subscriptions").where({ status }).count({ count: "*" });
  return Number(count);
};

// Distinct vendors currently active — the invariant that a vendor can never
// have more than one active row (BR-030) means COUNT and COUNT(DISTINCT)
// should agree, but distinct is used defensively rather than relying on it.
module.exports.countActiveVendors = async () => {
  const [{ count }] = await db("vendor_subscriptions").where({ status: "active" }).countDistinct({ count: "vendor_id" });
  return Number(count);
};

// isDefault=true -> Starter vendors, false -> paid vendors (§9 Reporting).
module.exports.countActiveVendorsOnDefaultPlan = async (isDefault) => {
  const [{ count }] = await db("vendor_subscriptions as vs")
    .join("subscription_plans as sp", "vs.plan_id", "sp.id")
    .where("vs.status", "active")
    .andWhere("sp.is_default_vendor_plan", isDefault)
    .countDistinct({ count: "vs.vendor_id" });

  return Number(count);
};

// "Within the next N days" as a range (unlike findExpiringOnDate's exact-day
// bucket used for notification dedup) — for the reporting count in §9/§11.
module.exports.countExpiringWithin = async (days) => {
  const [{ count }] = await db("vendor_subscriptions")
    .where({ status: "active" })
    .whereNotNull("end_date")
    .andWhere("end_date", "<=", db.raw("DATE_ADD(NOW(), INTERVAL ? DAY)", [days]))
    .count({ count: "*" });

  return Number(count);
};

module.exports.insertVendorSubscription = async (
  trx,
  { vendor_id, plan_id, status, start_date, end_date = null, created_from_request_id = null }
) => {
  const [id] = await trx("vendor_subscriptions").insert({
    vendor_id,
    plan_id,
    status,
    start_date,
    end_date,
    created_from_request_id,
  });

  return id;
};
