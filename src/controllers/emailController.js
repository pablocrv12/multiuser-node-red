const emailService = require('../services/emailService');

const sendInvite = async (req, res) => {
    const { recipientEmails, className, classId } = req.body;
    try {
        await emailService.sendInviteEmail(recipientEmails, className, classId);
        res.status(200).send({ message: 'Invitations sent successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error sending invitations', error: error.message });
    }
};

module.exports = {
    sendInvite
};
