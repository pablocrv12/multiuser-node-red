const express = require("express");
const cors = require('cors');
const passport = require('passport');
const session = require("express-session");
const v1FlowRouter = require("./v1/routes/flowRoutes");
const v1UserRouter = require("./v1/routes/userRoutes");
const v1noderedRouter = require("./v1/routes/noderedRoutes");
const initDb = require("./config/db");
const path = require('path');
const UserModel = require('./models/User')
const MongoStore = require('connect-mongo')
const { hashSync } = require('bcrypt');



const app = express();
app.use(express.urlencoded({extended: true}));

/*
app.use(cookieParser('mi ultra hiper secreto'));
app.use(session({
secret: 'mi ultra hiper secreto',
resave: true,
saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new PassportLocal(function(email,password,done){
    if(email === "codigofacilito" && password === "12345678")
        return done(null, {id: 1, name: "Cody"});

    done(null, false);  
}))

// serializacion
passport.serializeUser(function(user,done){
    done(null, user.id);
});


// deserializacion
passport.deserializeUser(function(id, done,){
    done(null, {id: 1, name: "Cody"})
})

*/

const PORT = process.env.PORT || 3000;

/*
app.set('view engine', 'ejs');

app.get("/", (req,res,next)=>{
    // comprueba si ha iniciado sesion
    if(req.isAuthenticated()) return next();

    // si no ha iniciado sesion redirecciona a login
    res.redirect("/login");
}, (req,res) => {
    // si ya iniciamos mostrar bienvenida

    // Si no hemos iniciado sesión redireccionar a /login
    res.send("hola");
});

app.get("/login", (req,res) => {
    // Mostrar el formulario de login, hacerlo con react
    res.render("login")
});

app.post("/login", passport.authenticate('local',{
    successRedirect: "/", 
    failureRedirect: "/login"
    }));

*/ 

// tutorial
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')
app.use(express.urlencoded({extended: true}))
app.use(session({
    secret: 'mi ultra hiper secreto',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({mongoUrl: 'mongodb+srv://pablocarvajalbenitez:y1O44Y1Y9endY7Kb@clustertfg.bblxsmc.mongodb.net/Multiuser-Node-RED', collectionName: "sessions"}),
    cookie: {
        maxAge : 1000 * 60 * 60 * 24
    }
    }));

require('./config/passport')

app.use(passport.initialize())
app.use(passport.session())

app.get('/login', (req,res) => {
    res.render('login')
})  

app.get('/register', (req,res) => {
    res.render('register')
})  

    app.post('/login', (req, res, next) => {
        console.log("Datos recibidos en la solicitud POST /login:", req.body); // Agregar este console.log para ver los datos recibidos en la solicitud POST

        passport.authenticate('local', (err, user, info) => {
            if (err) {
                console.error("Error durante la autenticación:", err); // Agregar este console.error para mostrar errores durante la autenticación
                return next(err);
            }
            if (!user) {
            
                console.log("Usuario no encontrado o contraseña incorrecta:", info.message); // Agregar este console.log para mostrar el mensaje de error de autenticación
                return res.redirect('/login?error=' + encodeURIComponent(info.message));
            }
            req.login(user, (err) => {
                if (err) {
                    console.error("Error al iniciar sesión:", err); // Agregar este console.error para mostrar errores al iniciar sesión
                    return next(err);
                }
                console.log("Inicio de sesión exitoso para el usuario:", user); // Agregar este console.log para mostrar información sobre el usuario que inició sesión con éxito
                return res.redirect('/protected');
            });
        })(req, res, next);
    });

app.post('/register', (req, res) => {
    let user = new UserModel({
        email: req.body.email,
        password: hashSync(req.body.password, 10)  
    });

    user.save()
        .then(user => {
            // Iniciar sesión después de que el usuario se haya guardado exitosamente
            req.login(user, err => {
                if (err) {
                    return next(err);
                }
                // Redireccionar o enviar la respuesta según sea necesario
                res.redirect('/protected');
            });
        })
        .catch(err => {
            // Manejo de errores en caso de que falle el registro del usuario
            console.error(err);
            res.status(500).send({ success: false, error: 'Error en el registro de usuario' });
        });
});

app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return next(err);
        }
        res.redirect("/login");
    });
});

app.get('/protected', (req, res) => {
    if (req.isAuthenticated()) {
        res.send("Protected")
    } else {
        res.status(401).send({ msg: "Unauthorized" })
    }
    console.log(req.session)
    console.log(req.user)
}) 

app.use(cors());

app.use(express.json());
app.use("/api/v1/flow", v1FlowRouter);
app.use("/api/v1/user", v1UserRouter);
app.use("/api/v1/node", v1noderedRouter);



// starting server
app.listen(PORT,()=> {
    console.log("servidor escuchando en el puerto: " +PORT);
});

initDb();