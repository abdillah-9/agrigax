const AppError = require("../errors/AppError");
const {
  searchActiveImages,
  getAllImages,
  getImageById,
  createImage,
  updateImage,
  deleteImage,
  recordMiss,
  getRequests,
  getRequestById,
  updateRequestStatus,
} = require("../repositories/catalogImages");

// Vendor-facing: search the curated catalog. A search that finds nothing is
// silently logged so the admin can see what vendors were looking for.
module.exports.searchCatalog = async ({ search, category_id, limit }, vendorId) => {
  const images = await searchActiveImages({ search, category_id, limit });

  if (search && search.trim() && images.length === 0) {
    await recordMiss(search, vendorId);
  }

  return images;
};

// Vendor explicitly asks the app owner to add a product image.
module.exports.requestProduct = async (vendorId, term) => {
  const request = await recordMiss(term, vendorId, { requested: true });

  if (!request) {
    throw new AppError("A product name is required", 400);
  }

  return request;
};

// ---------- admin ----------

module.exports.listAllImages = async (pagination) => {
  return getAllImages(pagination);
};

module.exports.addImage = async (body) => {
  return createImage({
    name: body.name,
    keywords: body.keywords || null,
    category_id: body.category_id || body.categoryId || null,
    url: body.url,
    is_active: body.is_active ?? body.isActive ?? true,
  });
};

module.exports.editImage = async (id, body) => {
  const image = await getImageById(id);

  if (!image) {
    throw new AppError("Catalog image not found", 404);
  }

  const updates = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.keywords !== undefined) updates.keywords = body.keywords || null;
  if (body.category_id !== undefined || body.categoryId !== undefined) {
    updates.category_id = body.category_id ?? body.categoryId ?? null;
  }
  if (body.url !== undefined) updates.url = body.url;
  if (body.is_active !== undefined || body.isActive !== undefined) {
    updates.is_active = body.is_active ?? body.isActive;
  }

  return updateImage(id, updates);
};

module.exports.removeImage = async (id) => {
  const image = await getImageById(id);

  if (!image) {
    throw new AppError("Catalog image not found", 404);
  }

  await deleteImage(id);
};

module.exports.listRequests = async (pagination, status) => {
  return getRequests({ ...pagination, status });
};

module.exports.resolveRequest = async (id, status) => {
  const request = await getRequestById(id);

  if (!request) {
    throw new AppError("Request not found", 404);
  }

  return updateRequestStatus(id, status);
};
