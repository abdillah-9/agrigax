const jwt = require("jsonwebtoken");
const { ACCESS_COOKIE } = require("../utils/cookies");
const { getUserById } = require("../repositories/auth");

module.exports.optionalAuthenticate = async (req, res, next) => {
  const access_token_hash = req.cookies?.[ACCESS_COOKIE];

  if (!access_token_hash) {
    return next();
  }

  try {
    const payload = jwt.verify(access_token_hash, process.env.ACCESS_SECRET_KEY);
    const user = await getUserById(payload.id);

    if (user && !user.is_suspended) {
      req.user = user;
    }
  } catch (e) {
    // ignore invalid/expired token on public routes
  }

  return next();
};
