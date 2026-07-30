const express = require("express");
const { search, requestImage } = require("../controllers/catalogImages");
const { asyncHandler } = require("../middlewares/asyncHandler");
const validate = require("../middlewares/validate");
const { guards } = require("../configs/accessPolicy");
const schemas = require("../validations/catalogImages");

const catalogImagesRouter = express.Router();

// Vendors browse/search the curated image catalog when creating a listing
catalogImagesRouter.get("/", ...guards.provider, asyncHandler(search));
// Vendor asks the app owner to add a missing product image
catalogImagesRouter.post("/requests", ...guards.provider, validate(schemas.requestImage), asyncHandler(requestImage));

module.exports = catalogImagesRouter;
