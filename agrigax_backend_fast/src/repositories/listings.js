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

// Great-circle distance in km between a point and each listing (haversine via
// spherical law of cosines) — raw SQL fragment with parameter placeholders.
const DISTANCE_SQL =
  "(6371 * ACOS(LEAST(1, COS(RADIANS(?)) * COS(RADIANS(listings.latitude)) * COS(RADIANS(listings.longitude) - RADIANS(?)) + SIN(RADIANS(?)) * SIN(RADIANS(listings.latitude)))))";

module.exports.findListings = async ({ offset, limit, filters = {}, publicOnly = true }) => {
  const query = db("listings").select(listingSelect);

  // Nearby mode: only listings with coordinates, annotated with distance_km,
  // optionally capped to a radius, sorted nearest first.
  const lat = Number(filters.lat);
  const lng = Number(filters.lng);
  const nearby =
    filters.lat !== undefined && filters.lng !== undefined &&
    Number.isFinite(lat) && Number.isFinite(lng);

  if (nearby) {
    query.select(db.raw(`${DISTANCE_SQL} as distance_km`, [lat, lng, lat]));
    query.whereNotNull("listings.latitude").whereNotNull("listings.longitude");

    const radius = Number(filters.radius_km);
    if (Number.isFinite(radius) && radius > 0) {
      query.whereRaw(`${DISTANCE_SQL} <= ?`, [lat, lng, lat, radius]);
    }
  }

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

  // Smart search / typeahead: one term matched against title, description
  // and location so typing e.g. "maharage" surfaces every relevant listing.
  if (filters.search) {
    const term = `%${filters.search}%`;
    query.where((builder) => {
      builder
        .where("listings.title", "like", term)
        .orWhere("listings.description", "like", term)
        .orWhere("listings.location", "like", term);
    });
  }

  if (filters.provider_id) {
    query.where({ "listings.provider_id": filters.provider_id });
  }

  if (filters.is_approved === false) {
    query.where({ "listings.is_approved": false });
  }

  // Count before ordering: in nearby mode the ORDER BY references the
  // distance_km alias, which wouldn't exist in the cleared-select count query.
  const [{ count }] = await query.clone().clearSelect().count({ count: "*" });

  if (nearby) {
    query.orderByRaw(`${DISTANCE_SQL} asc`, [lat, lng, lat]);
  } else {
    query.orderBy("listings.created_at", "desc");
  }

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

// Page-load view counter — every hit on the public detail endpoint counts,
// including refreshes (product decision, not a bug).
module.exports.incrementViews = async (id) => {
  await db("listings").where({ id }).increment("views", 1);
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
