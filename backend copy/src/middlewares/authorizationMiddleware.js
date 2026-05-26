

module.exports.authorization = async(roles)=>{

    return async(req, res, next)=>{
        try{
            if(roles.includes(req.user.role)){
                return next();
            }            
            else{
                const e = new Error({statusCode:401, message: "This user is not authorized"});
                return next(e);
            }
        }
        catch(e){
            throw e;
        }
    }

}