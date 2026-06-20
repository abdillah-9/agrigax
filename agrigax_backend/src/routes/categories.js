const express = require('express');
const { createCategory, updateCategoryById, selectAllCategories, deletecategoryById, selectCategoryById } = require('../controllers/categories');
const categoriesRouter = express.Router();

//method 1
categoriesRouter.post("create-category", createCategory);
categoriesRouter.put("update-category", updateCategoryById);
//etc

//VS

//method 2
categoriesRouter.route("category")
                .put(updateCategoryById)
                .post(createCategory)
                .get(selectAllCategories)
                .delete(deletecategoryById);              
categoriesRouter.get('get-category', selectCategoryById);

module.exports = categoriesRouter;
