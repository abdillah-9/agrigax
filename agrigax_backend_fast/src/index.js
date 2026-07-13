require("dotenv").config({ quiet: true });

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { corsOptions, privateNetworkAccess, getAllowedOrigins } = require("./configs/cors");
const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const listingsRouter = require("./routes/listings");
const bookingsRouter = require("./routes/bookings");
const categoriesRouter = require("./routes/categories");
const favoritesRouter = require("./routes/favorites");
const reviewsRouter = require("./routes/reviews");
const messagesRouter = require("./routes/messages");
const notificationsRouter = require("./routes/notifications");
const disputesRouter = require("./routes/disputes");
const adminRouter = require("./routes/admin");
const { notFound } = require("./middlewares/notFound");
const { errorHandler } = require("./middlewares/errorHandler");

const app = express();

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "agrigax-backend-fast" });
});

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(privateNetworkAccess);
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

//validation middleware-here


// middlewares here
app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/listings", listingsRouter);
app.use("/bookings", bookingsRouter);
app.use("/categories", categoriesRouter);
app.use("/favorites", favoritesRouter);
app.use("/reviews", reviewsRouter);
app.use("/messages", messagesRouter);
app.use("/notifications", notificationsRouter);
app.use("/disputes", disputesRouter);
app.use("/admin", adminRouter);


app.use(notFound);
app.use(errorHandler);

//export app 
module.exports = app;

//Run node app here — only start the HTTP server when run directly, not when imported by tests.
if (require.main === module) {
  const PORT = process.env.PORT || 4000;

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Node app is running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log("CORS allowed origins:");
    getAllowedOrigins().forEach((origin) => console.log(`  - ${origin}`));
    console.log("  - any http://localhost:* or http://127.0.0.1:*");
    console.log("  - any https://*.agrigax.netlify.app preview deploy");
  });
}