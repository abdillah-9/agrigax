const db = require("../configs/db");

module.exports.findByProviderAndCustomer = async (provider_id, customer_id) => {
  return db("provider_ratings").where({ provider_id, customer_id }).first();
};

// One rating per (provider, customer) — re-rating updates the existing row.
module.exports.upsertRating = async ({ provider_id, customer_id, rating, comment = null }) => {
  const existing = await module.exports.findByProviderAndCustomer(provider_id, customer_id);

  if (existing) {
    await db("provider_ratings")
      .where({ id: existing.id })
      .update({ rating, comment, updated_at: db.fn.now() });
    return module.exports.findByProviderAndCustomer(provider_id, customer_id);
  }

  await db("provider_ratings").insert({ provider_id, customer_id, rating, comment });
  return module.exports.findByProviderAndCustomer(provider_id, customer_id);
};

module.exports.getAggregateForProvider = async (provider_id) => {
  const [row] = await db("provider_ratings")
    .where({ provider_id })
    .avg({ average: "rating" })
    .count({ count: "*" });

  return {
    average: row.average !== null ? Number(row.average) : 0,
    count: Number(row.count),
  };
};

// Whether this customer has actually interacted with the vendor — defined as
// having a booking with them that the vendor acted on (accepted or completed).
// A merely-pending or rejected request doesn't unlock rating.
module.exports.hasInteraction = async (provider_id, customer_id) => {
  const booking = await db("bookings")
    .where({ provider_id, customer_id })
    .whereIn("status", ["accepted", "completed"])
    .first();

  return Boolean(booking);
};
