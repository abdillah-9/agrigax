exports.up = function (knex) {
  return knex.schema.createTable("wallets", (col) => {
    col.bigIncrements("id").primary();

    col.bigInteger("user_id")
      .unsigned()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    col.decimal("balance", 14, 2).defaultTo(0);

    col.enu("currency", ["TZS", "USD"]).defaultTo("TZS");

    col.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("wallets");
};
