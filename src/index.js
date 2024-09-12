const express = require("express");
const cors = require('cors');
const passport = require('passport');
const v1FlowRouter = require("./v1/routes/flowRoutes");
const v1ClassRouter = require("./v1/routes/classRoutes");
const v1UserRouter = require("./v1/routes/userRoutes");
const v1noderedRouter = require("./v1/routes/nodeRedRoutes");
const v1passwordResetRouter = require("./v1/routes/passwordResetRoutes");
const v1EmailRouter = require("./v1/routes/emailRoutes");
const initDb = require("./config/db");
const path = require('path'); 
require('dotenv').config();





const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(passport.initialize());

require('./config/passport');


// Rutas API
app.use("/api/v1/flow", v1FlowRouter);
app.use("/api/v1/user", v1UserRouter);
app.use("/api/v1/class", v1ClassRouter);
app.use("/api/v1/node", v1noderedRouter);
app.use("/api/v1/reset", v1passwordResetRouter);
app.use("/api/v1/email", v1EmailRouter);

// Iniciar servidor
app.listen(PORT, () => {
    console.log("Server listening on port: " + PORT);
});

initDb();
