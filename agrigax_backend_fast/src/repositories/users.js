const db = require("../configs/db");

module.exports.getUserById = async (id) => {
  return db("users").select("*").where({ id }).whereNull("deleted_at").first();
};

module.exports.updateProfile = async (id, updates) => {
  await db("users").where({ id }).update({ ...updates, updated_at: db.fn.now() });
  return module.exports.getUserById(id);
};

module.exports.getProviders = async ({ offset, limit }) => {
  const query = db("users")
    .select("id", "username", "full_name", "phone", "avatar", "active_role", "is_verified", "created_at")
    .where({ active_role: "provider", is_suspended: false })
    .whereNull("deleted_at")
    .orderBy("created_at", "desc");

  const [{ count }] = await query.clone().clearSelect().count({ count: "*" });
  const rows = await query.offset(offset).limit(limit);

  return { rows, total: Number(count) };
};

module.exports.getAllUsers = async ({ offset, limit }) => {
  const query = db("users").select("*").whereNull("deleted_at").orderBy("created_at", "desc");
  const [{ count }] = await query.clone().clearSelect().count({ count: "*" });
  const rows = await query.offset(offset).limit(limit);
  return { rows, total: Number(count) };
};

module.exports.suspendUser = async (id) => {
  await db("users").where({ id }).update({ is_suspended: true, updated_at: db.fn.now() });
};

module.exports.reinstateUser = async (id) => {
  await db("users").where({ id }).update({ is_suspended: false, updated_at: db.fn.now() });
};

module.exports.countUsers = async () => {
  const [{ count }] = await db("users").whereNull("deleted_at").count({ count: "*" });
  return Number(count);
};
