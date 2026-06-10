exports.up = function(knex) {
  return knex.schema.alterTable("user_sessions", (table) => {
    table.dropColumn("expires_at");
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable("user_sessions", (table) => {
    table.timestamp("expires_at").notNullable();
  });
};