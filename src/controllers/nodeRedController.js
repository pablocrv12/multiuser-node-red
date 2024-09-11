const noderedService = require('../services/nodeRedService');

// Controlador para iniciar Node-RED
const startNodered = async (req, res) => {
    const userId = req.user._id;
    const token = req.headers.authorization.split(' ')[1]; // Obtener el token sin "Bearer"

    try {
        const { containerId, port } = await noderedService.startNoderedContainer(userId, token);
        
        // Construir la URL del contenedor Node-RED
        const nodeRedUrl = `http://localhost:${port}`;

        return res.status(200).send({
            success: true,
            message: 'Node-RED container started successfully',
            containerId,
            url: nodeRedUrl
        });
    } catch (error) {
        console.error(`Error launching Node-RED container: ${error.message}`);
        return res.status(500).send({
            success: false,
            message: 'Error launching Node-RED container',
            error: error.message
        });
    }
};


// Controlador para detener Node-RED
const stopNodered = async (req, res) => {
    const userId = req.user._id;

    try {
        await noderedService.stopNoderedContainer(userId);
        return res.status(200).send({
            success: true,
            message: 'Node-RED container stopped and removed successfully'
        });
    } catch (error) {
        console.error(`Error stopping Node-RED container: ${error.message}`);
        return res.status(500).send({
            success: false,
            message: 'Error stopping Node-RED container',
            error: error.message
        });
    }
};

module.exports = {
    startNodered,
    stopNodered
};
