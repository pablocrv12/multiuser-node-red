const express = require("express");
const router = express.Router();
const userController = require("../../controllers/userController");
const passport = require('passport');

router
  .get("/", userController.getAllUsers)
  .get("/:userId", userController.getOneUser)
  .get("/joinedclasses/:userId", passport.authenticate('jwt', { session: false }), userController.getJoinedClasses)
  .get("/createdclasses/:userId", passport.authenticate('jwt', { session: false }), userController.getCreatedClasses)
  .get("/flows/:userId", passport.authenticate('jwt', { session: false }), userController.getFlowsByUser)
  .post("/", userController.createNewUser)
  .patch("/:userId", userController.updateUser)
  .delete("/:userId", userController.deleteUser)
  .get("/rol/:userId", passport.authenticate('jwt', { session: false }), userController.getUserRole)

module.exports = router