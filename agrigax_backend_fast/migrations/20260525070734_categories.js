exports.up = function (knex) {
  return knex.schema.createTable("categories", (col) => {
    col.bigIncrements("id").primary();

    col.string("name", 100).notNullable();
    col.string("slug", 120).unique().notNullable();

    col.text("description").nullable();

    col.boolean("is_active").defaultTo(true);

    col.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("categories");
};
