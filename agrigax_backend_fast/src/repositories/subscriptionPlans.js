const db = require("../configs/db");

module.exports.findDefaultPlan = async (trx = db) => {
  return trx("subscription_plans").where({ is_default_vendor_plan: true }).first();
};
