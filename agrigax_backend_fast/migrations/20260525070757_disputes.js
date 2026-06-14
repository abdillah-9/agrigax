exports.up = function (knex) {
  return knex.schema.createTable("disputes", (col) => {
    col.bigIncrements("id").primary();

    col.bigInteger("booking_id")
      .unsigned()
      .references("id")
      .inTable("bookings")
      .onDelete("CASCADE");

    col.bigInteger("raised_by")
      .unsigned()
      .references("id")
      .inTable("users");

    col.text("reason").notNullable();

    col.enu("status", ["open", "under_review", "resolved"])
      .defaultTo("open");

    col.text("resolution_note").nullable();

    col.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("disputes");
};
