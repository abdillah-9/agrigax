const express = require("express");
const {
  getConversations,
  getMessages,
  createConversation,
  sendMessage,
} = require("../controllers/messages");
const { asyncHandler } = require("../middlewares/asyncHandler");
const validate = require("../middlewares/validate");
const { guards } = require("../configs/accessPolicy");
const schemas = require("../validations/messages");

const messagesRouter = express.Router();

messagesRouter.get("/conversations", ...guards.verified, asyncHandler(getConversations));
messagesRouter.post("/conversations", ...guards.verified, validate(schemas.createConversation), asyncHandler(createConversation));
messagesRouter.get("/:id", ...guards.verified, asyncHandler(getMessages));
messagesRouter.post("/:id/send", ...guards.verified, validate(schemas.send), asyncHandler(sendMessage));

module.exports = messagesRouter;
