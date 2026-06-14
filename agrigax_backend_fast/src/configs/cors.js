const LOCALHOST_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

function isLocalhostOrigin(origin) {
  return LOCALHOST_PATTERN.test(origin);
}

function getAllowedOrigins() {
  const fromEnv = process.env.FRONTEND_URL;
  const defaults = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ];

  return [...new Set([fromEnv, ...defaults].filter(Boolean))];
}

module.exports.corsOptions = {
  origin(origin, callback) {
    // Allow non-browser tools (curl, Postman) with no Origin header.
    if (!origin) {
      callback(null, true);
      return;
    }

    const allowed = getAllowedOrigins();

    if (allowed.includes(origin) || isLocalhostOrigin(origin)) {
      callback(null, origin);
      return;
    }

    callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
