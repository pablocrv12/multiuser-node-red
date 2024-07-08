const nodemailer = require('nodemailer');



const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: "smtp.gmail.com",
    port: 300,
    auth: {
        user: "multiusernodered@gmail.com", // Almacenar en variables de entorno
        pass: "psruvqwmkhckztlz"  // Almacenar en variables de entorno
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

module.exports = {
    sendInviteEmail
}