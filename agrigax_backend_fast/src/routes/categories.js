const express = require("express");

const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categories");

const { asyncHandler } = require("../middlewares/asyncHandler");
const validate = require("../middlewares/validate");
const { guards } = require("../configs/accessPolicy");
const schemas = require("../validations/categories");

const categoriesRouter = express.Router();

categoriesRouter.get("/", ...guards.public, asyncHandler(getCategories));
categoriesRouter.get("/:id", ...guards.public, asyncHandler(getCategoryById));
categoriesRouter.post("/", ...guards.admin, validate(schemas.create), asyncHandler(createCategory));
categoriesRouter.put("/:id", ...guards.admin, validate(schemas.update), asyncHandler(updateCategory));
categoriesRouter.delete("/:id", ...guards.admin, asyncHandler(deleteCategory));

module.exports = categoriesRouter;
