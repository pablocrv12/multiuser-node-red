const authorize = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        // Primero, autenticamos el token JWT del usuario
        passport.authenticate('jwt', { session: false }),

        // Luego, verificamos los roles del usuario
        (req, res, next) => {
            // Comprobamos si se requieren roles y si el usuario tiene alguno de esos roles
            if (roles.length && !roles.some(role => req.user.roles.includes(role))) {
                // El rol del usuario no está autorizado
                return res.status(401).json({ message: 'Unauthorized' });
            }

            // Si el usuario tiene los roles necesarios, se continúa
            next();
        }
    ];
};

module.exports = authorize;