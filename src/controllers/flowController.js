const flowService = require("../services/flowService");

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
    const userId = req.user._id;
    const { params: { flowId } } = req;

    if (!flowId) {
        return res.status(400).json({ status: "Error", message: "Flow ID is required" });
    }

    try {
        const flow = await flowService.getOneFlow(userId, flowId);
        if (!flow) {
            return res.status(404).json({ status: "Error", message: "Flow not found" });
        }
        res.status(200).json({ status: "Ok", data: flow });
    } catch (error) {
        console.error("Error getting flow:", error);
        res.status(500).json({ status: "Error", message: "Failed to get flow" });
    }
};

const createNewFlow = async (req, res) => {
    const userId = req.user._id;
    const { body } = req;

    if (!body.name) {
        return res.status(400).send({ status: "Error", message: "Name is required" });
    }

    const newFlow = { name: body.name, nodes: body.nodes, userId: userId };

    try {
        const createdFlow = await flowService.createNewFlow(newFlow);
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
    const userId = req.user._id; // Obtener el userId del usuario autenticado
    const { flowId } = req.params;

    try {
        if (!flowId) {
            return res.status(400).json({ status: "Error", message: "Flow ID is required" });
        }

        const deletedFlow = await flowService.deleteFlow(userId, flowId);
        if (!deletedFlow) {
            return res.status(404).json({ status: "Error", message: "Flow not found" });
        }

        res.status(204).json({ status: "OK" });
    } catch (error) {
        console.error("Error deleting flow:", error);
        res.status(500).json({ status: "Error", message: "Failed to delete flow" });
    }
};

module.exports = {
    getAllFlows,
    getOneFlow,
    createNewFlow,
    updateFlow,
    deleteFlow
}