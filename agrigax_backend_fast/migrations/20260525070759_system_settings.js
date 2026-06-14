exports.up = function (knex) {
  return knex.schema.createTable("system_settings", (col) => {
    col.bigIncrements("id").primary();

    col.string("key").unique().notNullable();

    col.text("value").notNullable();

    col.text("description").nullable();

    col.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("system_settings");
};
