const {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  removeCategory,
} = require("../services/categories");
const { formatCategory } = require("../utils/formatters");
const { sendSuccess, sendPaginated } = require("../utils/response");
const { parsePagination, buildPagination } = require("../utils/pagination");

module.exports.getCategories = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { rows, total } = await listCategories({ offset, limit });

    return sendPaginated(
      res,
      rows.map(formatCategory),
      buildPagination(page, limit, total),
      "Categories fetched"
    );
  } catch (e) {
    next(e);
  }
};

module.exports.getCategoryById = async (req, res, next) => {
  try {
    const category = await getCategory(req.params.id);
    return sendSuccess(res, formatCategory(category), "Category fetched");
  } catch (e) {
    next(e);
  }
};

module.exports.createCategory = async (req, res, next) => {
  try {
    const category = await createCategory(req.body);
    return sendSuccess(res, formatCategory(category), "Category created", 201);
  } catch (e) {
    next(e);
  }
};

module.exports.updateCategory = async (req, res, next) => {
  try {
    const category = await updateCategory(req.params.id, req.body);
    return sendSuccess(res, formatCategory(category), "Category updated");
  } catch (e) {
    next(e);
  }
};

module.exports.deleteCategory = async (req, res, next) => {
  try {
    await removeCategory(req.params.id);
    return sendSuccess(res, null, "Category deactivated");
  } catch (e) {
    next(e);
  }
};
