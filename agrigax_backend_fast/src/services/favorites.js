const AppError = require("../errors/AppError");
const { getListingById } = require("../repositories/listings");
const {
  getFavoritesByUser,
  findFavorite,
  addFavorite,
  removeFavorite,
} = require("../repositories/favorites");
const { formatFavorite } = require("../utils/formatters");

module.exports.listFavorites = async (userId) => {
  const rows = await getFavoritesByUser(userId);

  return rows.map((row) => ({
    ...formatFavorite(row),
    listing: {
      title: row.title,
      price: Number(row.price),
      location: row.location,
      type: row.type,
    },
  }));
};

module.exports.addUserFavorite = async (userId, listingId) => {
  const listing = await getListingById(listingId, { publicOnly: true });

  if (!listing) {
    throw new AppError("Listing not found", 404);
  }

  const existing = await findFavorite(userId, listingId);

  if (existing) {
    return formatFavorite(existing);
  }

  const row = await addFavorite(userId, listingId);
  return formatFavorite(row);
};

module.exports.removeUserFavorite = async (userId, listingId) => {
  const existing = await findFavorite(userId, listingId);

  if (!existing) {
    throw new AppError("Favorite not found", 404);
  }

  await removeFavorite(userId, listingId);
};
