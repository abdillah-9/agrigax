const AppError = require("../errors/AppError");
const {
  getNotificationsByUser,
  markAsRead,
  markAllAsRead,
} = require("../repositories/notifications");
const { formatNotification } = require("../utils/formatters");

module.exports.listNotifications = async (userId) => {
  const rows = await getNotificationsByUser(userId);
  return rows.map(formatNotification);
};

module.exports.markNotificationRead = async (userId, id) => {
  await markAsRead(userId, id);
};

module.exports.markAllNotificationsRead = async (userId) => {
  await markAllAsRead(userId);
};
