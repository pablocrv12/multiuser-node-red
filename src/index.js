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
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

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

// Iniciar Node-RED
app.post('/start-nodered', passport.authenticate('jwt', { session: false }), (req, res) => {
    const userId = req.user._id;
    const token = req.headers.authorization.split(' ')[1]; // Obtener el token sin "Bearer"

    const command = `docker run -d -e JWT_TOKEN="${token}" --name nodered-${userId} -p 1880:1880 node-red-modified:latest`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error launching Node-RED container: ${error}`);
            return res.status(500).send({
                success: false,
                message: 'Error launching Node-RED container',
                error: error.message
            });
        }

        return res.status(200).send({
            success: true,
            message: 'Node-RED container started successfully',
            containerId: stdout.trim()
        });
    });
});


// Configurar el transporte de Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "multiusernodered@gmail.com", // Almacenar en variables de entorno
        pass: "multinoderedpass"  // Almacenar en variables de entorno
    }
});

// Función para enviar correo de invitación
const sendInviteEmail = (recipientEmail, className, inviteLink) => {
    const mailOptions = {
        from: "multiusernodered@gmail.com",
        to: recipientEmail,
        subject: `Invitación a la clase ${className}`,
        text: `Has sido invitado a unirte a la clase ${className}. Usa el siguiente enlace para unirte: ${inviteLink}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Email sent: ' + info.response);
    });
};

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
