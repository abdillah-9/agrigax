const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { updateRefreshToken, insertRefreshToken, getRefreshTokenByUserId, userSignOut, createUser, getUserByEmail } = require("../repositories/authRepo");
require("dotenv").config();

/********************** SIGN-IN SERVICE ********************** */

module.exports.signInService = async({email, password})=>{

    //validate email
    const userData = await getUserByEmail({email});

    if(!userData){
        throw "Invalid credentials";
    }

    //validate password
    const validPassword = await bcrypt.compare(password,userData?.password);

    if(!validPassword){
        throw "Invalid credentials";
    }

    //create tokens
    const accessToken = jwt.sign({id:userData.id},process.env.ACCESSTOKEN,{expiresIn:'15min'});
    const refreshToken = jwt.sign({id:userData.id},process.env.REFRESHTOKEN,{expiresIn:'7d'});

    //move token and user-Id into signInRepo
    try{
        await updateRefreshToken({id:userData.id,refreshToken});   
    }
    catch(e){
        throw e;
    }

    //return res to controller
    const data = {id:userData.id,refreshToken, accessToken} 
    return data;
}

/********************** SIGN-UP SERVICE ********************** */
module.exports.signUpService = async({userData})=>{

    let userId;

    //check if account exists
    const accountExists = await getUserByEmail({email:userData.email});

    if(accountExists){
        throw "Account exists";
    }

    //encrypt password using bcrypt
    const password = await bcrypt.hash(userData.password,10);

    //send userData into repo
    try{
        userId = await createUser({data:{...userData, password}});
    }
    catch(e){
        throw e;
    }

    //create tokens and insert the token
    const accessToken = jwt.sign({id:userId},process.env.ACCESSTOKEN,{expiresIn:'15min'});
    const refreshToken = jwt.sign({id:userId},process.env.REFRESHTOKEN,{expiresIn:'7d'});

    try{
        await insertRefreshToken({id:userId,refreshToken});
    }
    catch(e){
        throw e;
    }

    //return res to controller
    const data = {id:userId,accessToken, refreshToken}
    return data;
}

/********************** SIGN-OUT ********************** */

module.exports.signOutService = async({accessToken, refreshToken})=>{

    //verify access token
    const validAccessToken = jwt.verify(accessToken,process.env.ACCESSTOKEN);
    
    if(validAccessToken){
        return;
    }

    //if access is not valid verify refresh token
    const validRefreshToken = jwt.verify(refreshToken,process.env.REFRESHTOKEN);

    if(!validRefreshToken){
        throw "Not authorised";
    }

    //compare refresh tokens DB VS Brows...
    try{
        const dbRefreshToken = await getRefreshTokenByUserId({userId: validRefreshToken.id});

        if(dbRefreshToken !=  refreshToken){
            throw "Not authorised";
        }
    }
    catch(e){
        throw e;
    }

    //Remove this user
    try{
        await userSignOut({userId:id});
    }
    catch(e){
        throw e;
    }
    return ;
}

/****************CHECK USER SESSION  *********************/
module.exports.checkUserSession = async({accessToken, refreshToken})=>{

    //verify access token
    const validAccessToken = jwt.verify(accessToken,process.env.ACCESSTOKEN);
    
    if(validAccessToken){
        return {accessToken, refreshToken};
    }

    //if access is not valid verify refresh token
    const validRefreshToken = jwt.verify(refreshToken,process.env.REFRESHTOKEN);

    if(!validRefreshToken){
        throw "Not authorised";
    }

    //compare refresh tokens DB VS Brows...
    try{
        const dbRefreshToken = await getRefreshTokenByUserId({userId: validRefreshToken.id});

        if(dbRefreshToken !=  refreshToken){
            throw "Not authorised";
        }
    }
    catch(e){
        throw e;
    }

    //Regenerate new tokens and assign them to repo and contr respectively
    const newaccessToken = jwt.sign({id:validRefreshToken.id},process.env.ACCESSTOKEN,{expiresIn:'15min'});
    const newrefreshToken = jwt.sign({id:validRefreshToken.id},process.env.REFRESHTOKEN,{expiresIn:'7d'});

    try{
        await updateRefreshToken({id:validRefreshToken.id,refreshToken: newrefreshToken});
    }
    catch(e){
        throw e;
    }

    return {id:validRefreshToken.id,accessToken:newaccessToken, refreshToken:newrefreshToken}
}

