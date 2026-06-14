exports.up = async function (knex) {
  await knex.schema.alterTable("users", (table) => {
    table.string("username", 50).nullable().unique();
  });

  const users = await knex("users").select("id", "email", "phone");

  for (const user of users) {
    const fallback = user.email?.split("@")[0] || user.phone?.replace(/\D/g, "") || `user${user.id}`;
    const username = `${fallback}${user.id}`.slice(0, 50);

    await knex("users").where({ id: user.id }).update({ username });
  }

  await knex.schema.alterTable("users", (table) => {
    table.string("username", 50).notNullable().alter();
    table.string("email", 100).nullable().alter();
  });

  await knex("users").whereNull("phone").orWhere({ phone: "" }).update({ phone: knex.raw("CONCAT('+255000000', id)") });

  await knex.schema.alterTable("users", (table) => {
    table.string("phone", 20).notNullable().alter();
    table.unique(["phone"]);
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("users", (table) => {
    table.dropUnique(["phone"]);
    table.string("phone", 20).nullable().alter();
    table.string("email", 100).notNullable().alter();
    table.dropColumn("username");
  });
};
