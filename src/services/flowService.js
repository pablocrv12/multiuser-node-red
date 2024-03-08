const Flow = require("../models/Flow");

// Get todos los flujos de trabajo
const getAllFlows = async () => {
    return await Flow.find();
};

// Get del flujo de trabajo que tenga el Id pasado por parámetro
const getOneFlow = async (flowId) => {
    return await Flow.findById(flowId);
};


// Crear un nuevo flujo de trabajo
const createNewFlow = async (newFlow) => {
    try {
        const createdFlow = await Flow.create(newFlow);
        return createdFlow;
    } catch (error) {
        throw error;
    }
};

// Actualizar el flujo de trabajo el cuál se pasa el Id por parámetro
const updateFlow = async (flowId, changes) => {
    try {
        changes.last_update = Date().toLocaleString("en-US", { timezone: "UTC"} );
        return await Flow.findByIdAndUpdate(flowId, changes, { new: true });
    } catch (error) {
        throw new Error("Failed to update flow in the database");
    }
};


// eliminar un flujo de trabajo
const deleteFlow = async (flowId) => {
    try {
        const deletedFlow = await Flow.findByIdAndDelete(flowId);
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