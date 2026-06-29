module.exports.validator = (schema)=>{
    return async (req, res, next)=>{

        const {error} = schema.validate(req.body);

        if(error){
            return res.json(error.details[0].message);
            throw new Error(error.details[0].message); // Will this pass error code too?? coz I use the error codes to identify how to return that err to user using that centaized error handler.
        }
    }
} 