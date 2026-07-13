const db = require('../configs/db');

module.exports.getUserByEmail = async (email) => {
    try {
        const [query] = await db('users')
            .select('*')
            .where({ email })
            .whereNull('deleted_at');

        return query;
    }
    catch (e) {
        throw e;
    }
};

module.exports.getUserByEmailIncludingDeleted = async (email) => {
    try {
        const [query] = await db('users')
            .select('*')
            .where({ email });

        return query;
    }
    catch (e) {
        throw e;
    }
};

module.exports.updateUserRefreshTokenById = async (id, new_value) => {
    try {
        return await db('user_sessions')
            .where({ id })
            .update({ refresh_token_hash: new_value });
    }
    catch (e) {
        throw e;
    }
};

module.exports.createNewUserAccount = async (
    trx,
    {
        full_name,
        phone,
        email,
        password_hash,
        avatar,
        active_role,
        is_verified,
        is_suspended
    }
) => {

    try {

        const [id] = await trx('users').insert({
            full_name,
            phone,
            email,
            password_hash,
            avatar,
            active_role,
            is_verified,
            is_suspended
        });

        return id;

    }
    catch (e) {
        throw e;
    }

};

module.exports.restoreDeletedUser = async (
    trx,
    {
        id,
        full_name,
        phone,
        password_hash,
        avatar,
        active_role,
        is_verified,
        is_suspended
    }
) => {

    try {

        await trx('users')
            .where({ id })
            .update({
                full_name,
                phone,
                password_hash,
                avatar,
                active_role,
                is_verified,
                is_suspended,
                deleted_at: null
            });

    }
    catch (e) {
        throw e;
    }

};

module.exports.insertNewRefreshToken = async (trx, { user_id, refresh_token_hash }) => {

    try {

        await trx('user_sessions').insert({
            user_id,
            refresh_token_hash
        });

    }
    catch (e) {
        throw e;
    }

};

module.exports.deleteUserById = async (trx, { user_id }) => {

    try {

        await trx('users')
            .where({ id: user_id })
            .update({
                deleted_at: trx.fn.now()
            });

    }
    catch (e) {
        throw e;
    }

};