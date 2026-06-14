const express = require("express");
const { getWallet, getTransactions, deposit, withdraw } = require("../controllers/wallets");
const { asyncHandler } = require("../middlewares/asyncHandler");
const validate = require("../middlewares/validate");
const { guards } = require("../configs/accessPolicy");
const schemas = require("../validations/wallets");

const walletsRouter = express.Router();

walletsRouter.get("/", ...guards.verified, asyncHandler(getWallet));
walletsRouter.get("/transactions", ...guards.verified, asyncHandler(getTransactions));
walletsRouter.post("/deposit", ...guards.verified, validate(schemas.deposit), asyncHandler(deposit));
walletsRouter.post("/withdraw", ...guards.verified, validate(schemas.withdraw), asyncHandler(withdraw));

module.exports = walletsRouter;
