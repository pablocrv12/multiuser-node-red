const express = require("express");
const router = express.Router();
const userController = require("../../controllers/userController");
const passport = require('passport');
const emailService = require('../../services/emailService');
const PasswordReset = require('../../models/PasswordReset');
const User = require('../../models/User');
const bcrypt = require('bcrypt');


router
  .post('/register', userController.registerUser)
  .post('/login', userController.loginUser)
  .get("/", userController.getAllUsers)
  .get("/:userId", userController.getOneUser)
  .get('/userByEmail/:email', userController.getUserByEmail)
  .get("/joinedclasses/:userId", passport.authenticate('jwt', { session: false }), userController.getJoinedClasses)
  .get("/createdclasses/:userId", passport.authenticate('jwt', { session: false }), userController.getCreatedClasses)
  .get("/flows/:userId", passport.authenticate('jwt', { session: false }), userController.getFlowsByUser)
  .patch("/:userId", userController.updateUser)
  .delete("/:userId", userController.deleteUser)
  .get("/rol/:userId", passport.authenticate('jwt', { session: false }), userController.getUserRole)
  
module.exports = router