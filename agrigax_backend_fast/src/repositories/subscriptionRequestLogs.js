const db = require("../configs/db");

// Append-only audit trail — insertLog always takes the caller's transaction
// so it commits atomically with the status change it's recording (§4.5, §4.6).
module.exports.insertLog = async (trx, { request_id, admin_id, action, comment = null }) => {
  const [id] = await trx("subscription_request_logs").insert({ request_id, admin_id, action, comment });
  return id;
};

module.exports.getLogsByRequest = async (request_id) => {
  return db("subscription_request_logs").where({ request_id }).orderBy("created_at", "asc");
};
