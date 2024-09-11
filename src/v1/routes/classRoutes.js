const express = require("express");
const router = express.Router();
const classController = require("../../controllers/classController");
const passport = require('passport');
const sendMail = require('../../services/emailService');



router
  .get('/', passport.authenticate('jwt', { session: false }), classController.getAllClases)
  .get("/:classId", passport.authenticate('jwt', { session: false }), classController.getOneClase)
  .get("/students/:classId", passport.authenticate('jwt', { session: false }), classController.getStudentsByClassId)
  .post('/:classId/uploadFlow/:flowId', passport.authenticate('jwt', { session: false }), classController.addFlow)
  .get("/:classId", passport.authenticate('jwt', { session: false }), classController.getOneClaseByProfessor)
  .get("/:classId/flows", passport.authenticate('jwt', { session: false }), classController.getFlowsByClase)
  .get("/:classId/AllFlows", passport.authenticate('jwt', { session: false }), classController.getAllFlowsByClase)
  .post("/", passport.authenticate('jwt', { session: false }), classController.createNewClase)
  .patch("/:classId", passport.authenticate('jwt', { session: false }), classController.updateClase)
  .patch("/:classId/eject/:userId", passport.authenticate('jwt', { session: false }), classController.ejectStudentFromClass)
  .patch("/:classId/leave/:userId", passport.authenticate('jwt', { session: false }), classController.leaveClass)
  .patch("/:classId/deleteFlow/:flowId", passport.authenticate('jwt', { session: false }), classController.deleteFlowFromClass)
  .delete("/:classId", passport.authenticate('jwt', { session: false }), classController.deleteClase)
  .post('/join/:classId', passport.authenticate('jwt', { session: false }),classController.joinClass);


module.exports = router;