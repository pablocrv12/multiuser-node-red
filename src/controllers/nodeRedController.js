const nodeRedService = require('../services/nodeRedService');



const startNodeRed = async (req, res) => {
    const userId = req.user._id;
    const token = req.headers.authorization.split(' ')[1];

    try {
        const response = await nodeRedService.startNodeRed(userId, token);
        res.status(200).send(response);
    } catch (error) {
        console.error(`Error launching Node-RED container: ${error}`);
        res.status(500).send({
            success: false,
            message: 'Error launching Node-RED container',
            error: error.message,
        });
    }
};

const stopNodeRed = async (req, res) => {
    const userId = req.user._id;

    try {
        const response = await nodeRedService.stopNodeRed(userId);
        res.status(200).send(response);
    } catch (error) {
        console.error(`Error stopping Node-RED service: ${error}`);
        res.status(500).send({
            success: false,
            message: 'Error stopping Node-RED service',
            error: error.message,
        });
    }
};

module.exports = {
    startNodeRed,
    stopNodeRed,
};
