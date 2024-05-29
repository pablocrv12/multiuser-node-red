const express = require("express");
const router = express.Router();
const classController = require("../../controllers/classController");
const passport = require('passport');

router
  .get('/', passport.authenticate('jwt', { session: false }), classController.getAllClases)
  .get("/:classId", passport.authenticate('jwt', { session: false }), classController.getOneClase)
  .post("/", passport.authenticate('jwt', { session: false }), classController.createNewClase)
  .patch("/:classId", passport.authenticate('jwt', { session: false }), classController.updateClase)
  .delete("/:classId", passport.authenticate('jwt', { session: false }), classController.deleteClase);

module.exports = router;