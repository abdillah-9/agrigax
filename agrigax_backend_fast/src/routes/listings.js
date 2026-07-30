const express = require("express");
const {
  getListings,
  getFeatured,
  getByCategory,
  getById,
  getMyListings,
  createListing,
  updateListing,
  deleteListing,
} = require("../controllers/listings");
const { asyncHandler } = require("../middlewares/asyncHandler");
const validate = require("../middlewares/validate");
const { guards } = require("../configs/accessPolicy");
const { optionalAuthenticate } = require("../middlewares/optionalAuthenticate");
const { requireActiveSubscription } = require("../middlewares/requireActiveSubscription");
const schemas = require("../validations/listings");

const listingsRouter = express.Router();

listingsRouter.get("/featured", optionalAuthenticate, asyncHandler(getFeatured));
listingsRouter.get("/my", ...guards.provider, asyncHandler(getMyListings));
listingsRouter.get("/category/:cat", optionalAuthenticate, asyncHandler(getByCategory));
listingsRouter.get("/", optionalAuthenticate, asyncHandler(getListings));
listingsRouter.get("/:id", optionalAuthenticate, asyncHandler(getById));
listingsRouter.post("/", ...guards.provider, requireActiveSubscription(), validate(schemas.create), asyncHandler(createListing));
listingsRouter.put("/:id", ...guards.provider, requireActiveSubscription(), validate(schemas.update), asyncHandler(updateListing));
listingsRouter.delete("/:id", ...guards.provider, asyncHandler(deleteListing));

module.exports = listingsRouter;
