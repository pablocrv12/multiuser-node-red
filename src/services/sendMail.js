const nodemailer = require('nodemailer');



const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "multiusernodered@gmail.com", // Almacenar en variables de entorno
        pass: "psruvqwmkhckztlz"  // Almacenar en variables de entorno
    }
});

// Función para enviar correo de invitación
const sendInviteEmail = (recipientEmail, className, inviteLink) => {
    return new Promise((resolve, reject) => {
        const mailOptions = {
            from: "multiusernodered@gmail.com",
            to: recipientEmail,
            subject: `Invitación a la clase ${className}`,
            text: `Has sido invitado a unirte a la clase ${className}. Usa el siguiente enlace para unirte: ${inviteLink}`
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
            from: "multiusernodered@gmail.com",
            to: recipientEmail,
            subject: 'Restablecimiento de contraseña',
            text: `Has solicitado restablecer tu contraseña. Usa el siguiente enlace para establecer una nueva contraseña: ${resetLink}. 
                   Si no solicitaste esto, puedes ignorar este correo.`
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