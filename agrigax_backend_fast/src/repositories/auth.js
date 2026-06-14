const db = require('../configs/db');

module.exports.getUserByEmail = async(email)=>{
    try{
        const [query] = await db('users').select('*').where({email});
        return query;
    }
    catch(e){
        throw e;
    }
}

module.exports.updateUserRefreshTokenById = async(id, new_value)=>{ 
    try{
        const query = await db('user_sessions').update({refresh_token_hash: new_value}).where({id});
        return query;
    }
    catch(e){
        throw e;
    }
}

module.exports.createNewUserAccount = async(trx,
    {full_name, phone, email,password_hash, avatar, active_role, is_verified, is_suspended}
)=>{
    try{
        const [query] = await trx('users').insert(
            {            
                full_name, phone, email,password_hash, avatar, active_role, 
                is_verified, is_suspended
            }
        );
        return query;
    }
    catch(e){
        throw e;
    }
};

module.exports.insertNewRefreshToken = async(trx, {user_id, refresh_token_hash})=>{

    try{
        const [query] = await trx('user_sessions').insert({user_id,refresh_token_hash})
    }
    catch(e){
        throw e;
    }
};