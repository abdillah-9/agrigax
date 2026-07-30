const express = require("express");
const { getProfile, updateProfile, updateSettings, getProviders, getUserById } = require("../controllers/users");
const { getRating, rate } = require("../controllers/providerRatings");
const { asyncHandler } = require("../middlewares/asyncHandler");
const { optionalAuthenticate } = require("../middlewares/optionalAuthenticate");
const validate = require("../middlewares/validate");
const { guards } = require("../configs/accessPolicy");
const schemas = require("../validations/users");

const usersRouter = express.Router();

usersRouter.get("/profile", ...guards.auth, asyncHandler(getProfile));
usersRouter.put("/profile", ...guards.auth, validate(schemas.updateProfile), asyncHandler(updateProfile));
usersRouter.put("/settings", ...guards.auth, validate(schemas.updateSettings), asyncHandler(updateSettings));
usersRouter.get("/providers", ...guards.public, asyncHandler(getProviders));

// Vendor rating — aggregate is public; the viewer's own rating/canRate flags
// are filled in when a token is present. Submitting requires a verified user.
usersRouter.get("/providers/:id/rating", optionalAuthenticate, asyncHandler(getRating));
usersRouter.put("/providers/:id/rating", ...guards.verified, validate(schemas.rateProvider), asyncHandler(rate));

usersRouter.get("/:id", ...guards.public, asyncHandler(getUserById));

module.exports = usersRouter;
