const db = require("../configs/db");

module.exports.getFavoritesByUser = async (user_id) => {
  return db("favorites")
    .join("listings", "favorites.listing_id", "listings.id")
    .select("favorites.*", "listings.title", "listings.price", "listings.location", "listings.type")
    .where({ "favorites.user_id": user_id })
    .orderBy("favorites.created_at", "desc");
};

module.exports.findFavorite = async (user_id, listing_id) => {
  return db("favorites").where({ user_id, listing_id }).first();
};

module.exports.addFavorite = async (user_id, listing_id) => {
  const [id] = await db("favorites").insert({ user_id, listing_id });
  return db("favorites").where({ id }).first();
};

module.exports.removeFavorite = async (user_id, listing_id) => {
  await db("favorites").where({ user_id, listing_id }).del();
};
