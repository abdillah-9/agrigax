const { listFavorites, addUserFavorite, removeUserFavorite } = require("../services/favorites");
const { sendSuccess } = require("../utils/response");

module.exports.getFavorites = async (req, res, next) => {
  try {
    const data = await listFavorites(req.user.id);
    return sendSuccess(res, data, "Favorites fetched");
  } catch (e) {
    next(e);
  }
};

module.exports.addFavorite = async (req, res, next) => {
  try {
    const data = await addUserFavorite(req.user.id, req.params.id);
    return sendSuccess(res, data, "Favorite added", 201);
  } catch (e) {
    next(e);
  }
};

module.exports.removeFavorite = async (req, res, next) => {
  try {
    await removeUserFavorite(req.user.id, req.params.id);
    return sendSuccess(res, null, "Favorite removed");
  } catch (e) {
    next(e);
  }
};
