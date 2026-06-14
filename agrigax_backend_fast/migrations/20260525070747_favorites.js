exports.up = function (knex) {
  return knex.schema.createTable("favorites", (col) => {
    col.bigIncrements("id").primary();

    col.bigInteger("user_id")
      .unsigned()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    col.bigInteger("listing_id")
      .unsigned()
      .references("id")
      .inTable("listings")
      .onDelete("CASCADE");

    col.timestamps(true, true);

    col.unique(["user_id", "listing_id"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("favorites");
};
