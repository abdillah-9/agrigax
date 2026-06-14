exports.up = function (knex) {
  return knex.schema.createTable("notifications", (col) => {
    col.bigIncrements("id").primary();

    col.bigInteger("user_id")
      .unsigned()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    col.string("title").notNullable();

    col.text("body").notNullable();

    col.enu("type", [
      "booking",
      "payment",
      "message",
      "system",
      "promotion"
    ]).defaultTo("system");

    col.boolean("is_read").defaultTo(false);

    col.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("notifications");
};
