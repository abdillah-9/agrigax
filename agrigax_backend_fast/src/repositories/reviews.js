const db = require("../configs/db");

module.exports.getReviewsByListing = async (listing_id) => {
  return db("reviews")
    .where({ listing_id, is_approved: true })
    .orderBy("created_at", "desc");
};

module.exports.createReview = async (data) => {
  const [id] = await db("reviews").insert(data);
  return db("reviews").where({ id }).first();
};

module.exports.getReviewById = async (id) => {
  return db("reviews").where({ id }).first();
};

module.exports.updateReview = async (id, updates) => {
  await db("reviews").where({ id }).update({ ...updates, updated_at: db.fn.now() });
  return module.exports.getReviewById(id);
};

module.exports.deleteReview = async (id) => {
  await db("reviews").where({ id }).del();
};

module.exports.countReviews = async () => {
  const [{ count }] = await db("reviews").count({ count: "*" });
  return Number(count);
};
