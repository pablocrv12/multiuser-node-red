const passwordResetService = require('../services/passwordResetService');

const sendResetPassword = async (req, res) => {
    const { email } = req.body;

    try {
        await passwordResetService.sendResetPasswordEmail(email);
        res.status(200).send({ message: 'Password reset email sent successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error sending password reset email', error: error.message });
    }
};

const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        await passwordResetService.resetPassword(token, newPassword);
        res.status(200).send({ message: 'Password reset successfully' });
    } catch (error) {
        console.error("Error resetting password:", error);
        if (!res.headersSent) {
            res.status(500).send({ message: 'Error resetting password', error: error.message });
        }
    }
};

module.exports = {
    sendResetPassword,
    resetPassword
};
