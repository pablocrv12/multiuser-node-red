const nodemailer = require('nodemailer');
require('dotenv').config();


const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS
    }
});

// Función para enviar correo de invitación
const sendInviteEmail = (recipientEmail, className, inviteLink) => {
    return new Promise((resolve, reject) => {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recipientEmail,
            subject: `Multiuser-NodeRED - Invitación a la clase ${className}`,
            text: `Has sido invitado a unirte a la clase ${className}. Utiliza el siguiente código para unirte a la clase: ${inviteLink}
            
            Regístrate o inicia sesión aquí: https://frontend-service-830425129942.europe-west1.run.app`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error al enviar el email:', error);
                return reject(error);
            }
            console.log('Email enviado:', info.response);
            resolve(info);
        });
    });
};

// Función para enviar correo de restablecimiento de contraseña
// Función para enviar correo de recuperación de contraseña
const sendResetPasswordEmail = (recipientEmail, resetLink) => {
    return new Promise((resolve, reject) => {
        const mailOptions = {
            from: "process.env.EMAIL_USER",
            to: recipientEmail,
            subject: 'Restablecimiento de contraseña',
            text: `Has solicitado restablecer tu contraseña. Usa el siguiente enlace para establecer una nueva contraseña: ${resetLink}. 
                   El enlace caducará en una hora.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error al enviar el email:', error);
                return reject(error);
            }
            console.log('Email enviado:', info.response);
            resolve(info);
        });
    });
};

module.exports = {
    sendInviteEmail,
    sendResetPasswordEmail
};