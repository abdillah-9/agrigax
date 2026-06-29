const express = require('express');
const { createCategory, updateCategoryById, selectAllCategories, deletecategoryById, selectCategoryById } = require('../controllers/categories');
const { validator } = require('../middlewares/categories_middleware');
const { category_schema } = require('../validations/categories.validations');
const categoriesRouter = express.Router();

//method 1
// categoriesRouter.post("create-category", createCategory);
// categoriesRouter.put("update-category", updateCategoryById);
//etc

//VS

//method 2
categoriesRouter.route("/")
                .post(validator(category_schema),createCategory)
                .get(selectAllCategories)

categoriesRouter.route("/:id")
                .put(validator(category_schema),updateCategoryById)
                .delete(deletecategoryById)
                .get(selectCategoryById);    

module.exports.categoriesRouter = categoriesRouter;
