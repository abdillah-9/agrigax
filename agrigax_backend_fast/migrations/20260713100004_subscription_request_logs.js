exports.up = function (knex) {
  return knex.schema.createTable("subscription_request_logs", (col) => {
    col.bigIncrements("id").primary();

    col.bigInteger("request_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("subscription_requests")
      .onDelete("CASCADE");

    col.bigInteger("admin_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users");

    col.enu("action", ["approved", "rejected"]).notNullable();
    col.text("comment").nullable();

    // Append-only audit trail — no updated_at by design. See docs/04-database-schema.md §6.
    col.timestamp("created_at").notNullable().defaultTo(knex.fn.now());

    col.index(["request_id"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("subscription_request_logs");
};
