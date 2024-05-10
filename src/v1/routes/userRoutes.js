const express = require("express");
const router = express.Router();
const userController = require("../../controllers/userController");

router
  .get("/", userController.getAllUsers)
  .get("/:userId", userController.getOneUser)
  .post("/", userController.createNewUser)
  .patch("/:userId", userController.updateUser)
  .delete("/:userId", userController.deleteUser);

module.exports = router