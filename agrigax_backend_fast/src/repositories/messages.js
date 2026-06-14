const db = require("../configs/db");

const orderedPair = (a, b) => (Number(a) < Number(b) ? [a, b] : [b, a]);

module.exports.getConversationsForUser = async (user_id) => {
  return db("conversations")
    .where({ user_one_id: user_id })
    .orWhere({ user_two_id: user_id })
    .orderBy("last_message_at", "desc");
};

module.exports.findConversation = async (user_one_id, user_two_id, listing_id = null) => {
  const [one, two] = orderedPair(user_one_id, user_two_id);

  return db("conversations")
    .where({ user_one_id: one, user_two_id: two, listing_id })
    .first();
};

module.exports.createConversation = async (data) => {
  const [id] = await db("conversations").insert(data);
  return db("conversations").where({ id }).first();
};

module.exports.getMessages = async (conversation_id) => {
  return db("messages").where({ conversation_id }).orderBy("created_at", "asc");
};

module.exports.createMessage = async (data) => {
  const [id] = await db("messages").insert(data);

  await db("conversations")
    .where({ id: data.conversation_id })
    .update({ last_message_at: db.fn.now(), updated_at: db.fn.now() });

  return db("messages").where({ id }).first();
};

module.exports.getConversationById = async (id) => {
  return db("conversations").where({ id }).first();
};
