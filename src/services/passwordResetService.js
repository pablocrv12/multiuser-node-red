const passwordResetDataAccess = require('../dataAccess/passwordResetDataAccess'); // Asegúrate de ajustar la ruta del modelo
const emailService = require('./emailService'); // Importa el servicio de email
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const User = require('../models/User'); 
userDataAccess = require('../dataAccess/userDataAccess');

const generateResetToken = () => {
  return crypto.randomBytes(20).toString('hex');
};


const sendResetPasswordEmail = async (email) => {
    // Generar eñ token de recuperación
    const resetToken = generateResetToken();
    const expiresAt = new Date(Date.now() + 3600000); // El token expira en 1 hora

    // Guardar el token en la base de datos
    await passwordResetDataAccess.create({
        email,
        token: resetToken,
        expiresAt
    });

    const resetLink = `https://multi-node-red-830425129942.europe-west1.run.app/changePassword?token=${resetToken}`;

    // Enviar el correo electrónico con el enlace de recuperación
    await emailService.sendResetPasswordEmail(email, resetLink);
};



const resetPassword = async (token, newPassword) => {
    try {
        // Buscar el token en la base de datos
        const resetRecord = await passwordResetDataAccess.findResetRecord(token);

        if (!resetRecord) {
            throw new Error('Invalid or expired token');
        }

        // Obtener el email asociado al token
        const email = resetRecord.email;

        // Buscar al usuario por su email
        const user = await userDataAccess.findOneByEmail(email);

        if (!user) {
            throw new Error('User not found');
        }

        
        // Hashear la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar el usuario con la nueva contraseña
        await userDataAccess.findByIdAndUpdate(user._id, { password: hashedPassword });

        // Eliminar el token después de usarlo
        await passwordResetDataAccess.deleteResetToken(token);
    } catch (error) {
        throw new Error(`Failed to reset password: ${error.message}`);
    }
};

module.exports = {
    sendResetPasswordEmail,
    resetPassword
};
