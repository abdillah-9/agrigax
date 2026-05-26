const express = require('express');
const { signInController, signUpController, signOutController, checkUserSessionController } = require('../controllers/authController');
const { fastAuthenticationHandler } = require('../middlewares/fastAuthenticationMiddleware');
const { authorization } = require('../middlewares/authorizationMiddleware');
const authRouter = express.Router();

const inputValidator = require("../middlewares/validator");
const schema = require("../validators/authValidation");

//Assign Routes
authRouter.post('/auth/sign-in', inputValidator(schema.signInValidation) ,signInController);
authRouter.post('/auth/sign-up', signUpController);
authRouter.post('/auth/sign-out', signOutController);
authRouter.post('/auth/check-user-session', checkUserSessionController);

//fake Route to test author... and authent...
authRouter.post('/path_url/protected',fastAuthenticationHandler,authorization(['admin, staff']),pageController);

module.exports = authRouter;