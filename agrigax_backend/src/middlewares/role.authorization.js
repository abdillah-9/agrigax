const { quickUserSessionCheck } = require("../services/auth")

module.exports.role_authorization = (roles)=>{

    return async(req, res, next)=>{
        const access_token_hash = req.cookie.agigax_access_token;
        const data = await quickUserSessionCheck({access_token_hash});

        if(!roles.includes(data.role)){
            throw new Error("user is not authorized");
        }
    }
}