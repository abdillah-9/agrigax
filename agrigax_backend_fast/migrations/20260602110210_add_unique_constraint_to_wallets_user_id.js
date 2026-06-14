exports.up = function (knex) {
  return knex.schema.alterTable("wallets", (table) => {
    table.unique(["user_id"]);
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("wallets", (table) => {
    table.dropUnique(["user_id"]);
  });
};

