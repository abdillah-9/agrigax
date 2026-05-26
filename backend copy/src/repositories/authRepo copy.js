require('dotenv').config();
const db = require('../config/db');


//If I use transactions should I catch throw to check if query fails OR they will throw automatic ???? coz first method I did used try catch while sec one I didnt .

/********************** SIGN-IN REPOSITORIES ********************** */

//Get user by email
module.exports.getUserByEmail = async({email})=>{

    return await db.transaction((trx)=>{

        try{
            const userData = trx('users').where({email}).first();
            return userData;
        }
        catch(e){
            throw e;
        }
    });
}

//UpdateRefreshToken
module.exports.updateRefreshToken = async({id, refreshToken})=>{

    return await db.transaction((trx)=>{

        return trx('tokens').where({userId:id}).update({refreshToken});

    });

}

/********************** SIGN-UP REPOSITORIES ********************** */
module.exports.createUser = async({data})=>{

    return await db.transaction((trx)=>{
        try{
            return trx('users').insert({...data});
        }
        catch(e){
            throw e;
        }
    });

}

module.exports.insertRefreshToken = async({id, refreshToken})=>{

    return db.transaction((tsx)=>{
        try{
            return trx('tokens').insert({userId:id, refreshToken});
        }
        catch(e){
            throw e;
        }
    });
}

/********************** SIGN-OUT REPOSITORIES ********************** */
module.exports.userSignOut = async ({userId})=>{
    try{
        return db.transaction(()=>{
            return trx('tokens').where({userId}).delete();
        });
    }
    catch(e){
        throw e;
    }
}

/*********************** CHECK USER AUTH SSESSION **************************/
module.exports.getRefreshTokenByUserId = async({userId})=>{
    try{
        return db.transaction(()=>{
            return trx('tokens').where({userId}).first();
        });
    }
    catch(e){
        throw e
    }
}