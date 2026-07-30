// Real map coordinates for listings, set by the vendor via the map picker.
// Nullable: listings created before this feature (or typed without picking a
// place) have no coordinates and simply won't appear in "nearby" results.
exports.up = async function (knex) {
  await knex.schema.alterTable("listings", (table) => {
    table.decimal("latitude", 10, 7).nullable();
    table.decimal("longitude", 10, 7).nullable();
    table.index(["latitude", "longitude"]);
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("listings", (table) => {
    table.dropIndex(["latitude", "longitude"]);
    table.dropColumn("latitude");
    table.dropColumn("longitude");
  });
};
