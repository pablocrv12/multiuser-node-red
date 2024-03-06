const express = require("express");
const router = express.Router();
const flowController = require("../../controllers/flowController");

router
  .get("/", flowController.getAllFlows)
  .get("/:flowId", flowController.getOneFlow)
  .post("/", flowController.createNewFlow)
  .patch("/:flowId", flowController.updateFlow)
  .delete("/:flowId", flowController.deleteFlow);

module.exports = router