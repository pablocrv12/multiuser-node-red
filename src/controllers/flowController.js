const flowService = require("../services/flowService");
const User = require("../models/User");

const getAllFlows = async (req, res) => {
    const userId = req.user._id; // Obtener el userId del usuario autenticado
    console.log(userId)
    try {
        const allFlows = await flowService.getAllFlows(userId);
        res.status(200).json({ status: "Ok", data: allFlows });
    } catch (error) {
        console.error("Error getting all flows:", error);
        res.status(500).json({ status: "Error", message: "Failed to get all flows" });
    }
};

const getOneFlow = async (req, res) => {
    const { params: { flowId } } = req;

    if (!flowId) {
        return res.status(400).json({ status: "Error", message: "Flow ID is required" });
    }

    try {
        const flow = await flowService.getOneFlow(flowId);
        if (!flow) {
            return res.status(404).json({ status: "Error", message: "Flow not found" });
        }
        res.status(200).json({ status: "Ok", data: flow });
    } catch (error) {
        console.error("Error getting flow:", error);
        res.status(500).json({ status: "Error", message: "Failed to get flow" });
    }
};

const getClassesByFlow = async (req, res) => {
    const { flowId } = req.params;

    try {
        // Obtener la lista de clases del flujo dado
        const classes = await flowService.getClassesByFlow(flowId);

        // Devolver la lista de clases
        res.status(200).json({ status: 'OK', data: classes });
    } catch (error) {
        console.error('Error retrieving classes by flow:', error);
        res.status(500).json({ status: 'Error', message: 'Server error' });
    }
};


const getUserByFlow = async (req, res) => {
    const { params: { flowId } } = req;

    try {
        // Obtener la lista de clases del flujo dado
        const user = await flowService.getUserByFlow(flowId);

        // Responder con la lista de clases
        res.status(200).json({ status: 'OK', data: user });
    } catch (error) {
        console.error('Error retrieving classes by flow:', error);
        res.status(500).json({ status: 'Error', message: 'Server error' });
    }
};

const createNewFlow = async (req, res) => {
    const userId = req.user._id;
    const { body } = req;
    console.log(userId)
    console.log(body)

    if (!body.name) {
        return res.status(400).send({ status: "Error", message: "Name is required" });
    }

    const newFlow = { name: body.name, nodes: body.nodes, userId: userId };

    try {
        // Crear el nuevo flujo
        const createdFlow = await flowService.createNewFlow(newFlow);

        // Actualizar la lista de flujos del usuario
        await User.findByIdAndUpdate({_id: userId}, { $push: { flows: createdFlow._id } });

        res.status(201).send({ status: "OK", data: createdFlow });
    } catch (error) {
        console.error("Error creating new flow:", error);
        res.status(500).send({ status: "Error", message: "Failed to create new flow" });
    }
};


const updateFlow = async (req, res) => {
    const userId = req.user._id;
    const { body, params: { flowId } } = req;

    if (!flowId) {
        return res.status(400).json({ status: "Error", message: "Flow ID is required" });
    }

    try {
        const updatedFlow = await flowService.updateFlow(userId, flowId, body);
        if (!updatedFlow) {
            return res.status(404).json({ status: "Error", message: "Flow not found" });
        }
        res.status(200).json({ status: "OK", data: updatedFlow });
    } catch (error) {
        console.error("Error updating flow:", error);
        res.status(500).json({ status: "Error", message: "Failed to update flow" });
    }
};

const deleteFlow = async (req, res) => {
    const userId = req.user._id;
    const { params: { flowId } } = req;

    try {
        if (!flowId) {
            return res.status(400).json({ status: "Error", message: "Flow ID is required" });
        }

        // Eliminar el flujo
        const deletedFlow = await flowService.deleteFlow(userId, flowId);
        if (!deletedFlow) {
            return res.status(404).json({ status: "Error", message: "Flow not found" });
        }

        // Actualizar la lista de flujos del usuario
        await User.findByIdAndUpdate(userId, { $pull: { flows: flowId } });

        res.status(204).json({ status: "OK" });
    } catch (error) {
        console.error("Error deleting flow:", error);
        res.status(500).json({ status: "Error", message: "Failed to delete flow" });
    }

};

module.exports = {
    getAllFlows,
    getOneFlow,
    getClassesByFlow,
    getUserByFlow,
    createNewFlow,
    updateFlow,
    deleteFlow
}