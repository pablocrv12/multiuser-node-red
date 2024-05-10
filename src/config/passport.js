const { compareSync } = require('bcrypt');
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const UserModel = require('../models/User')

passport.use(new LocalStrategy(
    function (email, password, done) {
        console.log("Consultando la base de datos para el usuario con el correo electrónico:", email);
        UserModel.findOne({ email: email }, function (err, user) {
            if (err) { 
                console.error("Error al consultar la base de datos:", err);
                return done(err); 
            }

            if (!user) {  
                console.log("No se encontró ningún usuario con el correo electrónico:", email);
                return done(null, false, { message: 'Incorrect email.' });
            }

            if (!compareSync(password, user.password)) { 
                console.log("La contraseña proporcionada es incorrecta para el usuario:", email);
                return done(null, false, { message: 'Incorrect password.' });
            }

            console.log("Inicio de sesión exitoso para el usuario:", email);
            return done(null, user); 
        });
    }
));

//Persists user data inside session
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

//Fetches session details using session id
passport.deserializeUser(async function (id, done) {
    try {
        const user = await UserModel.findById(id);
        console.log("Usuario deserializado:", user);
        done(null, user);
    } catch (error) {
        console.error("Error al deserializar usuario:", error);
        done(error);
    }
});