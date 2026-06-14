const {
  listReviews,
  createUserReview,
  updateUserReview,
  removeUserReview,
} = require("../services/reviews");
const { sendSuccess } = require("../utils/response");

module.exports.getReviews = async (req, res, next) => {
  try {
    const data = await listReviews(req.query.listing_id || req.query.listingId);
    return sendSuccess(res, data, "Reviews fetched");
  } catch (e) {
    next(e);
  }
};

module.exports.createReview = async (req, res, next) => {
  try {
    const data = await createUserReview(req.user.id, req.body);
    return sendSuccess(res, data, "Review created", 201);
  } catch (e) {
    next(e);
  }
};

module.exports.updateReview = async (req, res, next) => {
  try {
    const data = await updateUserReview(req.user.id, req.params.id, req.body);
    return sendSuccess(res, data, "Review updated");
  } catch (e) {
    next(e);
  }
};

module.exports.deleteReview = async (req, res, next) => {
  try {
    await removeUserReview(req.user.id, req.params.id);
    return sendSuccess(res, null, "Review deleted");
  } catch (e) {
    next(e);
  }
};
