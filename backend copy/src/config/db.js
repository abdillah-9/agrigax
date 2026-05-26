const knexfile = require("../../knexfile")
require('dotenv').config();
const knex = require('knex');

//Create DB  config
const knexfileConfig = knexfile[process.env.NODE_ENV || "development"];

module.exports = knex(knexfileConfig);
