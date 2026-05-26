exports.up = function (knex) {
  return knex.schema.createTable("payments", (col) => {
    col.bigIncrements("id").primary();

    col.bigInteger("booking_id")
      .unsigned()
      .references("id")
      .inTable("bookings")
      .onDelete("CASCADE");

    col.bigInteger("payer_id")
      .unsigned()
      .references("id")
      .inTable("users");

    col.bigInteger("receiver_id")
      .unsigned()
      .references("id")
      .inTable("users");

    col.decimal("amount", 14, 2).notNullable();

    col.enu("status", ["pending", "paid", "failed", "refunded"])
      .defaultTo("pending");

    col.string("method").nullable();

    col.string("transaction_ref").nullable();

    col.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("payments");
};
