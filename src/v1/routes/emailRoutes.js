const express = require('express');
const router = express.Router();
const emailController = require('../../controllers/emailController');

router.post('/send-invite', emailController.sendInvite);

module.exports = router;
