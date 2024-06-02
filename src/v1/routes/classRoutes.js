const express = require("express");
const router = express.Router();
const classController = require("../../controllers/classController");
const passport = require('passport');

router
  .get('/', passport.authenticate('jwt', { session: false }), classController.getAllClases)
  .get("/:classId", passport.authenticate('jwt', { session: false }), classController.getOneClase)
  .get("/students/:classId", passport.authenticate('jwt', { session: false }), classController.getStudentsByClassId)
  .post('/:classId/flow/:flowId', passport.authenticate('jwt', { session: false }), classController.addFlow)
  .get("/:classId", passport.authenticate('jwt', { session: false }), classController.getOneClaseByProfessor)
  .get("/:classId/flows", passport.authenticate('jwt', { session: false }), classController.getFlowsByClase)
  .post("/", passport.authenticate('jwt', { session: false }), classController.createNewClase)
  .patch("/:classId", passport.authenticate('jwt', { session: false }), classController.updateClase)
  .delete("/:classId", passport.authenticate('jwt', { session: false }), classController.deleteClase)
  .delete(":classId/eject/:userId", passport.authenticate('jwt', { session: false }), classController.ejectStudentFromClass)
  .post('/join/:classId', passport.authenticate('jwt', { session: false }),classController.joinClass)
  .post('/send-invite', async (req, res) => {
    const { recipientEmails, className, classId } = req.body;
    const inviteLink = `http://localhost:3000/class/${classId}`;
    
    try {
        await Promise.all(recipientEmails.map(email => emailService.sendInviteEmail(email, className, inviteLink)));
        res.status(200).send({ message: 'Invitations sent successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error sending invitations', error });
    }
  });

module.exports = router;