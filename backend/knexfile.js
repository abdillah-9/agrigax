require('dotenv').config();

// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {

  development: {
    client: process.env.DBCLIENT,
    connection: {
      database: process.env.DBNAME,
      user:     process.env.UNAME,
      password: process.env.PWORD
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: process.env.MIGRATION_TABLE
    }
  },

  staging: {
    client: process.env.DBCLIENT,
    connection: {
      database: process.env.DBNAME,
      user:     process.env.UNAME,
      password: process.env.PWORD
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: process.env.MIGRATION_TABLE
    }
  },

  production: {
    client: process.env.DBCLIENT,
    connection: {
      database: process.env.DBNAME,
      user:     process.env.UNAME,
      password: process.env.PWORD
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: process.env.MIGRATION_TABLE
    }
  },

  test: {
    client: process.env.DBCLIENT,
    connection: {
      database: process.env.DBNAME,
      user:     process.env.UNAME,
      password: process.env.PWORD
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: process.env.MIGRATION_TABLE
    }
  }

};
