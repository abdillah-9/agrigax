exports.up = function (knex) {
  return knex.schema.alterTable("listings", (table) => {
    table
      .bigInteger("provider_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("listings", (table) => {
    table.dropForeign(["provider_id"]);
    table.dropColumn("provider_id");
  });
};