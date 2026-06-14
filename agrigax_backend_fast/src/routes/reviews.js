const express = require("express");
const { getReviews, createReview, updateReview, deleteReview } = require("../controllers/reviews");
const { asyncHandler } = require("../middlewares/asyncHandler");
const validate = require("../middlewares/validate");
const { guards } = require("../configs/accessPolicy");
const schemas = require("../validations/reviews");

const reviewsRouter = express.Router();

reviewsRouter.get("/", ...guards.public, asyncHandler(getReviews));
reviewsRouter.post("/", ...guards.verified, validate(schemas.create), asyncHandler(createReview));
reviewsRouter.put("/:id", ...guards.verified, validate(schemas.update), asyncHandler(updateReview));
reviewsRouter.delete("/:id", ...guards.verified, asyncHandler(deleteReview));

module.exports = reviewsRouter;
