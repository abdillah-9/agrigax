const express = require("express");
const { signIn, signUp, signOut, userSessionCheck, quickUserSessionCheck } = require("../controllers/auth");
const authRouter = express.Router();

module.exports.signInRoute = authRouter.post("/sign-in", signIn);
module.exports.signInRoute = authRouter.post("/sign-up", signUp);
module.exports.signInRoute = authRouter.post("/sign-out", signOut);
module.exports.signInRoute = authRouter.post("/user-session-check", userSessionCheck);
module.exports.signInRoute = authRouter.post("/quick-user-session-check", quickUserSessionCheck);

module.exports = authRouter;
