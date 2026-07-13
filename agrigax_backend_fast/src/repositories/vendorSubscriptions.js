const db = require("../configs/db");

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
