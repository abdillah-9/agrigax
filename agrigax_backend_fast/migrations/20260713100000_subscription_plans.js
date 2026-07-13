exports.up = function (knex) {
  return knex.schema.createTable("subscription_plans", (col) => {
    col.bigIncrements("id").primary();

    col.string("name", 100).notNullable();
    col.text("description").notNullable();

    col.decimal("price", 14, 2).notNullable().defaultTo(0);
    col.string("currency", 10).notNullable().defaultTo("TZS");

    col.integer("duration_days").unsigned().notNullable();

    col.json("features").notNullable();
    col.json("limits").notNullable();

    col.boolean("is_default_vendor_plan").notNullable().defaultTo(false);
    col.boolean("is_active").notNullable().defaultTo(true);

    col.timestamps(true, true);

    col.index(["is_active"]);
    col.index(["is_default_vendor_plan"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("subscription_plans");
};
