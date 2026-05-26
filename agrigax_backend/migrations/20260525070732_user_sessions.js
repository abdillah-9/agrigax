/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("user_sessions", (col) => {
    col.bigIncrements("id").primary();

    col.bigInteger("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    // Store hashed refresh token (IMPORTANT: not raw token)
    col.string("refresh_token_hash").notNullable();

    // Optional but useful even now
    col.string("ip_address").nullable();
    col.string("user_agent").nullable();

    col.boolean("is_revoked").defaultTo(false);

    col.timestamp("expires_at").notNullable();

    col.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("user_sessions");
};