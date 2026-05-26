require('dotenv').config();
const db = require('../config/db');

/********************** SIGN-IN REPOSITORIES ********************** */

// Get user by email
module.exports.getUserByEmail = async ({ email }) => {
    return db('user')
        .where({ email })
        .first(); // ✅ no transaction needed
};

// Update refresh token
module.exports.updateRefreshToken = async ({ id, refreshToken }) => {
    return db('token')
        .where({ userId: id }) // ✅ correct column
        .update({ refreshToken });
};

/********************** SIGN-UP REPOSITORIES ********************** */

// Create user
module.exports.createUser = async ({ data }) => {
    const [userId] = await db('user')
        .insert(data)
        .returning('id'); // ✅ important for Postgres

    return userId;
};

// Insert refresh token
module.exports.insertRefreshToken = async ({ id, refreshToken }) => {
    return db('token').insert({
        userId: id,
        refreshToken
    });
};

/********************** SIGN-OUT REPOSITORIES ********************** */

module.exports.userSignOut = async ({ userId }) => {
    return db('token')
        .where({ userId })
        .delete(); // ✅ not inside fake trx
};

/*********************** CHECK SESSION **************************/

module.exports.getRefreshTokenByUserId = async ({ userId }) => {
    return db('token')
        .where({ userId })
        .first(); // ✅ return single token row
};