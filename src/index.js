const express = require("express");
const v1FlowRouter = require("./v1/routes/flowRoutes");
const initDb = require("./config/db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/v1/flow", v1FlowRouter);

// starting server
app.listen(PORT,()=> {
    console.log("servidor escuchando...");
});

initDb();