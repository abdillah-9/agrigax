const AppError = require("../errors/AppError");
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../repositories/categories");

module.exports.listCategories = async (pagination) => {
  return getCategories({ ...pagination, activeOnly: true });
};

module.exports.getCategory = async (id) => {
  const category = await getCategoryById(id);

  if (!category || !category.is_active) {
    throw new AppError("Category not found", 404);
  }

  return category;
};

module.exports.createCategory = async (body) => {
  return createCategory({
    name: body.name,
    slug: body.slug,
    description: body.description || null,
    is_active: body.is_active ?? true,
  });
};

module.exports.updateCategory = async (id, body) => {
  const category = await getCategoryById(id);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return updateCategory(id, body);
};

module.exports.removeCategory = async (id) => {
  const category = await getCategoryById(id);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  await deleteCategory(id);
};

module.exports.adminListCategories = async (pagination) => {
  return getCategories({ ...pagination, activeOnly: false });
};
