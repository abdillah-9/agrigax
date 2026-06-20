const LOCALHOST_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const NETLIFY_PATTERN = /^https:\/\/([a-z0-9-]+--)?agrigax\.netlify\.app$/;

function isLocalhostOrigin(origin) {
  return LOCALHOST_PATTERN.test(origin);
}

function isNetlifyOrigin(origin) {
  return NETLIFY_PATTERN.test(origin);
}

function parseOriginsFromEnv(value) {
  if (!value) return [];
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function getAllowedOrigins() {
  const fromAllowedOrigins = parseOriginsFromEnv(process.env.ALLOWED_ORIGINS);
  const fromFrontendUrl = parseOriginsFromEnv(process.env.FRONTEND_URL);

  const defaults = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://agrigax.netlify.app",
  ];

  return [...new Set([...fromAllowedOrigins, ...fromFrontendUrl, ...defaults])];
}

function isOriginAllowed(origin) {
  if (!origin) return true;

  const allowed = getAllowedOrigins();

  return (
    allowed.includes(origin) ||
    isLocalhostOrigin(origin) ||
    isNetlifyOrigin(origin)
  );
}

function privateNetworkAccess(req, res, next) {
  // Required when a public HTTPS site (e.g. Netlify) calls localhost.
  res.setHeader("Access-Control-Allow-Private-Network", "true");
  next();
}

module.exports.getAllowedOrigins = getAllowedOrigins;
module.exports.isOriginAllowed = isOriginAllowed;
module.exports.privateNetworkAccess = privateNetworkAccess;
module.exports.corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (isOriginAllowed(origin)) {
      callback(null, origin);
      return;
    }

    callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  preflightContinue: true,
};
