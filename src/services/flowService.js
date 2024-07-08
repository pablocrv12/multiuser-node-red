const Flow = require("../models/Flow");
const Clase = require("../models/Class");
const User = require("../models/User");

const getAllFlows = async (userId) => {
    return await Flow.find({ userId });
};

const getOneFlow = async (flowId) => {
    return await Flow.findOne({ _id: flowId });
};

const getClassesByFlow = async (flowId) => {
    try {
        // Buscar el flujo por su ID y proyectar solo el campo 'classes'
        const flow = await Flow.findById(flowId).select('classes');

        // Si no se encuentra el flujo, lanzar un error
        if (!flow) {
            throw new Error('Flow not found');
        }

        // Retornar la lista de clases asociadas al flujo
        return flow.classes;
    } catch (error) {
        console.error('Error in getClassesByFlow service:', error);
        throw error;
    }
};
const getUserByFlow = async (flowId) => {
    try {
        // Buscar el flujo por su ID
        const flow = await Flow.findById(flowId);

        // Si no se encuentra el flujo, lanzar un error
        if (!flow) {
            throw new Error('Flow not found');
        }

        // Si coincide, buscar al usuario por su ID
        const user = await User.findById(flow.userId);

        // Retornar el usuario completo
        return user;
    } catch (error) {
        console.error('Error in getUserByFlow service:', error);
        throw error;
    }
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
        // Eliminar el flujo de la base de datos
        const deletedFlow = await Flow.findOneAndDelete({ _id: flowId, userId });
        if (!deletedFlow) {
            throw new Error("Flow not found");
        }

        // Encuentra al usuario por su ID
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }

        // Elimina el ID del flujo de la lista de flujos del usuario
        user.flows.pull(flowId);

        // Guarda los cambios en el usuario
        await user.save();

        console.log("Flow deleted successfully");
        return deletedFlow;
    } catch (error) {
        throw new Error(`Failed to delete flow: ${error.message}`);
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