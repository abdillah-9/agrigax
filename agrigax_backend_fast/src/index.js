const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { corsOptions } = require("./configs/cors");
const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const listingsRouter = require("./routes/listings");
const bookingsRouter = require("./routes/bookings");
const categoriesRouter = require("./routes/categories");
const favoritesRouter = require("./routes/favorites");
const reviewsRouter = require("./routes/reviews");
const messagesRouter = require("./routes/messages");
const notificationsRouter = require("./routes/notifications");
const paymentsRouter = require("./routes/payments");
const walletsRouter = require("./routes/wallets");
const disputesRouter = require("./routes/disputes");
const adminRouter = require("./routes/admin");
const { notFound } = require("./middlewares/notFound");
const { errorHandler } = require("./middlewares/errorHandler");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

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
app.use("/payments", paymentsRouter);
app.use("/wallet", walletsRouter);
app.use("/disputes", disputesRouter);
app.use("/admin", adminRouter);


app.use(notFound);
app.use(errorHandler);

//export app 
module.exports = app;

//Run node app here
const PORT = process.env.PORT;
app.listen(PORT ,()=>{
    console.log(` Node app is running on port: ${PORT}`);
});