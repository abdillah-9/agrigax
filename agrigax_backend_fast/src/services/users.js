const AppError = require("../errors/AppError");
const { getUserById, updateProfile, getProviders } = require("../repositories/users");
const { normalizePhone } = require("../utils/phone");

module.exports.getProfile = async (userId) => {
  const user = await getUserById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

module.exports.updateUserProfile = async (userId, body) => {
  const updates = {};

  if (body.fullName || body.full_name) {
    updates.full_name = body.fullName || body.full_name;
  }

  if (body.phone) {
    updates.phone = normalizePhone(body.phone);
  }

  if (body.avatar !== undefined) {
    updates.avatar = body.avatar;
  }

  if (!Object.keys(updates).length) {
    throw new AppError("No valid fields to update", 400);
  }

  return updateProfile(userId, updates);
};

module.exports.getPublicUser = async (id) => {
  const user = await getUserById(id);

  if (!user || user.is_suspended) {
    throw new AppError("User not found", 404);
  }

  return user;
};

module.exports.listProviders = async (pagination) => {
  return getProviders(pagination);
};
