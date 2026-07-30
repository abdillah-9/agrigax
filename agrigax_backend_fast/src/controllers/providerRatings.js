const { getProviderRating, rateProvider } = require("../services/providerRatings");
const { sendSuccess } = require("../utils/response");

module.exports.getRating = async (req, res, next) => {
  try {
    const rating = await getProviderRating(req.params.id, req.user?.id || null);
    return sendSuccess(res, { rating }, "Provider rating fetched");
  } catch (e) {
    next(e);
  }
};

module.exports.rate = async (req, res, next) => {
  try {
    const rating = await rateProvider(req.user.id, req.params.id, req.body);
    return sendSuccess(res, { rating }, "Rating saved");
  } catch (e) {
    next(e);
  }
};
