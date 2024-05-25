const express = require("express");
const router = express.Router();
const flowController = require("../../controllers/flowController");
const passport = require('passport');

router
  .get('/', passport.authenticate('jwt', { session: false }), flowController.getAllFlows)
  .get("/:flowId", passport.authenticate('jwt', { session: false }), flowController.getOneFlow)
  .post("/", passport.authenticate('jwt', { session: false }), flowController.createNewFlow)
  .patch("/:flowId", passport.authenticate('jwt', { session: false }), flowController.updateFlow)
  .delete("/:flowId", passport.authenticate('jwt', { session: false }), flowController.deleteFlow);

module.exports = router;