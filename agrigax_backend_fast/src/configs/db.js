const knex = require('knex');
require('dotenv').config({ quiet: true });
const knexFileConfig = require('../../knexfile');
const db = knex( knexFileConfig['development']);

module.exports = db;
