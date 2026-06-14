const AppError = require("../errors/AppError");
const { getListingById } = require("../repositories/listings");
const {
  getReviewsByListing,
  createReview,
  getReviewById,
  updateReview,
  deleteReview,
} = require("../repositories/reviews");
const { formatReview } = require("../utils/formatters");

module.exports.listReviews = async (listingId) => {
  if (!listingId) {
    throw new AppError("listing_id query parameter is required", 400);
  }

  const rows = await getReviewsByListing(listingId);
  return rows.map(formatReview);
};

module.exports.createUserReview = async (userId, body) => {
  const listingId = body.listing_id || body.listingId;
  const listing = await getListingById(listingId, { publicOnly: true });

  if (!listing) {
    throw new AppError("Listing not found", 404);
  }

  const review = await createReview({
    listing_id: listingId,
    user_id: userId,
    rating: body.rating,
    comment: body.comment || null,
    is_approved: true,
  });

  return formatReview(review);
};

module.exports.updateUserReview = async (userId, id, body) => {
  const review = await getReviewById(id);

  if (!review) throw new AppError("Review not found", 404);
  if (Number(review.user_id) !== Number(userId)) {
    throw new AppError("You do not have permission to perform this action", 403);
  }

  const updated = await updateReview(id, {
    rating: body.rating ?? review.rating,
    comment: body.comment ?? review.comment,
  });

  return formatReview(updated);
};

module.exports.removeUserReview = async (userId, id) => {
  const review = await getReviewById(id);

  if (!review) throw new AppError("Review not found", 404);
  if (Number(review.user_id) !== Number(userId)) {
    throw new AppError("You do not have permission to perform this action", 403);
  }

  await deleteReview(id);
};

module.exports.adminListReviews = async () => {
  const db = require("../configs/db");
  const rows = await db("reviews").orderBy("created_at", "desc");
  return rows.map(formatReview);
};
