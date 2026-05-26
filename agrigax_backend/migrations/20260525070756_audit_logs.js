exports.up = function (knex) {
  return knex.schema.createTable("audit_logs", (col) => {
    col.bigIncrements("id").primary();

    col.bigInteger("user_id")
      .unsigned()
      .references("id")
      .inTable("users")
      .nullable()
      .onDelete("SET NULL");

    col.string("action").notNullable();

    col.string("entity_type").nullable();

    col.bigInteger("entity_id").nullable();

    col.text("metadata").nullable();

    col.string("ip_address").nullable();

    col.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("audit_logs");
};
