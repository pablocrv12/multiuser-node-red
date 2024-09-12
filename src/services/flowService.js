const flowDataAccess = require('../dataAccess/flowDataAccess');
const userDataAccess = require('../dataAccess/userDataAccess');

const getAllFlows = async (userId) => {
    return await flowDataAccess.findByUserId(userId);
};

const getOneFlow = async (flowId) => {
    return await flowDataAccess.findOneById(flowId);
};

const getClassesByFlow = async (flowId) => {
    try {
        const flow = await flowDataAccess.findByIdWithClasses(flowId);

        // Si no se encuentra el flujo, lanzar un error
        if (!flow) {
            throw new Error('Flow not found');
        }

        // Devolver la lista de clases del flujo
        return flow.classes;
    } catch (error) {
        console.error('Error in getClassesByFlow service:', error);
        throw error;
    }
};

const getUserByFlow = async (flowId) => {
    try {
        // Buscar el flujo por su ID
        const flow = await flowDataAccess.findOneById(flowId);

        // Si no se encuentra el flujo, lanzar un error
        if (!flow) {
            throw new Error('Flow not found');
        }

        // Si coincide, buscar al usuario por su ID
        const user = await userDataAccess.findById(flow.userId);

        // Devolver el usuario completo
        return user;
    } catch (error) {
        console.error('Error in getUserByFlow service:', error);
        throw error;
    }
};

const createNewFlow = async (newFlow) => {
    try {
        return await flowDataAccess.create(newFlow);
    } catch (error) {
        throw error;
    }
};

const updateFlow = async (userId, flowId, changes) => {
    try {
        changes.last_update = new Date().toLocaleString("en-US", { timeZone: "UTC" });
        return await flowDataAccess.findOneAndUpdate(userId, flowId, changes);
    } catch (error) {
        throw new Error("Failed to update flow in the database");
    }
};

const deleteFlow = async (userId, flowId) => {
    try {
        // Eliminar el flujo de la base de datos
        const deletedFlow = await flowDataAccess.findOneAndDelete(userId, flowId);
        if (!deletedFlow) {
            throw new Error("Flow not found");
        }

        // Encuentra al usuario por su ID
        const user = await userDataAccess.findById(userId);
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
};
