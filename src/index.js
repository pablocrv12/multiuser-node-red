const express = require("express");
const cors = require('cors');
const passport = require('passport');
const v1FlowRouter = require("./v1/routes/flowRoutes");
const v1ClassRouter = require("./v1/routes/classRoutes");
const v1UserRouter = require("./v1/routes/userRoutes");
const v1noderedRouter = require("./v1/routes/noderedRoutes");
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

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(passport.initialize());

require('./config/passport');

// Ruta de inicio de sesión
app.post('/login', (req, res) => {
    UserModel.findOne({ email: req.body.email }).then(user => {
        if (!user) {
            return res.status(401).send({
                success: false,
                message: "Could not find the user."
            });
        }

        if (!compareSync(req.body.password, user.password)) {
            return res.status(401).send({
                success: false,
                message: "Incorrect password"
            });
        }

        const payload = { email: user.email, id: user._id };
        const token = jwt.sign(payload, "Random string", { expiresIn: "60m" });

        return res.status(200).send({
            success: true,
            message: "Logged in successfully!",
            token: "Bearer " + token,
            userId: user._id
        });
    });
});

// Ruta de registro
app.post('/register', (req, res) => {
    const { email, password, role, name } = req.body;
    const user = new UserModel({
        email,
        password: hashSync(password, 10),
        role, // Guardar el rol como cadena
        name // Guardar el nombre
    });

    user.save().then(user => {
        res.send({
            success: true,
            message: "User created successfully.",
            user: {
                id: user._id,
                email: user.email,
                role: user.role, // Devolver el rol del usuario
                name: user.name // Devolver el nombre del usuario
            }
        });
    }).catch(err => {
        res.status(500).send({
            success: false,
            message: "Something went wrong",
            error: err.message
        });
    });
});


// Ruta protegida
app.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
    return res.status(200).send({
        success: true,
        user: {
            id: req.user._id,
            email: req.user.email,
            role: req.user.role
        }
    });
});

// Iniciar Node-REd

const assignPortToUser = (userId) => {
    if (!userPortMap[userId]) {
        userPortMap[userId] = portCounter++;
    }
    return userPortMap[userId];
};

app.post('/start-nodered', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const userId = req.user._id;
    const token = req.headers.authorization.split(' ')[1];

    // Define the service name and other parameters
    const serviceName = `nodered-${userId}`;
    const imageName = 'gcr.io/multiuser-node-red/node-red-image';
    const region = 'europe-west1';
    try {
        // Deploy the service
        const deployCommand = `gcloud run deploy ${serviceName} --image ${imageName} --platform managed --region ${region} --allow-unauthenticated --set-env-vars JWT_TOKEN=${token}`;
        console.log(deployCommand)
        await execPromise(deployCommand);
        console.log(deployCommand)
        // Wait for the deployment to be ready
        await new Promise(resolve => setTimeout(resolve, 35000)); // Increase if needed

        // Get the URL of the deployed service
        const describeCommand = `gcloud run services describe ${serviceName} --platform managed --region ${region} --format="value(status.url)"`;
        const { stdout: url } = await execPromise(describeCommand);
        console.log(url.trim())
        return res.status(200).send({
            success: true,
            message: 'Node-RED container started successfully',
            url: url.trim()
        });
    } catch (error) {
        console.error(`Error launching Node-RED container: ${error}`);
        return res.status(500).send({
            success: false,
            message: 'Error launching Node-RED container',
            error: error.message
        });
    }
});

// Endpoint para detener Node-RED
app.post('/stop-nodered', passport.authenticate('jwt', { session: false }), (req, res) => {
    const userId = req.user._id;

    const command = `docker stop nodered-${userId} && docker rm nodered-${userId}`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error stopping Node-RED container: ${error}`);
            return res.status(500).send({
                success: false,
                message: 'Error stopping Node-RED container',
                error: error.message
            });
        }

        return res.status(200).send({
            success: true,
            message: 'Node-RED container stopped and removed successfully'
        });
    });
});

// Rutas adicionales
app.use("/api/v1/flow", v1FlowRouter);
app.use("/api/v1/user", v1UserRouter);
app.use("/api/v1/class", v1ClassRouter);
app.use("/api/v1/node", v1noderedRouter);

// Iniciar servidor
app.listen(PORT, () => {
    console.log("Server listening on port: " + PORT);
});

initDb();
