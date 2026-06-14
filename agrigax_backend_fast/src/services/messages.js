const AppError = require("../errors/AppError");
const {
  getConversationsForUser,
  findConversation,
  createConversation,
  getMessages,
  createMessage,
  getConversationById,
} = require("../repositories/messages");
const { formatConversation, formatMessage } = require("../utils/formatters");

const assertParticipant = (conversation, userId) => {
  const allowed =
    Number(conversation.user_one_id) === Number(userId) ||
    Number(conversation.user_two_id) === Number(userId);

  if (!allowed) {
    throw new AppError("You do not have permission to perform this action", 403);
  }
};

module.exports.listConversations = async (userId) => {
  const rows = await getConversationsForUser(userId);
  return rows.map((row) => formatConversation(row, userId));
};

module.exports.getConversationMessages = async (userId, conversationId) => {
  const conversation = await getConversationById(conversationId);

  if (!conversation) throw new AppError("Conversation not found", 404);
  assertParticipant(conversation, userId);

  const rows = await getMessages(conversationId);
  return rows.map(formatMessage);
};

module.exports.startConversation = async (userId, body) => {
  const otherUserId = body.user_two_id || body.userTwoId;
  const listingId = body.listing_id || body.listingId || null;

  if (Number(otherUserId) === Number(userId)) {
    throw new AppError("You cannot start a conversation with yourself", 400);
  }

  let conversation = await findConversation(userId, otherUserId, listingId);

  if (!conversation) {
    const [one, two] = Number(userId) < Number(otherUserId) ? [userId, otherUserId] : [otherUserId, userId];
    conversation = await createConversation({
      user_one_id: one,
      user_two_id: two,
      listing_id: listingId,
    });
  }

  return formatConversation(conversation, userId);
};

module.exports.sendMessage = async (userId, conversationId, body) => {
  const conversation = await getConversationById(conversationId);

  if (!conversation) throw new AppError("Conversation not found", 404);
  assertParticipant(conversation, userId);

  const text = body.message || body.text;

  const row = await createMessage({
    conversation_id: conversationId,
    sender_id: userId,
    message: text,
    is_read: false,
  });

  return formatMessage(row);
};
