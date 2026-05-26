const { signInService, signUpService, signOutService, checkUserSession } = require("../services/authServices");

//sign In controller
module.exports.signInController = async(req, res, next)=>{
    const {email, password} = req.body;

    try{
        const data = await signInService({email,password});

        //set cookies
        res.setCookie({
            httpOnly: true,
            samesite: 'lax',
            expiresIn: 1000 * 60 * 60 * 15
        },'app accessCookie');
        res.setCookie({
            httpOnly: true,
            samesite: 'lax',
            expiresIn: 1000 * 60 * 60 * 60 * 24 * 7
        },'app refresh cookie');

        return res.json({data});
    }
    catch(e){
        return next(e);
    }

}

//signUp controller
module.exports.signUpController = async(req, res)=>{
    const userData = req.body;

    try{
        const data = await signUpService({userData});

        //set cookies
        res.setCookie({
            httpOnly: true,
            samesite: 'lax',
            expiresIn: 1000 * 60 * 60 * 15
        },'app accessCookie');
        res.setCookie({
            httpOnly: true,
            samesite: 'lax',
            expiresIn: 1000 * 60 * 60 * 60 * 24 * 7
        },'app refresh cookie');

        return res.json({data});
    }
    catch(e){
        return next(e);
    }
}

//signOut Controller
module.exports.signOutController = async(req, res)=>{

    const {accessToken, refreshToken} = req.cookies;

    try{
        await signOutService({accessToken,refreshToken});

        //set cookies
        res.setCookie({
            httpOnly: true,
            samesite: 'lax',
            expiresIn: 0
        },'app accessCookie');
        res.setCookie({
            httpOnly: true,
            samesite: 'lax',
            expiresIn: 0
        },'app refresh cookie');

        return res.json({message:"OK"});
    }
    catch(e){
        return next(e);
    }
}

//checkUserSession Controller
module.exports.checkUserSessionController = async(req, res)=>{

    const {accessToken, refreshToken} = req.cookies;
    try{

        const data = await checkUserSession({accessToken, refreshToken});
        
        //set cookies
        res.setCookie({
            httpOnly: true,
            samesite: 'lax',
            expiresIn: 1000 * 60 * 60 * 15
        },'app accessCookie');
        res.setCookie({
            httpOnly: true,
            samesite: 'lax',
            expiresIn: 1000 * 60 * 60 * 60 * 24 * 7
        },'app refresh cookie');

        return res.json({data});

    }
    catch(e){
        return next(e);
    }

}