exports.up = function (knex) {
  return knex.schema.alterTable("listings", (table) => {
    table.string("location", 255).notNullable().defaultTo("");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("listings", (table) => {
    table.dropColumn("location");
  });
};
