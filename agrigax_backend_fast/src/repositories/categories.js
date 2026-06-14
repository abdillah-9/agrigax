const db = require("../configs/db");

const slugify = (value) =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

module.exports.getCategories = async ({ offset, limit, activeOnly = true }) => {
  const query = db("categories").select("*").orderBy("name", "asc");

  if (activeOnly) {
    query.where({ is_active: true });
  }

  const [{ count }] = await query.clone().clearSelect().count({ count: "*" });
  const rows = await query.offset(offset).limit(limit);

  return { rows, total: Number(count) };
};

module.exports.getCategoryById = async (id) => {
  return db("categories").where({ id }).first();
};

module.exports.createCategory = async (data) => {
  const slug = data.slug || slugify(data.name);
  const [id] = await db("categories").insert({ ...data, slug });
  return module.exports.getCategoryById(id);
};

module.exports.updateCategory = async (id, updates) => {
  if (updates.name && !updates.slug) {
    updates.slug = slugify(updates.name);
  }

  await db("categories").where({ id }).update({ ...updates, updated_at: db.fn.now() });
  return module.exports.getCategoryById(id);
};

module.exports.deleteCategory = async (id) => {
  await db("categories").where({ id }).update({ is_active: false, updated_at: db.fn.now() });
};

module.exports.countCategories = async () => {
  const [{ count }] = await db("categories").count({ count: "*" });
  return Number(count);
};
