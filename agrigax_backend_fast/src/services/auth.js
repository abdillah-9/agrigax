const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { getUserByEmail, updateUserRefreshTokenById, createNewUserAccount, insertNewRefreshToken } = require("../repositories/auth");
const db = require("../configs/db");
require('dotenv').config();

module.exports.signIn = async({email, password})=>{

    //verify email if its available in DB -- by fetching user from DB using this email
    const userData = await getUserByEmail(email);

    if(!userData){
        throw new Error("Invalid credentials");
    }

    //verify if password is valid -- by using bcrypt we validate the password against DB password

    try{
        const validPassword = await bcrypt.compare(password, userData.password_hash);

        if(!validPassword){
            throw new Error("Invalid password");
        }
    }
    catch(e){
        throw e;
    }

    //If valid 
    // --we generate tokens ( access and key tokens) && 
    const access_token_hash = await jwt.sign({id:userData.id}, process.env.ACCESS_SECRET_KEY,{
        expiresIn:'15 min'
    });
    const refresh_token_hash = await jwt.sign({id:userData.id}, process.env.REFRESH_SECRET_KEY,{
        expiresIn:'7 days'
    });
    
    // --we update refresh token in DB &&
    try{
        const userId = await jwt.verify(refresh_token_hash, process.env.REFRESH_SECRET_KEY);

        const new_value = null;
        await updateUserRefreshTokenById(userId.id, new_value);
        return userId;
    }  
    catch(e){
        throw e;
    }

    // --we send user ID and access Token to controller which will create the tokens
    // return {id:userData.id, access_token_hash, refresh_token_hash};
    return "well done";

}

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

    // 1. Check if user already exists
    const existingUser = await getUserByEmail(email);

    if (existingUser) {
        throw new Error("Account exists");
    }

    //1.5. hash password
    const password_hash = await bcrypt.hash(password,10);

    // 2. Create user + refresh token INSIDE transaction
    const userId = await db.transaction(async (trx) => {

        // create user
        const id = await createNewUserAccount(trx, {
            full_name,
            phone,
            email,
            password_hash,
            avatar,
            active_role,
            is_verified,
            is_suspended
        });

        // generate refresh token (needs user id, so MUST be here)
        const refresh_token = jwt.sign(
            { id },
            process.env.REFRESH_SECRET_KEY,
            { expiresIn: "7d" }
        );

        // store refresh token
        //throw new Error("Rolling back ");
        await insertNewRefreshToken(trx, {
            user_id: id,
            refresh_token_hash: refresh_token
        });

        // return created user id
        return id;
    });

    // 3. Generate access token OUTSIDE transaction
    const access_token = jwt.sign(
        { id: userId },
        process.env.ACCESS_SECRET_KEY,
        { expiresIn: "15m" }
    );

    // 4. Return response
    return {
        id: userId,
        access_token
    };
};

module.exports.signOut = async({access_token_hash, refresh_token_hash})=>{
    // validate tokens if are real
    const userId = await jwt.verify(access_token_hash,process.env.ACCESS_SECRET_KEY);
    if(userId?.id){
        const new_value = null;
        await updateUserRefreshTokenById(userId.id, new_value);
        return userId;
    }

    try{
        const userId = await jwt.verify(refresh_token_hash, process.env.REFRESH_SECRET_KEY);

        const new_value = null;
        await updateUserRefreshTokenById(userId.id, new_value);
        return userId;
    }
    catch(e){
        throw e;
    }
}

module.exports.userSessionCheck = async({access_token_hash, refresh_token_hash})=>{
    //check if access token is valid
    const userId = await jwt.verify(access_token_hash, process.env.ACCESS_SECRET_KEY);

    if(userId){
        const new_access_token_hash = jwt.sign({id: userId.id}, process.env.ACCESS_SECRET_KEY, {expiresIn:'15 min'});
        const new_value = jwt.sign({id: userId.id}, process.env.REFRESH_SECRET_KEY, {expiresIn:'7 days'});

        await updateUserRefreshTokenById(userId.id, new_value);

        return {
            id:userId.id, 
            access_token_hash:new_access_token_hash,
            refresh_token_hash:new_value,  
        };
    }

    try{
        const userId = await jwt.verify(refresh_token_hash, process.env.REFRESH_SECRET_KEY);

        const new_access_token_hash = jwt.sign(userId, process.env.ACCESS_SECRET_KEY, {expiresIn:'15 min'});
        const new_value = jwt.sign(userId, process.env.REFRESH_SECRET_KEY, {expiresIn:'7 days'});

        await updateUserRefreshTokenById(userId.id, new_value);
        return {
            id:userId.id, 
            access_token_hash:new_access_token_hash,
            refresh_token_hash:new_value,  
        };
    }
    catch(e){
        throw e;
    }
}

module.exports.quickUserSessionCheck = async({access_token_hash})=>{

    //validate access token
    try{
        const userId = await jwt.verify(access_token_hash, process.env.ACCESS_SECRET_KEY);
        return {id: userId.id}
    }
    catch(e){
        throw e;
    }
}
