const { listNotifications, markNotificationRead, markAllNotificationsRead } = require("../services/notifications");
const { sendSuccess } = require("../utils/response");

module.exports.getNotifications = async (req, res, next) => {
  try {
    const data = await listNotifications(req.user.id);
    return sendSuccess(res, data, "Notifications fetched");
  } catch (e) {
    next(e);
  }
};

module.exports.markAsRead = async (req, res, next) => {
  try {
    await markNotificationRead(req.user.id, req.params.id);
    return sendSuccess(res, null, "Notification marked as read");
  } catch (e) {
    next(e);
  }
};

module.exports.markAllAsRead = async (req, res, next) => {
  try {
    await markAllNotificationsRead(req.user.id);
    return sendSuccess(res, null, "All notifications marked as read");
  } catch (e) {
    next(e);
  }
};
