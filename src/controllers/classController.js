const claseService = require("../services/claseService");

const getAllClases = async (req, res) => {
    const userId = req.user._id; // Obtener el userId del usuario autenticado

    try {
        const allClases = await claseService.getAllClases(userId);
        res.status(200).json({ status: "Ok", data: allClases });
    } catch (error) {
        console.error("Error getting all clases:", error);
        res.status(500).json({ status: "Error", message: "Failed to get all clases" });
    }
};

const getOneClase = async (req, res) => {
    const userId = req.user._id;
    const { params: { claseId } } = req;

    if (!claseId) {
        return res.status(400).json({ status: "Error", message: "Clase ID is required" });
    }

    try {
        const clase = await claseService.getOneClase(userId, claseId);
        if (!clase) {
            return res.status(404).json({ status: "Error", message: "Clase not found" });
        }
        res.status(200).json({ status: "Ok", data: clase });
    } catch (error) {
        console.error("Error getting clase:", error);
        res.status(500).json({ status: "Error", message: "Failed to get clase" });
    }
};

const createNewClase= async (req, res) => {
    const userId = req.user._id;
    const { body } = req;

    if (!body.name) {
        return res.status(400).send({ status: "Error", message: "Name is required" });
    }

    const newClase = { name: body.name, nodes: body.nodes, userId: userId };

    try {
        const createdClase = await claseService.createNewClase(newClase);
        res.status(201).send({ status: "OK", data: createdClase });
    } catch (error) {
        console.error("Error creating new clase:", error);
        res.status(500).send({ status: "Error", message: "Failed to create new clase" });
    }
};

const updateClase = async (req, res) => {
    const userId = req.user._id;
    const { body, params: { claseId } } = req;

    if (!claseId) {
        return res.status(400).json({ status: "Error", message: "Clase ID is required" });
    }

    try {
        const updatedClase = await claseService.updateClase(userId, claseId, body);
        if (!updatedClase) {
            return res.status(404).json({ status: "Error", message: "Clase not found" });
        }
        res.status(200).json({ status: "OK", data: updatedClase });
    } catch (error) {
        console.error("Error updating clase:", error);
        res.status(500).json({ status: "Error", message: "Failed to update clase" });
    }
};

const deleteClase = async (req, res) => {
    const userId = req.user._id; // Obtener el userId del usuario autenticado
    const { claseId } = req.params;

    try {
        if (!claseId) {
            return res.status(400).json({ status: "Error", message: "ClaseID is required" });
        }

        const deletedClase= await claseService.deleteClase(userId, claseId);
        if (!deletedClase) {
            return res.status(404).json({ status: "Error", message: "Clase not found" });
        }

        res.status(204).json({ status: "OK" });
    } catch (error) {
        console.error("Error deleting clase:", error);
        res.status(500).json({ status: "Error", message: "Failed to delete clase" });
    }
};

module.exports = {
    getAllClases,
    getOneClase,
    createNewClase,
    updateClase,
    deleteClase
}