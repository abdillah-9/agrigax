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

// No column in this schema tracks "already notified" for a given
// vendor_subscriptions row — dedupe the pre-expiry warnings by checking
// whether this exact title was already sent to this user today instead.
module.exports.hasNotificationToday = async (user_id, title) => {
  const row = await db("notifications")
    .where({ user_id, title })
    .whereRaw("DATE(created_at) = CURDATE()")
    .first();

  return Boolean(row);
};

module.exports.countUnread = async (user_id) => {
  const [{ count }] = await db("notifications").where({ user_id, is_read: false }).count({ count: "*" });
  return Number(count);
};
