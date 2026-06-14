const express = require("express");
const { getFavorites, addFavorite, removeFavorite } = require("../controllers/favorites");
const { asyncHandler } = require("../middlewares/asyncHandler");
const { guards } = require("../configs/accessPolicy");

const favoritesRouter = express.Router();

favoritesRouter.get("/", ...guards.auth, asyncHandler(getFavorites));
favoritesRouter.post("/:id", ...guards.auth, asyncHandler(addFavorite));
favoritesRouter.delete("/:id", ...guards.auth, asyncHandler(removeFavorite));

module.exports = favoritesRouter;
