const express = require("express");
const router = express.Router();
const classController = require("../../controllers/classController");
const passport = require('passport');
const sendMail = require('../../services/sendMail');



router
  .get('/', passport.authenticate('jwt', { session: false }), classController.getAllClases)
  .get("/:classId", passport.authenticate('jwt', { session: false }), classController.getOneClase)
  .get("/students/:classId", passport.authenticate('jwt', { session: false }), classController.getStudentsByClassId)
  .post('/:classId/uploadFlow/:flowId', passport.authenticate('jwt', { session: false }), classController.addFlow)
  .get("/:classId", passport.authenticate('jwt', { session: false }), classController.getOneClaseByProfessor)
  .get("/:classId/flows", passport.authenticate('jwt', { session: false }), classController.getFlowsByClase)
  .get("/:classId/flowsStudent", passport.authenticate('jwt', { session: false }), classController.getFlowsByClaseandStudent)
  .post("/", passport.authenticate('jwt', { session: false }), classController.createNewClase)
  .patch("/:classId", passport.authenticate('jwt', { session: false }), classController.updateClase)
  .patch("/:classId/eject/:userId", passport.authenticate('jwt', { session: false }), classController.ejectStudentFromClass)
  .patch("/:classId/leave/:userId", passport.authenticate('jwt', { session: false }), classController.leaveClass)
  .patch("/:classId/deleteFlow/:flowId", passport.authenticate('jwt', { session: false }), classController.deleteFlowFromClass)
  .delete("/:classId", passport.authenticate('jwt', { session: false }), classController.deleteClase)
  .post('/join/:classId', passport.authenticate('jwt', { session: false }),classController.joinClass)
  .post('/send-invite', async (req, res) => {
    const { recipientEmails, className, classId } = req.body;
    const inviteLink = `${classId}`;
    try {
        await Promise.all(recipientEmails.map(email => {
            return sendMail.sendInviteEmail(email, className, inviteLink);
        }));
        res.status(200).send({ message: 'Invitations sent successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error sending invitations', error: error.message });
    }
});


module.exports = router;