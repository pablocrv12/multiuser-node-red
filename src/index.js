const express = require("express");
const cors = require('cors');
const passport = require('passport');
const v1FlowRouter = require("./v1/routes/flowRoutes");
const v1UserRouter = require("./v1/routes/userRoutes");
const v1noderedRouter = require("./v1/routes/noderedRoutes");
const initDb = require("./config/db");
const path = require('path');
const UserModel = require('./models/User')
const { hashSync, compareSync } = require('bcrypt');
const jwt = require('jsonwebtoken')
const { exec } = require('child_process');


const app = express();


const PORT = process.env.PORT || 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')
app.use(express.json());
app.use(express.urlencoded({extended: true}))
app.use(cors());
app.use(passport.initialize())

require('./config/passport')

app.get('/login', (req,res) => {
    res.render('login')
})  

app.get('/register', (req, res) => {
    res.render('register')
})

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

        const payload = {
            email: user.email,
            id: user._id
        }

        const token = jwt.sign(payload, "Random string", { expiresIn: "5m" });

        return res.status(200).send({
            success: true,
            message: "Logged in successfully!",
            token: "Bearer " + token,
            userId: user._id // Enviar el userId al cliente
        });
    });
});

app.post('/register', (req, res) => {
    const user = new UserModel({
        email: req.body.email,
        password: hashSync(req.body.password, 10)
    })
    
    user.save().then(user => {
        res.send({
            success: true,
            message: "User created successfully.",
            user: {
                id: user._id,
                email: user.email
            }
        })
    }).catch(err => {
        res.send({
            success: false,
            message: "Something went wrong",
            error: err
        })
    })
})

app.get('/logout', (req, res) => {
    // Eliminar el token JWT del cliente
    // Puedes utilizar localStorage.removeItem() o sessionStorage.removeItem() según dónde esté almacenado el token en el cliente
    //res.clearCookie('jwtToken'); // Si estás utilizando cookies para almacenar el token
    
    // Opcional: Invalidar el token en el servidor
    // Agrega el token a una lista negra de tokens revocados o realiza cualquier otra acción necesaria para invalidar el token
    
    // Redirigir al usuario a la página de inicio de sesión
    //res.redirect('/login');
});

app.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
    return res.status(200).send({
        success: true,
        user: {
            id: req.user._id,
            email: req.user.email,
        }
    })
})

app.post('/start-nodered', passport.authenticate('jwt', { session: false }), (req, res) => {
    const userId = req.user._id;

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


app.use("/api/v1/flow", v1FlowRouter);
app.use("/api/v1/user", v1UserRouter);
app.use("/api/v1/node", v1noderedRouter);



// starting server
app.listen(PORT,()=> {
    console.log("servidor escuchando en el puerto: " +PORT);
});

initDb();