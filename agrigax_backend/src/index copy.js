const express = require('express');
const app = express();
const cors = require("cors");
const categoriesRouter = require('./routes/categories');

app.use(express.json());
app.use(cors({
    // Will be implemented soon, but first lets settle this first mainly on how implemented my routes in this part...
}));

// chain other middlewares ie: categories RouteMiddleware
app.use(categoriesRouter);

module.exports = app;

app.listen(4000, ()=>{
    console.log(" App is runing at the 4000 port");
});