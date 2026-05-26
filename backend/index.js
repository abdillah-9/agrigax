const express = require('express');
const app = express();
const cors = require('cors');
const authRouter = require('./src/routes/authRoute');
require("dotenv").config();
const authHandlerMiddleware = require('./src/middlewares/fastAuthenticationMiddleware');
const errorHandlerMiddleware = require('./src/middlewares/errorHandlerMiddleware');

app.use(cors(
    //Cors definition
));

app.use(express.json());

//add auth routes
app.use('/api', authRouter);

//add sample route to apply/test authHandlerMiddleware
app.use('/api',authHandlerMiddleware,fakeSensitiveRouter);


//Last Route for global err handling
app.use('/api',errorHandlerMiddleware);

app.listen(process.env.PORT, ()=>{
    console.log("App is running at port: "+process.env.PORT);
})