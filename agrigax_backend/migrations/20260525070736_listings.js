exports.up = function (knex) {
  return knex.schema.createTable("listings", (col) => {
    col.bigIncrements("id").primary();

    col.string("title", 150).notNullable();
    col.text("description").notNullable();

    col.enu("type", ["service", "product", "worker", "equipment", "livestock"])
      .notNullable();

    col.bigInteger("category_id")
      .unsigned()
      .references("id")
      .inTable("categories")
      .onDelete("SET NULL");

    col.decimal("price", 12, 2).defaultTo(0);

    col.boolean("is_available").defaultTo(true);
    col.boolean("is_approved").defaultTo(false);

    col.bigInteger("rating_avg").defaultTo(0);
    col.bigInteger("rating_count").defaultTo(0);

    col.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("listings");
};
