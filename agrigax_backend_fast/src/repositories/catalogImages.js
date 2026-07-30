const db = require("../configs/db");

// ---------- catalog images ----------

module.exports.searchActiveImages = async ({ search, category_id, limit = 30 }) => {
  const query = db("catalog_images").where({ is_active: true });

  if (category_id) {
    query.where({ category_id });
  }

  if (search) {
    const term = `%${search}%`;
    query.where((builder) => {
      builder.where("name", "like", term).orWhere("keywords", "like", term);
    });
  }

  return query.orderBy("name", "asc").limit(limit);
};

module.exports.getAllImages = async ({ offset, limit }) => {
  const query = db("catalog_images").orderBy("name", "asc");
  const [{ count }] = await query.clone().count({ count: "*" });
  const rows = await query.offset(offset).limit(limit);
  return { rows, total: Number(count) };
};

module.exports.getImageById = async (id) => {
  return db("catalog_images").where({ id }).first();
};

module.exports.createImage = async (data) => {
  const [id] = await db("catalog_images").insert(data);
  return module.exports.getImageById(id);
};

module.exports.updateImage = async (id, updates) => {
  await db("catalog_images").where({ id }).update({ ...updates, updated_at: db.fn.now() });
  return module.exports.getImageById(id);
};

module.exports.deleteImage = async (id) => {
  await db("catalog_images").where({ id }).del();
};

// ---------- missed searches / product requests ----------

// Every zero-result vendor search lands here. Same term twice = hits + 1,
// so the admin sees demand ranked by how often vendors looked for it.
module.exports.recordMiss = async (term, vendorId, { requested = false } = {}) => {
  const normalized = term.trim().toLowerCase();
  if (!normalized) return null;

  const existing = await db("catalog_image_requests").where({ term: normalized }).first();

  if (existing) {
    const updates = {
      hits: existing.hits + 1,
      last_vendor_id: vendorId || existing.last_vendor_id,
      updated_at: db.fn.now(),
    };
    if (requested) updates.requested = true;
    // A new miss on a term the admin already handled re-opens it
    if (existing.status !== "pending") updates.status = "pending";

    await db("catalog_image_requests").where({ id: existing.id }).update(updates);
    return db("catalog_image_requests").where({ id: existing.id }).first();
  }

  const [id] = await db("catalog_image_requests").insert({
    term: normalized,
    requested,
    last_vendor_id: vendorId || null,
  });

  return db("catalog_image_requests").where({ id }).first();
};

module.exports.getRequests = async ({ offset, limit, status }) => {
  const query = db("catalog_image_requests")
    .orderBy([{ column: "requested", order: "desc" }, { column: "hits", order: "desc" }]);

  if (status) {
    query.where({ status });
  }

  const [{ count }] = await query.clone().clearOrder().count({ count: "*" });
  const rows = await query.offset(offset).limit(limit);
  return { rows, total: Number(count) };
};

module.exports.getRequestById = async (id) => {
  return db("catalog_image_requests").where({ id }).first();
};

module.exports.updateRequestStatus = async (id, status) => {
  await db("catalog_image_requests").where({ id }).update({ status, updated_at: db.fn.now() });
  return module.exports.getRequestById(id);
};
