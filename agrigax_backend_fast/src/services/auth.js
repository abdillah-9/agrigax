const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const AppError = require("../errors/AppError");
const { normalizeLoginIdentifier } = require("../utils/identifier");
const { normalizePhone } = require("../utils/phone");
const {
  getUserByEmail,
  getUserByUsername,
  getUserByPhone,
  getUserById,
  findUserByIdentifier,
  createNewUserAccount,
  updateUserById,
  updatePasswordByUserId,
  upsertRefreshToken,
  revokeUserSessions,
  getActiveSessionByUserId,
  saveOtp,
  findLatestOtp,
  markOtpUsed,
} = require("../repositories/auth");
const db = require("../configs/db");
const { shouldExposeDevOtp } = require("../utils/devOtp");
require("dotenv").config();

const OTP_EXPIRY_MINUTES = 10;

const issueTokens = async (userId) => {
  const access_token_hash = jwt.sign({ id: userId }, process.env.ACCESS_SECRET_KEY, {
    expiresIn: "15m",
  });

  const refresh_token_hash = jwt.sign({ id: userId }, process.env.REFRESH_SECRET_KEY, {
    expiresIn: "7d",
  });

  await upsertRefreshToken(userId, refresh_token_hash);

  return { access_token_hash, refresh_token_hash };
};

const generateOtp = () => String(crypto.randomInt(100000, 999999));

const createAndStoreOtp = async ({ user, purpose }) => {
  const otp = generateOtp();
  const otp_hash = await bcrypt.hash(otp, 10);
  const expires_at = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await saveOtp({
    user_id: user.id,
    phone: user.phone,
    email: user.email,
    otp_hash,
    purpose,
    expires_at,
  });

  if (shouldExposeDevOtp()) {
    console.log(`[auth] OTP for ${user.phone} (${purpose}): ${otp}`);
  }

  return otp;
};

const verifyStoredOtp = async ({ user_id, otp, purpose }) => {
  const record = await findLatestOtp({ user_id, purpose });

  if (!record) {
    throw new AppError("Invalid or expired OTP", 400);
  }

  const valid = await bcrypt.compare(otp, record.otp_hash);

  if (!valid) {
    throw new AppError("Invalid or expired OTP", 400);
  }

  await markOtpUsed(record.id);
  return record;
};

const resolveLoginUser = async (identifier) => {
  const parsed = normalizeLoginIdentifier(identifier);
  return findUserByIdentifier(parsed);
};

const assertUniqueRegistration = async ({ username, phone, email }) => {
  if (await getUserByUsername(username)) {
    throw new AppError("Username is already taken", 409);
  }

  if (await getUserByPhone(phone)) {
    throw new AppError("Phone number is already registered", 409);
  }

  if (email && (await getUserByEmail(email))) {
    throw new AppError("Email is already registered", 409);
  }
};

module.exports.login = async ({ identifier, password }) => {
  const user = await resolveLoginUser(identifier);

  if (!user || user.is_suspended) {
    throw new AppError("Invalid credentials", 401);
  }

  const validPassword = await bcrypt.compare(password, user.password_hash);

  if (!validPassword) {
    throw new AppError("Invalid credentials", 401);
  }

  const tokens = await issueTokens(user.id);

  return { user, ...tokens };
};

module.exports.register = async ({
  username,
  full_name,
  phone,
  email = null,
  password,
  active_role = "customer",
}) => {
  const normalizedPhone = normalizePhone(phone);
  const normalizedUsername = String(username).trim().toLowerCase();
  const normalizedEmail = email ? String(email).trim().toLowerCase() : null;

  await assertUniqueRegistration({
    username: normalizedUsername,
    phone: normalizedPhone,
    email: normalizedEmail,
  });

  const password_hash = await bcrypt.hash(password, 10);

  const userId = await db.transaction(async (trx) => {
    return createNewUserAccount(trx, {
      username: normalizedUsername,
      full_name,
      phone: normalizedPhone,
      email: normalizedEmail,
      password_hash,
      avatar: null,
      active_role,
      is_verified: false,
      is_suspended: false,
    });
  });

  const user = await getUserById(userId);
  const otp = await createAndStoreOtp({ user, purpose: "registration" });

  const tokens = await issueTokens(userId);

  return { user, ...tokens, requiresVerification: true, devOtp: otp };
};

module.exports.logout = async ({ access_token_hash, refresh_token_hash }) => {
  let userId = null;

  try {
    const payload = jwt.verify(access_token_hash, process.env.ACCESS_SECRET_KEY);
    userId = payload.id;
  } catch (e) {
    if (!(e.name === "JsonWebTokenError" || e.name === "TokenExpiredError")) {
      throw e;
    }
  }

  if (!userId && refresh_token_hash) {
    try {
      const payload = jwt.verify(refresh_token_hash, process.env.REFRESH_SECRET_KEY);
      userId = payload.id;
    } catch (e) {
      if (!(e.name === "JsonWebTokenError" || e.name === "TokenExpiredError")) {
        throw e;
      }
    }
  }

  if (userId) {
    await revokeUserSessions(userId);
  }

  return { id: userId };
};

module.exports.refreshSession = async ({ access_token_hash, refresh_token_hash }) => {
  if (access_token_hash) {
    try {
      const payload = jwt.verify(access_token_hash, process.env.ACCESS_SECRET_KEY);
      const user = await getUserById(payload.id);

      if (user && !user.is_suspended) {
        const tokens = await issueTokens(user.id);
        return { user, ...tokens };
      }
    } catch (e) {
      if (!(e.name === "JsonWebTokenError" || e.name === "TokenExpiredError")) {
        throw e;
      }
    }
  }

  if (!refresh_token_hash) {
    throw new AppError("Not authorised", 401);
  }

  let payload;

  try {
    payload = jwt.verify(refresh_token_hash, process.env.REFRESH_SECRET_KEY);
  } catch (e) {
    throw new AppError("Not authorised", 401);
  }

  const user = await getUserById(payload.id);

  if (!user || user.is_suspended) {
    throw new AppError("Not authorised", 401);
  }

  const session = await getActiveSessionByUserId(user.id);

  if (!session || session.refresh_token_hash !== refresh_token_hash) {
    throw new AppError("Not authorised", 401);
  }

  const tokens = await issueTokens(user.id);
  return { user, ...tokens };
};

module.exports.getMe = async (userId) => {
  const user = await getUserById(userId);

  if (!user || user.is_suspended) {
    throw new AppError("Not authorised", 401);
  }

  return user;
};

module.exports.forgotPassword = async ({ identifier }) => {
  const user = await resolveLoginUser(identifier);

  if (!user) {
    return { message: "If that account exists, an OTP has been sent to your phone" };
  }

  const otp = await createAndStoreOtp({ user, purpose: "password_reset" });

  return {
    message: "If that account exists, an OTP has been sent to your phone",
    devOtp: otp,
  };
};

module.exports.resendOtp = async ({ phone, purpose = "registration" }) => {
  const normalizedPhone = normalizePhone(phone);
  const user = await getUserByPhone(normalizedPhone);

  if (!user) {
    return { message: "If that account exists, an OTP has been sent to your phone" };
  }

  const otp = await createAndStoreOtp({ user, purpose });

  return {
    message: "OTP sent to your phone",
    devOtp: otp,
  };
};

module.exports.verifyOtp = async ({ phone, otp, purpose = "registration" }) => {
  const normalizedPhone = normalizePhone(phone);
  const user = await getUserByPhone(normalizedPhone);

  if (!user) {
    throw new AppError("Invalid or expired OTP", 400);
  }

  await verifyStoredOtp({ user_id: user.id, otp, purpose });

  if (purpose === "registration") {
    await updateUserById(user.id, { is_verified: true });
    const updatedUser = await getUserById(user.id);
    return { user: updatedUser, purpose };
  }

  const resetToken = jwt.sign(
    { user_id: user.id, phone: user.phone, purpose: "password_reset" },
    process.env.ACCESS_SECRET_KEY,
    { expiresIn: "15m" }
  );

  return { resetToken, purpose };
};

module.exports.resetPassword = async ({ password, resetToken }) => {
  if (!resetToken) {
    throw new AppError("Invalid or expired reset session", 400);
  }

  let user_id;

  try {
    const payload = jwt.verify(resetToken, process.env.ACCESS_SECRET_KEY);

    if (payload.purpose !== "password_reset") {
      throw new AppError("Invalid or expired reset session", 400);
    }

    user_id = payload.user_id;
  } catch (e) {
    throw new AppError("Invalid or expired reset session", 400);
  }

  const user = await getUserById(user_id);

  if (!user) {
    throw new AppError("Invalid or expired reset session", 400);
  }

  const password_hash = await bcrypt.hash(password, 10);
  await updatePasswordByUserId(user.id, password_hash);
  await revokeUserSessions(user.id);

  const tokens = await issueTokens(user.id);
  const updatedUser = await getUserById(user.id);

  return { user: updatedUser, ...tokens };
};

module.exports.signIn = module.exports.login;
module.exports.signUp = module.exports.register;
module.exports.signOut = module.exports.logout;
module.exports.userSessionCheck = module.exports.refreshSession;
