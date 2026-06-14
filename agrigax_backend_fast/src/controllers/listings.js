const {
  listPublic,
  listByCategory,
  getFeatured,
  getPublicListing,
  getMyListings,
  createProviderListing,
  updateProviderListing,
  removeProviderListing,
} = require("../services/listings");
const { sendSuccess, sendPaginated } = require("../utils/response");
const { parsePagination, buildPagination } = require("../utils/pagination");

module.exports.getListings = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const filters = {
      category_id: req.query.category_id || req.query.categoryId,
      type: req.query.type,
      location: req.query.location,
    };

    const { data, total } = await listPublic({ offset, limit }, filters);

    return sendPaginated(res, data, buildPagination(page, limit, total), "Listings fetched");
  } catch (e) {
    next(e);
  }
};

module.exports.getFeatured = async (req, res, next) => {
  try {
    const data = await getFeatured();
    return sendSuccess(res, data, "Featured listings fetched");
  } catch (e) {
    next(e);
  }
};

module.exports.getByCategory = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { data, total } = await listByCategory(req.params.cat, { offset, limit });

    return sendPaginated(res, data, buildPagination(page, limit, total), "Category listings fetched");
  } catch (e) {
    next(e);
  }
};

module.exports.getById = async (req, res, next) => {
  try {
    const listing = await getPublicListing(req.params.id);
    return sendSuccess(res, listing, "Listing fetched");
  } catch (e) {
    next(e);
  }
};

module.exports.getMyListings = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { data, total } = await getMyListings(req.user.id, { offset, limit });

    return sendPaginated(res, data, buildPagination(page, limit, total), "Your listings fetched");
  } catch (e) {
    next(e);
  }
};

module.exports.createListing = async (req, res, next) => {
  try {
    const listing = await createProviderListing(req.user.id, req.body);
    return sendSuccess(res, listing, "Listing created and pending approval", 201);
  } catch (e) {
    next(e);
  }
};

module.exports.updateListing = async (req, res, next) => {
  try {
    const listing = await updateProviderListing(req.user.id, req.params.id, req.body);
    return sendSuccess(res, listing, "Listing updated");
  } catch (e) {
    next(e);
  }
};

module.exports.deleteListing = async (req, res, next) => {
  try {
    await removeProviderListing(req.user.id, req.params.id);
    return sendSuccess(res, null, "Listing removed");
  } catch (e) {
    next(e);
  }
};
