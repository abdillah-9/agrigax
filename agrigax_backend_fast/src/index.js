const express = require("express");
const cors = require("cors");
const authRouter = require("./routes/auth");
require("dotenv").config();

const app = express();

app.use(express.json()); 

app.use(cors(
  // cors setup definition 
));

//validation middleware-here


// middlewares here
app.use("/auth", authRouter);


//Error middleware as last resort

//export app 
module.exports = app;

//Run node app here
const PORT = process.env.PORT;
app.listen(PORT ,()=>{
    console.log(` Node app is running on port: ${PORT}`);
});