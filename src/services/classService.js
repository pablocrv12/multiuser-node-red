const Clase = require("../models/Clase");

const getAllClases = async (userId) => {
    return await Clase.find({ userId });
};

const getOneClase = async (userId, claseId) => {
    return await Clase.findOne({ _id: claseId, userId });
};

const createNewClase = async (newClase) => {
    try {
        const createdClase = await Clase.create(newClase);
        return createdClase;
    } catch (error) {
        throw error;
    }
};

const updateClase = async (userId, claseId, changes) => {
    try {
        changes.last_update = new Date().toLocaleString("en-US", { timeZone: "UTC" });
        return await Clase.findOneAndUpdate({ _id: claseId, userId }, changes, { new: true });
    } catch (error) {
        throw new Error("Failed to update clase in the database");
    }
};

const deleteClase = async (userId, claseId) => {
    try {
        const deletedClase = await Clase.findOneAndDelete({ _id: claseId, userId });
        if (!deletedClase) {
            throw new Error("Clase not found");
        }
    } catch (error) {
        throw new Error(`Failed to delete clase: ${error.message}`);
    }
};

module.exports = {
    getAllClases,
    getOneClase,
    createNewClase,
    updateClase,
    deleteClase
}