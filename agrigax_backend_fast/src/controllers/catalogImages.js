const {
  searchCatalog,
  requestProduct,
  listAllImages,
  addImage,
  editImage,
  removeImage,
  listRequests,
  resolveRequest,
} = require("../services/catalogImages");
const { formatCatalogImage, formatCatalogImageRequest } = require("../utils/formatters");
const { sendSuccess, sendPaginated } = require("../utils/response");
const { parsePagination, buildPagination } = require("../utils/pagination");

// ---------- vendor ----------

module.exports.search = async (req, res, next) => {
  try {
    const images = await searchCatalog(
      {
        search: req.query.search,
        category_id: req.query.category_id || req.query.categoryId,
        limit: Math.min(Number(req.query.limit) || 30, 60),
      },
      req.user.id
    );

    return sendSuccess(res, images.map(formatCatalogImage), "Catalog images fetched");
  } catch (e) {
    next(e);
  }
};

module.exports.requestImage = async (req, res, next) => {
  try {
    const request = await requestProduct(req.user.id, req.body.term);
    return sendSuccess(res, formatCatalogImageRequest(request), "Request sent to the app owner");
  } catch (e) {
    next(e);
  }
};

// ---------- admin ----------

module.exports.adminList = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { rows, total } = await listAllImages({ offset, limit });

    return sendPaginated(
      res,
      rows.map(formatCatalogImage),
      buildPagination(page, limit, total),
      "Catalog images fetched"
    );
  } catch (e) {
    next(e);
  }
};

module.exports.adminCreate = async (req, res, next) => {
  try {
    const image = await addImage(req.body);
    return sendSuccess(res, formatCatalogImage(image), "Catalog image created", 201);
  } catch (e) {
    next(e);
  }
};

module.exports.adminUpdate = async (req, res, next) => {
  try {
    const image = await editImage(req.params.id, req.body);
    return sendSuccess(res, formatCatalogImage(image), "Catalog image updated");
  } catch (e) {
    next(e);
  }
};

module.exports.adminDelete = async (req, res, next) => {
  try {
    await removeImage(req.params.id);
    return sendSuccess(res, null, "Catalog image deleted");
  } catch (e) {
    next(e);
  }
};

module.exports.adminListRequests = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { rows, total } = await listRequests({ offset, limit }, req.query.status);

    return sendPaginated(
      res,
      rows.map(formatCatalogImageRequest),
      buildPagination(page, limit, total),
      "Catalog requests fetched"
    );
  } catch (e) {
    next(e);
  }
};

module.exports.adminResolveRequest = async (req, res, next) => {
  try {
    const request = await resolveRequest(req.params.id, req.body.status);
    return sendSuccess(res, formatCatalogImageRequest(request), "Request updated");
  } catch (e) {
    next(e);
  }
};
