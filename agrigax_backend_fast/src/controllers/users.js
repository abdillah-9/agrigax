const AppError = require("../errors/AppError");
const { getProfile, updateUserProfile, getPublicUser, listProviders } = require("../services/users");
const { formatUser, sendSuccess, sendPaginated } = require("../utils/response");
const { parsePagination, buildPagination } = require("../utils/pagination");

module.exports.getProfile = async (req, res, next) => {
  try {
    const user = await getProfile(req.user.id);
    return sendSuccess(res, { user: formatUser(user) }, "Profile fetched");
  } catch (e) {
    next(e);
  }
};

module.exports.updateProfile = async (req, res, next) => {
  try {
    const user = await updateUserProfile(req.user.id, req.body);
    return sendSuccess(res, { user: formatUser(user) }, "Profile updated");
  } catch (e) {
    next(e);
  }
};

module.exports.getProviders = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { rows, total } = await listProviders({ offset, limit });
    const providers = rows.map((u) => formatUser(u));

    return sendPaginated(res, providers, buildPagination(page, limit, total), "Providers fetched");
  } catch (e) {
    next(e);
  }
};

module.exports.getUserById = async (req, res, next) => {
  try {
    const user = await getPublicUser(req.params.id);
    return sendSuccess(res, { user: formatUser(user) }, "User fetched");
  } catch (e) {
    next(e);
  }
};

module.exports.updateSettings = async (req, res, next) => {
  next(new AppError("User settings are not available in V1", 501));
};
