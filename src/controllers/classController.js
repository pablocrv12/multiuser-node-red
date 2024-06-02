const classService = require("../services/classService");
const userService = require("../services/userService");

const getAllClases = async (req, res) => {
    const userId = req.user._id; // Obtener el userId del usuario autenticado
    try {
        const allClases = await classService.getAllClases(userId);
        res.status(200).json({ status: "Ok", data: allClases });
    } catch (error) {
        console.error("Error getting all clases:", error);
        res.status(500).json({ status: "Error", message: "Failed to get all clases" });
    }
};  

const getOneClase = async (req, res) => {
    const { params: { classId } } = req;

    if (!classId) {
        return res.status(400).json({ status: "Error", message: "Clase ID is required" });
    }

    try {
        const clase = await classService.getOneClase(classId);
        if (!clase) {
            return res.status(404).json({ status: "Error", message: "Clase not found" });
        }
        res.status(200).json({ status: "Ok", data: clase });
    } catch (error) {
        console.error("Error getting clase:", error);
        res.status(500).json({ status: "Error", message: "Failed to get clase" });
    }
};

const addFlow = async (req, res) => {
    const { classId, flowId } = req.params;

    try {
        const respuesta = await classService.addFlow(classId, flowId);
        res.status(201).json({status: "Ok", data: respuesta});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getOneClaseByProfessor = async (req, res) => {
    const userId = req.user._id;
    const { params: { classId } } = req;

    if (!classId) {
        return res.status(400).json({ status: "Error", message: "Clase ID is required" });
    }

    try {
        const clase = await classService.getOneClaseByProfessor(userId, classId);
        if (!clase) {
            return res.status(404).json({ status: "Error", message: "Clase not found" });
        }
        res.status(200).json({ status: "Ok", data: clase });
    } catch (error) {
        console.error("Error getting clase:", error);
        res.status(500).json({ status: "Error", message: "Failed to get clase" });
    }
};

const getFlowsByClase = async (req, res) => {
    const userId = req.user._id;
    const { params: { classId } } = req;

    if (!classId) {
        return res.status(400).json({ status: "Error", message: "Clase ID is required" });
    }

    try {
        const flows = await classService.getFlowsByClase(userId, classId);
        if (!flows) {
            return res.status(404).json({ status: "Error", message: "Clase not found or no flows available" });
        }
        res.status(200).json({ status: "Ok", data: flows });
    } catch (error) {
        console.error("Error getting flows:", error);
        res.status(500).json({ status: "Error", message: "Failed to get flows" });
    }
};

const getStudentsByClassId = async (req, res) => {
    try {
        const { classId } = req.params;
        const students = await classService.getStudentsByClassId(classId);
        res.status(200).json({status: "Ok", data: students});
    } catch (error) {
        console.error('Error fetching students by class ID:', error);
        res.status(500).json({ error: 'Failed to fetch students by class ID' });
    }
};



const createNewClase = async (req, res) => {
    const userId = req.user._id;
    const { body } = req;

    if (!body.name) {
        return res.status(400).send({ status: "Error", message: "Name is required" });
    }

    // Crear una nueva clase con el nombre y el id del profesor
    const newClase = { 
        name: body.name, 
        professor: userId,
    };

    try {
        const createdClase = await classService.createNewClase(newClase);
        
        // Obtener el ID de la clase creada
        const createdClaseId = createdClase._id;

        // Actualizar el usuario para agregar la clase creada a createdClasses
        const updatedUser = await userService.updateUser(userId, {
            $push: { createdClasses: createdClaseId }
        });

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
        const updatedClase = await classService.updateClase(userId, claseId, body);
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
    const userId = req.user._id;  // Asegúrate de que estás obteniendo el userId correctamente
    const { classId } = req.params;

    console.log(`Attempting to delete clase with ID: ${classId} by user: ${userId}`);

    try {
        const deletedClase = await classService.deleteClase(userId, classId);
        res.status(200).send({ status: "OK", data: deletedClase });
    } catch (error) {
        console.error("Error deleting clase:", error);
        res.status(500).send({ status: "Error", message: error.message });
    }
};

const ejectStudentFromClass = async (req, res) => {
    const { classId, userId } = req.params;
    try {
        await classService.ejectStudentFromClass(classId, userId);
        res.status(200).json({ message: "Student ejected from class successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error ejecting student from class", error });
    }
};

const leaveClass = async (req, res) => {
    const { classId, userId } = req.params;
    try {
        await classService.ejectStudentFromClass(classId, userId);
        res.status(200).json({ message: "Student has leave class successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error student leaving class", error });
    }
};

const deleteFlowFromClass = async (req, res) => {
    const { classId, flowId } = req.params;
    console.log("aquji  ")
    console.log(classId)
    console.log(flowId)
    try {
        const result = await classService.deleteFlowFromClass(classId, flowId);
        res.status(200).json({ message: "Student ejected from class successfully" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};


const joinClass = async (req, res) => {
    const userId = req.user._id;  
    const { classId } = req.params; 

    console.log(`User ${userId} attempting to join class with ID: ${classId}`);

    try {
        const clase = await classService.joinClass(userId, classId);
        res.status(200).send({ status: "OK", data: clase });
    } catch (error) {
        console.error("Error joining class:", error);
        res.status(500).send({ status: "Error", message: error.message });
    }
};

module.exports = {
    getAllClases,
    getOneClase,
    getStudentsByClassId,
    addFlow,
    getOneClaseByProfessor,
    getFlowsByClase,
    createNewClase,
    updateClase,
    deleteClase,
    ejectStudentFromClass,
    deleteFlowFromClass,
    leaveClass,
    joinClass
}