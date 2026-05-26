/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("users", (table) => {
    table.bigIncrements("id").primary();

    table.string("full_name", 100).notNullable();

    table.string("email", 100).notNullable().unique();

    table.string("phone", 20).nullable();

    table.string("password_hash").notNullable();

    table.string("avatar").nullable();

    table.enum("active_role", ["customer", "provider", "admin"]).defaultTo("customer");

    table.boolean("is_verified").defaultTo(false);
    table.boolean("is_suspended").defaultTo(false);

    table.timestamps(true, true);

    table.timestamp("deleted_at").nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("users");
};