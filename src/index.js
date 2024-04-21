const express = require("express");
const cors = require('cors');
const v1FlowRouter = require("./v1/routes/flowRoutes");
const initDb = require("./config/db");


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());
app.use("/api/v1/flow", v1FlowRouter);



// starting server
app.listen(PORT,()=> {
    console.log("servidor escuchando en el puerto: " +PORT);
});

initDb();