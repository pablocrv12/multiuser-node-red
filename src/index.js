const express = require("express");
const cors = require('cors');
const passport = require('passport');
const v1FlowRouter = require("./v1/routes/flowRoutes");
const v1ClassRouter = require("./v1/routes/classRoutes");
const v1UserRouter = require("./v1/routes/userRoutes");
const v1noderedRouter = require("./v1/routes/noderedRoutes");
const v1passwordResetRouter = require("./v1/routes/passwordResetRoutes");
const v1EmailRouter = require("./v1/routes/emailRoutes");
const initDb = require("./config/db");
const path = require('path'); 
const UserModel = require('./models/User');
const { hashSync, compareSync } = require('bcrypt');
const jwt = require('jsonwebtoken');
const { exec } = require('child_process');
require('dotenv').config();
const util = require('util');
const execPromise = util.promisify(exec);


const app = express();
const PORT = process.env.PORT || 3000;

let portCounter = 1880; // Puerto inicial
const userPortMap = {}; // Mapeo de userId a puertos



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(passport.initialize());

require('./config/passport');


// Ruta al archivo de la cuenta de servicio
const keyFilePath = path.join(__dirname, 'multiuser-node-red-a7bc8e2d8abd.json');
        

// Función para ejecutar comandos
function execCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve(stdout.trim());
            }
        });
    });
}


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