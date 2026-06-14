exports.up = function (knex) {
  return knex.schema.createTable("auth_otps", (col) => {
    col.bigIncrements("id").primary();
    col.string("email", 100).notNullable();
    col.string("otp_hash").notNullable();
    col.enu("purpose", ["registration", "password_reset"]).notNullable();
    col.timestamp("expires_at").notNullable();
    col.timestamp("used_at").nullable();
    col.timestamps(true, true);

    col.index(["email", "purpose"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("auth_otps");
};
