const {
  listConversations,
  getConversationMessages,
  startConversation,
  sendMessage,
} = require("../services/messages");
const { sendSuccess } = require("../utils/response");

module.exports.getConversations = async (req, res, next) => {
  try {
    const data = await listConversations(req.user.id);
    return sendSuccess(res, data, "Conversations fetched");
  } catch (e) {
    next(e);
  }
};

module.exports.getMessages = async (req, res, next) => {
  try {
    const data = await getConversationMessages(req.user.id, req.params.id);
    return sendSuccess(res, data, "Messages fetched");
  } catch (e) {
    next(e);
  }
};

module.exports.createConversation = async (req, res, next) => {
  try {
    const data = await startConversation(req.user.id, req.body);
    return sendSuccess(res, data, "Conversation ready", 201);
  } catch (e) {
    next(e);
  }
};

module.exports.sendMessage = async (req, res, next) => {
  try {
    const data = await sendMessage(req.user.id, req.params.id, req.body);
    return sendSuccess(res, data, "Message sent", 201);
  } catch (e) {
    next(e);
  }
};
