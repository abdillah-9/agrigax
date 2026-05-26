/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {

    return knex.schema.createTable('token', (col)=>{
      col.increments('id');
      col.string('access_token');
      col.integer('user_id').unsigned().notNullable().references('id').inTable('user').onDelete('CASCADE').onUpdate('CASCADE');
      col.timestamps(true, true);
      col.timestamp('deleted_at',true).defaultTo(null);
    }); 
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {

    return knex.schema.dropTable('token');
  
};
