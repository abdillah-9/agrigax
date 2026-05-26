exports.up = function (knex) {
  return knex.schema.createTable("listing_images", (col) => {
    col.bigIncrements("id").primary();

    col.bigInteger("listing_id")
      .unsigned()
      .references("id")
      .inTable("listings")
      .onDelete("CASCADE");

    col.string("url").notNullable();
    col.boolean("is_primary").defaultTo(false);

    col.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("listing_images");
};
