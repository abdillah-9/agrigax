exports.up = function (knex) {
  return knex.schema.createTable("bookings", (col) => {
    col.bigIncrements("id").primary();

    col.bigInteger("listing_id")
      .unsigned()
      .references("id")
      .inTable("listings")
      .onDelete("CASCADE");

    col.bigInteger("customer_id")
      .unsigned()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    col.bigInteger("provider_id")
      .unsigned()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    col.enu("status", [
      "pending",
      "accepted",
      "rejected",
      "completed",
      "cancelled"
    ]).defaultTo("pending");

    col.timestamp("scheduled_at").nullable();

    col.text("notes").nullable();

    col.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("bookings");
};
