exports.up = async function (knex) {
  await knex.schema.alterTable("auth_otps", (table) => {
    table
      .bigInteger("user_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    table.string("phone", 20).nullable();
    table.string("email", 100).nullable().alter();
  });

  await knex.schema.alterTable("auth_otps", (table) => {
    table.index(["user_id", "purpose"]);
    table.index(["phone", "purpose"]);
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("auth_otps", (table) => {
    table.dropIndex(["user_id", "purpose"]);
    table.dropIndex(["phone", "purpose"]);
    table.dropColumn("user_id");
    table.dropColumn("phone");
    table.string("email", 100).notNullable().alter();
  });
};
