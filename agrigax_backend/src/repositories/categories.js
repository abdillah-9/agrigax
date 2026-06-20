const db = require("../configs/db");

module.exports.getCategoryByName = async({category_name : name})=>{

    try{
        const category_name = await db('categories').select('name').where({name, deleted_at: null});
        return category_name;  
    }
    catch(e){
        throw e;
    }
} ;
module.exports.createNewCategory = async({category_obj})=>{
    try{
        const id = await db("categories").insert({...category_obj});  
        return id;
    }
    catch(e){
        throw e;
    }
} ;

module.exports.getCategoryById = async({category_id})=>{
    try{
        const category_id_arr = await db("categories").select('*').where({id:category_id, deleted_at: null});
        return category_id_arr;
    }
    catch(e){
        throw e;
    }
} ;

module.exports.updateCategoryById = async({category_obj})=>{
    try{
        const category_update = await db("categories").update({...category_obj}).where({id: category_obj.id});
        return category_update;
    }
    catch(e){
        throw e;
    }
} ;

module.exports.deleteCategoryById = async({category_id})=>{

    console.log("repo category value is :"+category_id);

    try{
        await db("categories").update({deleted_at: db.fn.now()}).where({id: category_id});
        return true;
    }
    catch(e){
        throw e;
    }
} ;

module.exports.selectAllCategories = async()=>{
    try{
        const categories = await db("categories").select("*");
        return categories;
    }
    catch(e){
        throw e;
    }
}

module.exports.selectCategoryById = async({category_id})=>{
    try{
        const categories = await db("categories").select("*");
        return categories;
    }
    catch(e){
        throw e;
    }
}

module.exports.selectCategoryByIdRange = async({start_id, end_id})=>{
    try{
        const categories = await db("categories")
        .select("*")
        .where({id: (id >= start_id) && (id <= end_id)});

        return categories;
    }
    catch(e){
        throw e;
    }
}