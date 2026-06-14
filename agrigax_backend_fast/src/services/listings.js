const AppError = require("../errors/AppError");
const db = require("../configs/db");
const { getCategoryById } = require("../repositories/categories");
const {
  findListings,
  getListingById,
  getFeaturedListings,
  createListing,
  updateListing,
  softDeleteListing,
  getImagesByListingIds,
  replaceListingImages,
} = require("../repositories/listings");
const { formatListing } = require("../utils/formatters");

const mapCreateBody = (body, provider_id) => ({
  title: body.title,
  description: body.description,
  type: body.type,
  category_id: body.category_id || body.categoryId,
  location: body.location,
  price: body.price ?? 0,
  is_available: body.is_available ?? body.isAvailable ?? true,
  is_approved: false,
  provider_id,
});

const attachImages = async (listings) => {
  const ids = listings.map((l) => l.id);
  const imageMap = await getImagesByListingIds(ids);

  return listings.map((listing) => formatListing(listing, imageMap[listing.id] || []));
};

module.exports.listPublic = async (pagination, filters) => {
  const result = await findListings({ ...pagination, filters, publicOnly: true });
  const data = await attachImages(result.rows);
  return { ...result, data };
};

module.exports.listByCategory = async (categoryId, pagination) => {
  return module.exports.listPublic(pagination, { category_id: categoryId });
};

module.exports.getFeatured = async () => {
  const rows = await getFeaturedListings();
  return attachImages(rows);
};

module.exports.getPublicListing = async (id) => {
  const listing = await getListingById(id, { publicOnly: true });

  if (!listing) {
    throw new AppError("Listing not found", 404);
  }

  const imageMap = await getImagesByListingIds([listing.id]);
  return formatListing(listing, imageMap[listing.id] || []);
};

module.exports.getMyListings = async (providerId, pagination) => {
  const result = await findListings({
    ...pagination,
    filters: { provider_id: providerId },
    publicOnly: false,
  });

  const data = await attachImages(result.rows);
  return { ...result, data };
};

module.exports.createProviderListing = async (providerId, body) => {
  const category = await getCategoryById(body.category_id || body.categoryId);

  if (!category || !category.is_active) {
    throw new AppError("Invalid category", 400);
  }

  const listingId = await db.transaction(async (trx) => {
    const id = await createListing(trx, mapCreateBody(body, providerId));
    await replaceListingImages(trx, id, body.images || []);
    return id;
  });

  const listing = await getListingById(listingId);
  const imageMap = await getImagesByListingIds([listingId]);
  return formatListing(listing, imageMap[listingId] || []);
};

module.exports.updateProviderListing = async (providerId, id, body) => {
  const listing = await getListingById(id);

  if (!listing) {
    throw new AppError("Listing not found", 404);
  }

  if (Number(listing.provider_id) !== Number(providerId)) {
    throw new AppError("You do not have permission to perform this action", 403);
  }

  const updates = {};

  if (body.title !== undefined) updates.title = body.title;
  if (body.description !== undefined) updates.description = body.description;
  if (body.type !== undefined) updates.type = body.type;
  if (body.category_id !== undefined || body.categoryId !== undefined) {
    updates.category_id = body.category_id || body.categoryId;
  }
  if (body.location !== undefined) updates.location = body.location;
  if (body.price !== undefined) updates.price = body.price;
  if (body.is_available !== undefined || body.isAvailable !== undefined) {
    updates.is_available = body.is_available ?? body.isAvailable;
  }

  await db.transaction(async (trx) => {
    if (Object.keys(updates).length) {
      await trx("listings").where({ id }).update({ ...updates, updated_at: trx.fn.now() });
    }

    if (body.images) {
      await replaceListingImages(trx, id, body.images);
    }
  });

  const updated = await getListingById(id);
  const imageMap = await getImagesByListingIds([id]);
  return formatListing(updated, imageMap[id] || []);
};

module.exports.removeProviderListing = async (providerId, id) => {
  const listing = await getListingById(id);

  if (!listing) {
    throw new AppError("Listing not found", 404);
  }

  if (Number(listing.provider_id) !== Number(providerId)) {
    throw new AppError("You do not have permission to perform this action", 403);
  }

  await softDeleteListing(id);
};

module.exports.listPending = async (pagination) => {
  const result = await findListings({
    ...pagination,
    filters: { is_approved: false },
    publicOnly: false,
  });

  const data = await attachImages(result.rows);
  return { ...result, data };
};

module.exports.approveListing = async (id) => {
  const listing = await getListingById(id);

  if (!listing) {
    throw new AppError("Listing not found", 404);
  }

  await db("listings").where({ id }).update({ is_approved: true, updated_at: db.fn.now() });
  const updated = await getListingById(id);
  const imageMap = await getImagesByListingIds([id]);
  return formatListing(updated, imageMap[id] || []);
};

module.exports.rejectListing = async (id) => {
  const listing = await getListingById(id);

  if (!listing) {
    throw new AppError("Listing not found", 404);
  }

  await db("listings").where({ id }).update({ is_approved: false, is_available: false, updated_at: db.fn.now() });
};
