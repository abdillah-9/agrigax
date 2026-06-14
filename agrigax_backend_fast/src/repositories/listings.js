const db = require("../configs/db");

const listingSelect = "listings.*";

const applyPublicFilters = (query) => {
  query.where({ "listings.is_approved": true, "listings.is_available": true });
};

module.exports.getImagesByListingIds = async (listingIds) => {
  if (!listingIds.length) return {};

  const rows = await db("listing_images").whereIn("listing_id", listingIds).orderBy("id", "asc");
  const map = {};

  for (const row of rows) {
    if (!map[row.listing_id]) map[row.listing_id] = [];
    map[row.listing_id].push(row);
  }

  return map;
};

module.exports.replaceListingImages = async (trx, listing_id, urls = []) => {
  await trx("listing_images").where({ listing_id }).del();

  if (!urls.length) return;

  const rows = urls.map((url, index) => ({
    listing_id,
    url,
    is_primary: index === 0,
  }));

  await trx("listing_images").insert(rows);
};

module.exports.findListings = async ({ offset, limit, filters = {}, publicOnly = true }) => {
  const query = db("listings").select(listingSelect);

  if (publicOnly) {
    applyPublicFilters(query);
  }

  if (filters.category_id) {
    query.where({ "listings.category_id": filters.category_id });
  }

  if (filters.type) {
    query.where({ "listings.type": filters.type });
  }

  if (filters.location) {
    query.where("listings.location", "like", `%${filters.location}%`);
  }

  if (filters.provider_id) {
    query.where({ "listings.provider_id": filters.provider_id });
  }

  if (filters.is_approved === false) {
    query.where({ "listings.is_approved": false });
  }

  query.orderBy("listings.created_at", "desc");

  const [{ count }] = await query.clone().clearSelect().count({ count: "*" });
  const rows = await query.offset(offset).limit(limit);

  return { rows, total: Number(count) };
};

module.exports.getListingById = async (id, { publicOnly = false } = {}) => {
  const query = db("listings").where({ id });

  if (publicOnly) {
    applyPublicFilters(query);
  }

  return query.first();
};

module.exports.getFeaturedListings = async (limit = 10) => {
  return db("listings")
    .where({ is_approved: true, is_available: true })
    .orderBy("rating_avg", "desc")
    .limit(limit);
};

module.exports.createListing = async (trx, data) => {
  const [id] = await trx("listings").insert(data);
  return id;
};

module.exports.updateListing = async (id, updates) => {
  await db("listings").where({ id }).update({ ...updates, updated_at: db.fn.now() });
  return module.exports.getListingById(id);
};

module.exports.softDeleteListing = async (id) => {
  await db("listings").where({ id }).update({ is_available: false, updated_at: db.fn.now() });
};

module.exports.countListings = async () => {
  const [{ count }] = await db("listings").count({ count: "*" });
  return Number(count);
};

module.exports.countPendingListings = async () => {
  const [{ count }] = await db("listings").where({ is_approved: false }).count({ count: "*" });
  return Number(count);
};

module.exports.setListingApproval = async (id, is_approved) => {
  await db("listings").where({ id }).update({ is_approved, updated_at: db.fn.now() });
  return module.exports.getListingById(id);
};
