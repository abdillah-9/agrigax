// Retires the payments/wallet modules per docs/01-subscription-requirements-v2.md §2:
// neither had real gateway integration, and both are replaced by the manual
// subscription system in the 5 migrations preceding this one. Kept as its own
// migration, independent of those additive ones, per docs/06-deployment-guide.md §5.

exports.up = async function (knex) {
  await knex.schema.dropTableIfExists("wallet_transactions");
  await knex.schema.dropTableIfExists("wallets");
  await knex.schema.dropTableIfExists("payments");
};

exports.down = async function (knex) {
  await knex.schema.createTable("payments", (col) => {
    col.bigIncrements("id").primary();

    col.bigInteger("booking_id")
      .unsigned()
      .references("id")
      .inTable("bookings")
      .onDelete("CASCADE");

    col.bigInteger("payer_id").unsigned().references("id").inTable("users");
    col.bigInteger("receiver_id").unsigned().references("id").inTable("users");

    col.decimal("amount", 14, 2).notNullable();
    col.enu("status", ["pending", "paid", "failed", "refunded"]).defaultTo("pending");
    col.string("method").nullable();
    col.string("transaction_ref").nullable();

    col.timestamps(true, true);
  });

  await knex.schema.createTable("wallets", (col) => {
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

  await knex.schema.createTable("wallet_transactions", (col) => {
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
