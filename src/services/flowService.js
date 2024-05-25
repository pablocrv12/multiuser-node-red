const Flow = require("../models/Flow");

const getAllFlows = async (userId) => {
    return await Flow.find({ userId });
};

const getOneFlow = async (userId, flowId) => {
    return await Flow.findOne({ _id: flowId, userId });
};

const createNewFlow = async (newFlow) => {
    try {
        const createdFlow = await Flow.create(newFlow);
        return createdFlow;
    } catch (error) {
        throw error;
    }
};

const updateFlow = async (userId, flowId, changes) => {
    try {
        changes.last_update = new Date().toLocaleString("en-US", { timeZone: "UTC" });
        return await Flow.findOneAndUpdate({ _id: flowId, userId }, changes, { new: true });
    } catch (error) {
        throw new Error("Failed to update flow in the database");
    }
};

const deleteFlow = async (userId, flowId) => {
    try {
        const deletedFlow = await Flow.findOneAndDelete({ _id: flowId, userId });
        if (!deletedFlow) {
            throw new Error("Flow not found");
        }
    } catch (error) {
        throw new Error(`Failed to delete flow: ${error.message}`);
    }
};

module.exports = {
    getAllFlows,
    getOneFlow,
    createNewFlow,
    updateFlow,
    deleteFlow
}