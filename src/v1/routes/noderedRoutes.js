const express = require('express');
const passport = require('passport');
const nodeRedController = require('../../controllers/nodeRedController');
const router = express.Router();

router.post('/start-nodered', passport.authenticate('jwt', { session: false }), nodeRedController.startNodeRed);
router.post('/stop-nodered', passport.authenticate('jwt', { session: false }), nodeRedController.stopNodeRed);

module.exports = router;
