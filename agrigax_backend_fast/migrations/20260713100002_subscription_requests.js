exports.up = function (knex) {
  return knex.schema.createTable("subscription_requests", (col) => {
    col.bigIncrements("id").primary();

    col.bigInteger("vendor_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    col.bigInteger("plan_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("subscription_plans");

    col.bigInteger("payment_method")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("payment_methods");

    col.decimal("amount", 14, 2).notNullable();
    col.string("transaction_reference", 150).notNullable();
    col.string("receipt_url", 500).nullable();
    col.text("notes").nullable();

    col.enu("status", ["pending", "approved", "rejected", "expired"])
      .notNullable()
      .defaultTo("pending");

    col.bigInteger("verified_by")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("users");

    col.timestamp("verified_at").nullable();

    col.timestamps(true, true);

    col.index(["vendor_id"]);
    col.index(["status"]);
    col.index(["status", "created_at"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("subscription_requests");
};
