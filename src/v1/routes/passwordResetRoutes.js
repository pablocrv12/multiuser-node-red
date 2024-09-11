const express = require('express');
const passwordResetController = require('../../controllers/passwordResetController');
const router = express.Router();

router
    .post('/send-reset-password', passwordResetController.sendResetPassword)
    .post('/reset-password', passwordResetController.resetPassword);

module.exports = router;
