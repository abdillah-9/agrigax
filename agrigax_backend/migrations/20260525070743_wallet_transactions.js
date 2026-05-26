exports.up = function (knex) {
  return knex.schema.createTable("wallet_transactions", (col) => {
    col.bigIncrements("id").primary();

    col.bigInteger("wallet_id")
      .unsigned()
      .references("id")
      .inTable("wallets")
      .onDelete("CASCADE");

    col.enu("type", ["credit", "debit"]).notNullable();

    col.decimal("amount", 14, 2).notNullable();

    col.string("reference").nullable();

    col.text("description").nullable();

    col.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("wallet_transactions");
};
