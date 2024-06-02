const express = require("express");
const router = express.Router();
const userController = require("../../controllers/userController");
const passport = require('passport');

router
  .get("/", userController.getAllUsers)
  .get("/:userId", userController.getOneUser)
  .get("/classes/:userId", passport.authenticate('jwt', { session: false }), userController.getJoinedClasses)
  .post("/", userController.createNewUser)
  .patch("/:userId", userController.updateUser)
  .delete("/:userId", userController.deleteUser)
  .get("/rol/:userId", passport.authenticate('jwt', { session: false }), userController.getUserRole)

module.exports = router