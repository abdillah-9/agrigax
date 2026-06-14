const db = require("../configs/db");

module.exports.getUserByEmail = async (email) => {
  if (!email) return null;
  return db("users").select("*").where({ email }).first();
};

module.exports.getUserByUsername = async (username) => {
  if (!username) return null;
  return db("users").select("*").where({ username }).first();
};

module.exports.getUserByPhone = async (phone) => {
  if (!phone) return null;
  return db("users").select("*").where({ phone }).first();
};

module.exports.getUserById = async (id) => {
  return db("users").select("*").where({ id }).first();
};

module.exports.findUserByIdentifier = async ({ type, value }) => {
  if (type === "email") {
    return module.exports.getUserByEmail(value);
  }

  if (type === "phone") {
    return module.exports.getUserByPhone(value);
  }

  return module.exports.getUserByUsername(value);
};

module.exports.createNewUserAccount = async (trx, userData) => {
  const [id] = await trx("users").insert(userData);
  return id;
};

module.exports.updateUserById = async (id, updates) => {
  await db("users").where({ id }).update(updates);
};

module.exports.updatePasswordByUserId = async (user_id, password_hash) => {
  await db("users").where({ id: user_id }).update({ password_hash });
};

module.exports.upsertRefreshToken = async (user_id, refresh_token_hash) => {
  const existing = await db("user_sessions").where({ user_id, is_revoked: false }).first();

  if (existing) {
    await db("user_sessions")
      .where({ id: existing.id })
      .update({ refresh_token_hash, is_revoked: false, updated_at: db.fn.now() });
    return existing.id;
  }

  const [id] = await db("user_sessions").insert({
    user_id,
    refresh_token_hash,
    is_revoked: false,
  });

  return id;
};

module.exports.revokeUserSessions = async (user_id) => {
  await db("user_sessions")
    .where({ user_id })
    .update({ is_revoked: true, refresh_token_hash: null, updated_at: db.fn.now() });
};

module.exports.getActiveSessionByUserId = async (user_id) => {
  return db("user_sessions")
    .where({ user_id, is_revoked: false })
    .orderBy("updated_at", "desc")
    .first();
};

module.exports.saveOtp = async ({ user_id, phone, email, otp_hash, purpose, expires_at }) => {
  await db("auth_otps")
    .where({ user_id, purpose })
    .whereNull("used_at")
    .update({ used_at: db.fn.now() });

  const [id] = await db("auth_otps").insert({
    user_id,
    phone,
    email: email || null,
    otp_hash,
    purpose,
    expires_at,
  });

  return id;
};

module.exports.findLatestOtp = async ({ user_id, purpose }) => {
  return db("auth_otps")
    .where({ user_id, purpose })
    .whereNull("used_at")
    .where("expires_at", ">", db.fn.now())
    .orderBy("created_at", "desc")
    .first();
};

module.exports.markOtpUsed = async (id) => {
  await db("auth_otps").where({ id }).update({ used_at: db.fn.now() });
};
