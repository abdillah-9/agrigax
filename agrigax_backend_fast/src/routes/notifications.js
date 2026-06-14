const express = require("express");
const { getNotifications, markAsRead, markAllAsRead } = require("../controllers/notifications");
const { asyncHandler } = require("../middlewares/asyncHandler");
const { guards } = require("../configs/accessPolicy");

const notificationsRouter = express.Router();

notificationsRouter.get("/", ...guards.auth, asyncHandler(getNotifications));
notificationsRouter.put("/read-all", ...guards.auth, asyncHandler(markAllAsRead));
notificationsRouter.put("/:id/read", ...guards.auth, asyncHandler(markAsRead));

module.exports = notificationsRouter;
