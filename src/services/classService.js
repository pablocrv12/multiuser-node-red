const Clase = require("../models/Class");
const User = require('../models/User');

const getAllClases = async (userId) => {
    return await Clase.find({ professor: userId });
};

const getOneClase = async (claseId) => {
    return await Clase.findOne({ _id: claseId });
};

const getOneClaseByProfessor = async (userId, claseId) => {
    return await Clase.findOne({ _id: claseId, professor: userId });
};

const getFlowsByClase = async (userId, claseId) => {
    const clase = await Clase.findOne({ _id: claseId, professor: userId }).populate('flows');
    return clase ? clase.flows : null;
};

const getJoinedClasses = async (userId) => {
    try {
        const user = await User.findById(userId).populate('joinedClasses');
        if (!user) {
            throw new Error('User not found');
        }
        return user.joinedClasses;
    } catch (error) {
        console.error("Error fetching joined classes:", error);
        throw error;
    }
};

// Servicio para obtener todos los estudiantes de una clase por su ID
const getStudentsByClassId = async (classId) => {
    try {
        const classDetails = await Clase.findById(classId).populate('students', 'name email');
        if (!classDetails) {
            throw new Error('Class not found');
        }
        return classDetails.students;
    } catch (error) {
        console.error('Error in getStudentsByClassId service:', error);
        throw error;
    }
};




const createNewClase = async (newClase) => {
    try {
        const createdClase = await Clase.create(newClase);
        return createdClase;
    } catch (error) {
        throw error;
    }
};

const addFlow = async(claseId, flowId) => {
    try {
        const clase = await Clase.findById(claseId);

        if (!clase) {
            throw new Error('Clase no encontrada');
        }

        clase.flows.push(flowId);
        await clase.save();

        return { mensaje: 'Flujo agregado correctamente' };
    } catch (error) {
        console.error('Error al agregar flujo:', error);
        throw new Error('Error interno del servidor');
    }
}

const updateClase = async (userId, claseId, changes) => {
    try {
        return await Clase.findOneAndUpdate({ _id: claseId, userId }, changes, { new: true });
    } catch (error) {
        throw new Error("Failed to update clase in the database");
    }
};

const deleteClase = async (userId, claseId) => {
    try {
        // Verifica si la clase existe y si el profesor coincide
        const clase = await Clase.findOne({ _id: claseId, professor: userId });
        if (!clase) {
            console.log("Clase not found or you do not have permission to delete it");
            throw new Error("Clase not found or you do not have permission to delete it");
        }

        // Eliminar la clase
        const deletedClase = await Clase.findByIdAndDelete(claseId);
        console.log("Deleted Clase:", deletedClase);

        // Elimina la referencia a esta clase del profesor en el modelo de usuario
        await User.findByIdAndUpdate(userId, { $pull: { createdClasses: claseId } });

        return deletedClase;
    } catch (error) {
        console.error(`Failed to delete clase: ${error.message}`);
        throw new Error(`Failed to delete clase: ${error.message}`);
    }
};


const ejectStudentFromClass = async (classId, userId) => {
    // Eliminar al estudiante de la lista de students de la clase
    await Clase.findByIdAndUpdate(classId, { $pull: { students: userId } });

    // Eliminar la clase de la lista de joinedClasses del estudiante
    await User.findByIdAndUpdate(userId, { $pull: { joinedClasses: classId } });
};

const leaveClass = async (classId, userId) => {
    // Eliminar al estudiante de la lista de students de la clase
    await Clase.findByIdAndUpdate(classId, { $pull: { students: userId } });

    // Eliminar la clase de la lista de joinedClasses del estudiante
    await User.findByIdAndUpdate(userId, { $pull: { joinedClasses: classId } });
};


const deleteFlowFromClass = async (classId, flowId) => {
    // Eliminar el flujo de la lista de flujos de la clase
    console.log(classId)
    console.log(flowId)
    await Clase.findByIdAndUpdate(classId, { $pull: { flows: flowId } });

    return {
        success: true,
        data: `Flow ${flowId} removed from class ${classId}`
    };
};

const joinClass = async (userId, classId) => {
    try {
        // Verifica si la clase existe
        const clase = await Clase.findById(classId);
        if (!clase) {
            throw new Error("Clase not found");
        }

        // Verifica si el usuario ya está en la clase
        if (clase.students.includes(userId)) {
            throw new Error("User already joined the class");
        }

        // Añadir el userId a la lista de estudiantes de la clase
        clase.students.push(userId);
        await clase.save();

        // Añadir el classId a la lista de clases a las que pertenece el usuario
        await User.findByIdAndUpdate(userId, { $addToSet: { joinedClasses: classId } });

        return clase;
    } catch (error) {
        throw new Error(`Failed to join class: ${error.message}`);
    }
};

module.exports = {
    getAllClases,
    getOneClase,
    getStudentsByClassId,
    addFlow,
    getOneClaseByProfessor,
    getFlowsByClase,
    getJoinedClasses,
    createNewClase,
    updateClase,
    deleteClase,
    ejectStudentFromClass,
    deleteFlowFromClass,
    leaveClass,
    joinClass
}