/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("user_roles", (table) => {
    table.bigIncrements("id").primary();

    table
      .bigInteger("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    table.enum("role", ["customer", "provider", "admin"]).notNullable();

    // allows multiple roles later if needed
    table.boolean("is_active").defaultTo(true);

    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("user_roles");
};
