const { createNewCategory, updateCategoryById, deleteCategoryById, selectAllCategories, selectCategoryByIdRange, selectCategoryById } = require("../services/categories");

module.exports.createCategory = async(req, res, next)=>{

    try{
        const category_obj = req.body;
        const result = await createNewCategory({category_obj});
        return res.status(200).json({message:"Category has been created successfully", result});
    }
    catch(e){
        throw e;
    }
}

module.exports.updateCategoryById = async(req, res, next)=>{
    
    try{
        const {category_obj} = req.body;

        const result = await updateCategoryById({category_obj});
        return res.status(200).json({message:"Category updated successfully"});
    }
    catch(e){
        throw e;
    }
}

module.exports.deletecategoryById = async(req, res, next)=>{
    try{
        const {category_id} = req.body;
        const result = await deleteCategoryById({category_id});

        return res.status(200).json({message:"Category is successfully deleted"});
    }
    catch(e){
        throw e;
    }
}


module.exports.selectAllCategories = async(req, res, next)=>{
    try{
        const {} = req.body;
        const result = await selectAllCategories();

        return res.status(200).json({message:"All categories fetched succssful"});

    }
    catch(e){
        throw e;
    }
}

module.exports.selectCategoryByIdRange = async(req, res , next)=>{
    try{
        const {start_id, end_id} = req.body;
        const result = await selectCategoryByIdRange({start_id, end_id});

        return res.status(200).json({message:"Selected successfully all catgory rown in the given range"});

    }
    catch(e){
        throw e;
    }
}

module.exports.selectCategoryById = async(req, res , next)=>{
    try{

        const {category_it} = req.body;

        const result = await selectCategoryById({category_id});

        return res.status(200).json({message:"Category successfully updated"});

    }
    catch(e){
        throw e;
    }
}
