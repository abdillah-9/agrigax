exports.up = function (knex) {
  return knex.schema.createTable("vendor_subscriptions", (col) => {
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

    // pending is reserved for future use (future-dated start, scheduled plan
    // change, migration) — no v2 flow produces it yet. See docs/04-database-schema.md §5.
    col.enu("status", ["pending", "active", "expired", "cancelled"]).notNullable();

    col.timestamp("start_date").notNullable();

    // null only for the row on whichever plan is flagged is_default_vendor_plan —
    // that plan is permanent and never expires. See docs/09-business-rules.md BR-027.
    col.timestamp("end_date").nullable();

    col.bigInteger("created_from_request_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("subscription_requests");

    col.timestamps(true, true);

    col.index(["vendor_id", "status"]);
    col.index(["status", "end_date"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("vendor_subscriptions");
};
