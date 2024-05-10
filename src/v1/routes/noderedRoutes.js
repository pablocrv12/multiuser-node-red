const express = require("express");
const router = express.Router();

// Ruta para acceder a Node-RED
router.get("/nodered", (req, res) => {
    // Redirigir al usuario a la interfaz de Node-RED
    res.redirect('http://127.0.0.1:1880/');
});

module.exports = router