// Curated image catalog — no user uploads. Images are static files shipped
// with the frontend (public/catalog/*), the DB only stores the path.
//
// catalog_image_requests doubles as the "missed search" log: every provider
// search that returns zero results is recorded here (deduplicated by term,
// with a hit counter), and a vendor can also explicitly request a product.
exports.up = async function (knex) {
  await knex.schema.createTable("catalog_images", (table) => {
    table.bigIncrements("id").primary();
    table.string("name", 100).notNullable();
    // extra search words, comma separated (e.g. "beans,haricot" for maharage)
    table.string("keywords", 255).nullable();
    table.bigInteger("category_id").unsigned().nullable().references("id").inTable("categories");
    table.string("url", 500).notNullable();
    table.boolean("is_active").notNullable().defaultTo(true);
    table.timestamps(true, true);

    table.index(["is_active"]);
  });

  await knex.schema.createTable("catalog_image_requests", (table) => {
    table.bigIncrements("id").primary();
    table.string("term", 150).notNullable().unique();
    // how many times vendors searched this and found nothing
    table.integer("hits").unsigned().notNullable().defaultTo(1);
    // true when a vendor pressed "Request this product" (not just a silent miss)
    table.boolean("requested").notNullable().defaultTo(false);
    table.bigInteger("last_vendor_id").unsigned().nullable().references("id").inTable("users");
    table.enum("status", ["pending", "added", "dismissed"]).notNullable().defaultTo("pending");
    table.timestamps(true, true);

    table.index(["status"]);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("catalog_image_requests");
  await knex.schema.dropTableIfExists("catalog_images");
};
