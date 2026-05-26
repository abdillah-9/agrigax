/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("user",(col)=>{
        col.increments("id",{primaryKey:true});
        col.string('email',50).notNullable();
        col.string('password', 50).notNullable();
        col.enum('role',['customer', 'seller','admin']).defaultTo('customer');
        col.timestamps(true,true);
        col.timestamp('deleted_at',true).defaultTo(null);
    })
  
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {

    return knex.schema.dropTable('user');
  
};
