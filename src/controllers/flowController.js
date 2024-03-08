const flowService = require("../services/flowService");

const getAllFlows = async (req, res) => {

    try {
        const allFlows = await flowService.getAllFlows();
        res.status(200).json({ status: "Ok", data: allFlows });
    } catch (error) {
        console.error("Error getting all flows:", error);
        res.status(500).json({ status: "Error", message: "Failed to get all flows" });
    }
};

const getOneFlow = async (req, res) => {
    try {
        const {
            params: { flowId },
        } = req;

        if (!flowId) {
            return res.status(400).json({ status: "Error", message: "Flow ID is required" });
        }

        const flow = await flowService.getOneFlow(flowId);
        res.status(200).json({ status: "Ok", data: flow });
    } catch (error) {
        console.error("Error getting flow:", error);
        res.status(500).json({ status: "Error", message: "Failed to get flow" });
    }
};

const createNewFlow = async (req, res) => {
    const { body } = req;

    if (!body.name) {
        return res.status(400).send({ status: "Error", message: "Name is required" });
    }

    const newFlow = { name: body.name, description: body.description };

    try {
        const createdFlow = await flowService.createNewFlow(newFlow);
        res.status(201).send({ status: "OK", data: createdFlow });
    } catch (error) {
        console.error("Error creating new flow:", error);
        res.status(500).send({ status: "Error", message: "Failed to create new flow" });
    }
};

const updateFlow = async (req, res) => {
    try {
        const { body, params: { flowId } } = req;

        if (!flowId) {
            return res.status(400).json({ status: "Error", message: "Flow ID is required" });
        }

        const updatedFlow = await flowService.updateFlow(flowId, body);
        res.status(200).json({ status: "OK", data: updatedFlow });
    } catch (error) {
        console.error("Error updating flow:", error);
        res.status(500).json({ status: "Error", message: "Failed to update flow" });
    }
};

const deleteFlow = async (req, res) => {
    try {
        const {
            params: { flowId }, 
        } = req;

        if(!flowId){
            return res.status(400).json({ status: "Error", message: "Flow ID is required" });
        }

        await flowService.deleteFlow(flowId);
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