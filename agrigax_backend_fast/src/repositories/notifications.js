const db = require("../configs/db");

module.exports.getNotificationsByUser = async (user_id) => {
  return db("notifications").where({ user_id }).orderBy("created_at", "desc");
};

module.exports.markAsRead = async (user_id, id) => {
  await db("notifications").where({ id, user_id }).update({ is_read: true, updated_at: db.fn.now() });
};

module.exports.markAllAsRead = async (user_id) => {
  await db("notifications").where({ user_id }).update({ is_read: true, updated_at: db.fn.now() });
};

module.exports.createNotification = async (data) => {
  const [id] = await db("notifications").insert(data);
  return db("notifications").where({ id }).first();
};

module.exports.countUnread = async (user_id) => {
  const [{ count }] = await db("notifications").where({ user_id, is_read: false }).count({ count: "*" });
  return Number(count);
};
