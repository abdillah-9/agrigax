const { getCategoryByName, selectCategoryById, selectCategoryByIdRange, selectAllCategories, deleteCategoryById, getCategoryById, updateCategoryById, createNewCategory } = require("../repositories/categories");

module.exports.createNewCategory = async({category_obj})=>{
    try{
        //check if category name is available if yes then deny operation
        console.log(category_obj);
        console.log(category_obj.name);
        const category_name = await getCategoryByName({category_name: category_obj.name});

        if(category_name.length > 1){
            //then category exists
            throw new Error("Category exists");
        }

        const [id] = await createNewCategory({category_obj});

        return {category_id:id}
    }
    catch(e){
        throw e;
    }
}

module.exports.updateCategoryById = async({category_obj})=>{
    try{
        //check if category id is available if not, deny operation
        const category_id_arr = await getCategoryById({category_id: category_obj.id});

        if(category_id_arr.length < 1){
            //then category does not exist
            throw new Error("Category does not exist");
        }

        //updtae if it pass above check
        const category_update = await updateCategoryById({category_obj});
        
        return {category_id: [category_update]}
    }
    catch(e){
        throw e;
    }

}

module.exports.deleteCategoryById = async({category_id})=>{
    try{
        //check if category id is available if no then deny operation
        const category_id_arr = await getCategoryById({category_id});

        if(category_id_arr.length < 1){
            //then category does not exist
            throw new Error("Category does not exist");
        }

        //updtae if it pass above check
        const category_dlt = await deleteCategoryById({category_id});
        
        return {message: "category deleted successful"}
    }
    catch(e){
        throw e;
    }

}

module.exports.selectAllCategories = async()=>{
    try{
        const [allCategories] = await selectAllCategories();

        if(allCategories.length < 1){
            throw new Error(" No categories selected ");
        }

        return {categories: allCategories}
    }
    catch(e){
        throw e;
    }
}

module.exports.selectCategoryByIdRange = async({start_id, end_id})=>{

    try{
        const [categories] = await selectCategoryByIdRange({start_id, end_id});

        return {categories};

    }
    catch(e){
        throw e;
    }
}

module.exports.selectCategoryById = async({category_id})=>{
    try{
        const [categories] = await selectCategoryById({category_id});

        return {categories};
    }
    catch(e){
        throw e;
    }
}