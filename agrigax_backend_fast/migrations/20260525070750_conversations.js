exports.up = function (knex) {
  return knex.schema.createTable("conversations", (col) => {
    col.bigIncrements("id").primary();

    col.bigInteger("user_one_id")
      .unsigned()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    col.bigInteger("user_two_id")
      .unsigned()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    col.bigInteger("listing_id")
      .unsigned()
      .references("id")
      .inTable("listings")
      .nullable()
      .onDelete("SET NULL");

    col.timestamp("last_message_at").nullable();

    col.timestamps(true, true);

    col.unique(["user_one_id", "user_two_id", "listing_id"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("conversations");
};
