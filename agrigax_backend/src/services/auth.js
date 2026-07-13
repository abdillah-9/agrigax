const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const {
    getUserByEmail,
    getUserByEmailIncludingDeleted,
    restoreDeletedUser,
    updateUserRefreshTokenById,
    createNewUserAccount,
    insertNewRefreshToken,
    deleteUserById
} = require("../repositories/auth");

const db = require("../configs/db");

require("dotenv").config();


module.exports.signIn = async ({ email, password }) => {

    const userData = await getUserByEmail(email);

    if (!userData) {
        throw new Error("Invalid credentials");
    }


    const validPassword = await bcrypt.compare(
        password,
        userData.password_hash
    );


    if (!validPassword) {
        throw new Error("Invalid password");
    }


    const access_token_hash = jwt.sign(
        { id: userData.id },
        process.env.ACCESS_SECRET_KEY,
        {
            expiresIn: "15m"
        }
    );


    const refresh_token_hash = jwt.sign(
        { id: userData.id },
        process.env.REFRESH_SECRET_KEY,
        {
            expiresIn: "7d"
        }
    );


    await updateUserRefreshTokenById(
        userData.id,
        refresh_token_hash
    );


    return {
        id: userData.id,
        access_token_hash,
        refresh_token_hash
    };

};



module.exports.signUp = async ({
    full_name,
    phone,
    email,
    password,
    avatar,
    active_role,
    is_verified,
    is_suspended
}) => {


    // check including deleted accounts
    const existingUser = await getUserByEmailIncludingDeleted(email);


    const password_hash = await bcrypt.hash(password, 10);



    const userId = await db.transaction(async (trx) => {

        let id;


        // user exists
        if (existingUser) {


            // account still active
            if (existingUser.deleted_at === null) {
                throw new Error("Account exists");
            }


            // restore deleted account
            await restoreDeletedUser(trx, {

                id: existingUser.id,

                full_name,
                phone,
                password_hash,
                avatar,
                active_role,
                is_verified,
                is_suspended

            });


            id = existingUser.id;


        }
        else {


            // create completely new user
            id = await createNewUserAccount(trx, {

                full_name,
                phone,
                email,
                password_hash,
                avatar,
                active_role,
                is_verified,
                is_suspended

            });

        }



        const refresh_token = jwt.sign(
            { id },
            process.env.REFRESH_SECRET_KEY,
            {
                expiresIn: "7d"
            }
        );



        await insertNewRefreshToken(trx, {

            user_id: id,
            refresh_token_hash: refresh_token

        });



        return id;

    });



    const access_token = jwt.sign(
        { id: userId },
        process.env.ACCESS_SECRET_KEY,
        {
            expiresIn: "15m"
        }
    );


    return {

        id: userId,
        access_token

    };

};





module.exports.signOut = async ({
    access_token_hash,
    refresh_token_hash
}) => {


    try {

        const userId = await jwt.verify(
            access_token_hash,
            process.env.ACCESS_SECRET_KEY
        );


        if (userId?.id) {

            await updateUserRefreshTokenById(
                userId.id,
                null
            );


            return userId;

        }


    }
    catch (e) {

        const userId = await jwt.verify(
            refresh_token_hash,
            process.env.REFRESH_SECRET_KEY
        );


        await updateUserRefreshTokenById(
            userId.id,
            null
        );


        return userId;

    }

};





module.exports.userSessionCheck = async ({
    access_token_hash,
    refresh_token_hash
}) => {


    try {

        const userId = await jwt.verify(
            access_token_hash,
            process.env.ACCESS_SECRET_KEY
        );


        const new_access_token_hash = jwt.sign(
            {
                id: userId.id
            },
            process.env.ACCESS_SECRET_KEY,
            {
                expiresIn: "15m"
            }
        );


        const new_refresh_token_hash = jwt.sign(
            {
                id: userId.id
            },
            process.env.REFRESH_SECRET_KEY,
            {
                expiresIn: "7d"
            }
        );


        await updateUserRefreshTokenById(
            userId.id,
            new_refresh_token_hash
        );


        return {

            id: userId.id,

            access_token_hash:
                new_access_token_hash,

            refresh_token_hash:
                new_refresh_token_hash

        };


    }
    catch (e) {


        const userId = await jwt.verify(
            refresh_token_hash,
            process.env.REFRESH_SECRET_KEY
        );


        const new_access_token_hash = jwt.sign(
            {
                id: userId.id
            },
            process.env.ACCESS_SECRET_KEY,
            {
                expiresIn: "15m"
            }
        );


        const new_refresh_token_hash = jwt.sign(
            {
                id: userId.id
            },
            process.env.REFRESH_SECRET_KEY,
            {
                expiresIn: "7d"
            }
        );



        await updateUserRefreshTokenById(
            userId.id,
            new_refresh_token_hash
        );



        return {

            id: userId.id,

            access_token_hash:
                new_access_token_hash,

            refresh_token_hash:
                new_refresh_token_hash

        };

    }

};






module.exports.quickUserSessionCheck = async ({
    access_token_hash
}) => {


    try {

        const userId = await jwt.verify(
            access_token_hash,
            process.env.ACCESS_SECRET_KEY
        );


        return {
            id: userId.id
        };


    }
    catch (e) {

        throw e;

    }

};







module.exports.deleteAccountById = async (user_id) => {


    try {


        await db.transaction(async (trx) => {


            await deleteUserById(
                trx,
                {
                    user_id
                }
            );


        });


    }
    catch (e) {

        throw e;

    }

};