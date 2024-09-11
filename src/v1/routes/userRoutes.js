const express = require("express");
const router = express.Router();
const userController = require("../../controllers/userController");
const passport = require('passport');
const sendMail = require('../../services/sendMail');
const PasswordReset = require('../../models/PasswordReset');
const User = require('../../models/User');
const bcrypt = require('bcrypt');


router
  .get("/", userController.getAllUsers)
  .get("/:userId", userController.getOneUser)
  .get('/userByEmail/:email', userController.getUserByEmail)
  .get("/joinedclasses/:userId", passport.authenticate('jwt', { session: false }), userController.getJoinedClasses)
  .get("/createdclasses/:userId", passport.authenticate('jwt', { session: false }), userController.getCreatedClasses)
  .get("/flows/:userId", passport.authenticate('jwt', { session: false }), userController.getFlowsByUser)
  .patch("/:userId", userController.updateUser)
  .delete("/:userId", userController.deleteUser)
  .get("/rol/:userId", passport.authenticate('jwt', { session: false }), userController.getUserRole)
  .post('/send-reset-password', async (req, res) => {
    const { email } = req.body;

    // Generar un token de restablecimiento
    const resetToken = generateResetToken();
    const expiresAt = new Date(Date.now() + 3600000); // El token expira en 1 hora

    try {
        // Guardar el token en la base de datos
        await PasswordReset.create({
            email,
            token: resetToken,
            expiresAt
        });

        const resetLink = `https://frontend-app.com/changePassword?token=${resetToken}`;

        // Enviar el correo electrónico con el enlace de recuperación
        await sendMail.sendResetPasswordEmail(email, resetLink);

        res.status(200).send({ message: 'Password reset email sent successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error sending password reset email', error: error.message });
    }
})
.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
  
    try {
        // Buscar el token en la base de datos
        const resetRecord = await PasswordReset.findOne({
            token,
            expiresAt: { $gt: Date.now() } // Verificar que el token no ha expirado
        });
  
        if (!resetRecord) {
            return res.status(400).send({ message: 'Invalid or expired token' });
        }
  
        // Obtener el email asociado al token
        const email = resetRecord.email;
  
        // Buscar al usuario por su email
        const user = await User.findOne({ email }).exec();
  
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
  
        // Hashear la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);
  
        // Actualizar el usuario con la nueva contraseña
        await User.findByIdAndUpdate(user._id, { password: hashedPassword });
  
        // Eliminar el registro de token después de usarlo
        await PasswordReset.deleteOne({ token });
  
        // Enviar una respuesta exitosa
        res.status(200).send({ message: 'Password reset successfully' });
    } catch (error) {
        console.error("Error resetting password:", error);
        if (!res.headersSent) {
            res.status(500).send({ message: 'Error resetting password', error: error.message });
        }
    }
  });
  

const crypto = require('crypto');

const generateResetToken = () => {
  return crypto.randomBytes(20).toString('hex');
};

module.exports = router