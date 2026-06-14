exports.up = function (knex) {
  return knex.schema.createTable("messages", (col) => {
    col.bigIncrements("id").primary();

    col.bigInteger("conversation_id")
      .unsigned()
      .references("id")
      .inTable("conversations")
      .onDelete("CASCADE");

    col.bigInteger("sender_id")
      .unsigned()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    col.text("message").notNullable();

    col.boolean("is_read").defaultTo(false);

    col.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("messages");
};
