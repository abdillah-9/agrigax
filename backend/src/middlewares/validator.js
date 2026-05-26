module.exports= async(schema)=>{

    return async(req, res, next)=>{

        //validate Email and password
        try{
            const value = await schema.validateAsync(req.body);

            return next();
        }

        catch(e){
            return next(e);
        }

    }

}