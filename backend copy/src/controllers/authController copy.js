const { signInService, signUpService, signOutService, checkUserSession } = require("../services/authServices");

//sign In controller
module.exports.signInController = async(req, res, next)=>{
    const {email, password} = req.body;

    try{
        const data = await signInService({email,password});
        return res.json({data});
    }
    catch(e){
        return res.json({error:e});
    }

}

//signUp controller
module.exports.signUpController = async(req, res)=>{
    const userData = req.body;

    try{
        const data = await signUpService({userData});
        return res.json({data});
    }
    catch(e){
        return res.json({error:e});
    }
}

//signOut Controller
module.exports.signOutController = async(req, res)=>{

    const {accessToken, refreshToken} = req.cookies;
    try{
        await signOutService({accessToken,refreshToken});
        return res.json({message:"OK"});
    }
    catch(e){
        return res.json({error:e});
    }
}

//checkUserSession Controller
module.exports.checkUserSessionController = async(req, res)=>{

    const {accessToken, refreshToken} = req.cookies;
    try{

        const data = await checkUserSession({accessToken, refreshToken});
        return res.json({data});

    }
    catch(e){
        return res.json({error:e});
    }

}