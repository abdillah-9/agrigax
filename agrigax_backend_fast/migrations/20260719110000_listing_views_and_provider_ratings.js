// 1) listings.views — simple page-load counter, incremented every time the
//    public listing detail endpoint is hit (a refresh counts again, by design).
// 2) provider_ratings — customer rates a vendor (not a listing) after
//    interacting with them via a booking. One rating per customer per vendor,
//    updatable (upsert), enforced by a unique constraint.
exports.up = async function (knex) {
  await knex.schema.alterTable("listings", (table) => {
    table.integer("views").unsigned().notNullable().defaultTo(0);
  });

  await knex.schema.createTable("provider_ratings", (table) => {
    table.bigIncrements("id").primary();

    table.bigInteger("provider_id").unsigned().notNullable().references("id").inTable("users");
    table.bigInteger("customer_id").unsigned().notNullable().references("id").inTable("users");

    table.tinyint("rating").unsigned().notNullable();
    table.text("comment").nullable();

    table.timestamps(true, true);

    table.unique(["provider_id", "customer_id"]);
    table.index(["provider_id"]);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("provider_ratings");
  await knex.schema.alterTable("listings", (table) => {
    table.dropColumn("views");
  });
};
