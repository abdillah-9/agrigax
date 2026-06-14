const { signIn, signUp, signOut, userSessionCheck, quickUserSessionCheck } = require("../services/auth");

module.exports.signIn = async(req, res, next)=>{
    const {email, password} = req.body;

    try{
        const {id, access_token_hash, refresh_token_hash} = await signIn({email, password});

        res.cookie('access_token_hash',access_token_hash,{
            maxAge:1000 * 60 * 60 * 15,
            sameSite:'lax',
            httpOnly: false,
            secured: true,
        });

        res.cookie('refresh_token_hash',refresh_token_hash,{
            maxAge:1000 * 60 * 60 * 24 * 7,
            sameSite:'lax',
            httpOnly: false,
            secured: true,
        });

        return res.json({message:"You have successfully signed-In", id}).statusCode(200);
        next();
    }

    catch(e){
        throw e
    }
}

module.exports.signUp  = async(req, res, next)=>{
    const {    full_name, phone, email,password_hash, avatar, active_role, is_verified, is_suspended} = req.body;

    try{
        const {id, access_token_hash, refresh_token_hash} = await signUp(full_name, phone, email,password_hash, avatar, active_role, is_verified, is_suspended);   

        res.cookie('access_token_hash',access_token_hash,{
            maxAge:1000 * 60 * 60 * 15,
            samesite:'lax',
            httponly: false,
            secured: true,
        });

        res.cookie('refresh_token_hash',refresh_token_hash,{
            maxAge:1000 * 60 * 60 * 24 * 7,
            samesite:'lax',
            httponly: false,
            secured: true,
        });

        return res.json({message:"You have successfully created new account...", id}).statusCode(200);
    }
    catch(e){
        throw e;
    }
};

module.exports.signOut = async(req, res, next)=>{

    const {access_token_hash, refresh_token_hash} = req.cookies;

    try{
        await signOut({access_token_hash,refresh_token_hash});

        res.cookie('access_token_hash',access_token_hash,{
            maxAge:1,
            samesite:'lax',
            httponly: false,
            secured: true,
        });

        res.cookie('refresh_token_hash',refresh_token_hash,{
            maxAge:1,
            samesite:'lax',
            httponly: false,
            secured: true,
        });

        return res.json({message:"You have successful signed out"}).statusCode(200);
    }
    catch(e){
        throw e;
    }

};

module.exports.userSessionCheck = async(req, res, next)=>{

    const {id, access_token_hash, refresh_token_hash} = req.cookies;

    try{
        const {access_token_hash, refresh_token_hash} = await userSessionCheck({access_token_hash, refresh_token_hash});

        res.cookie('access_token_hash',access_token_hash,{
            maxAge:1,
            samesite:'lax',
            httponly: false,
            secured: true,
        });

        res.cookie('refresh_token_hash',refresh_token_hash,{
            maxAge:1,
            samesite:'lax',
            httponly: false,
            secured: true,
        });      

        return res.json({message:"User session is valid", id}).statusCode(200);
    }
    catch(e){
        throw e;
    }
};

module.exports.quickUserSessionCheck = async(req, res, next)=>{
    const {access_token_hash} = req.cookies;

    try{
        await quickUserSessionCheck({access_token_hash});
        //next();
    }
    catch(e){
        throw e;
    }
}