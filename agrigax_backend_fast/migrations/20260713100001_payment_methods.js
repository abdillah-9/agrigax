exports.up = function (knex) {
  return knex.schema.createTable("payment_methods", (col) => {
    col.bigIncrements("id").primary();

    col.string("name", 100).notNullable();
    col.enu("type", ["mobile_money", "bank_account", "other"]).notNullable();

    col.string("account_name", 150).nullable();
    col.string("account_number", 100).nullable();
    col.string("phone_number", 20).nullable();

    col.text("instructions").nullable();

    col.integer("display_order").unsigned().notNullable().defaultTo(0);
    col.boolean("is_active").notNullable().defaultTo(true);

    col.timestamps(true, true);

    col.index(["is_active"]);
    col.index(["display_order"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("payment_methods");
};
