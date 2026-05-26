exports.up = function (knex) {
  return knex.schema.createTable("reviews", (col) => {
    col.bigIncrements("id").primary();

    col.bigInteger("listing_id")
      .unsigned()
      .references("id")
      .inTable("listings")
      .onDelete("CASCADE");

    col.bigInteger("user_id")
      .unsigned()
      .references("id")
      .inTable("users");

    col.bigInteger("rating").notNullable();

    col.text("comment").nullable();

    col.boolean("is_approved").defaultTo(true);

    col.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("reviews");
};
