const express = require('express');
const passport = require('passport');
const noderedController = require('../../controllers/nodeRedController');

const router = express.Router();

// Ruta para iniciar Node-RED
router
.post('/start-nodered', passport.authenticate('jwt', { session: false }), noderedController.startNodered)
.post('/stop-nodered', passport.authenticate('jwt', { session: false }), noderedController.stopNodered);

module.exports = router;
