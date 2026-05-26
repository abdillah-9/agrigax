const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports.fastAuthentication = async(req, res, next)=>{

    try{
        const payload = jwt.verify(req.cookie.appAccess, process.env.ACCESSKEY);

        req.user = payload;

        return next();

    }
    catch(e){
        return next(e);
    }
}