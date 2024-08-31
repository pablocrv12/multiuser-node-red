const Clase = require("../models/Class");
const User = require('../models/User');
const Flow = require('../models/Flow').default;
const mongoose = require('mongoose');

const getAllClases = async (userId) => {
    return await Clase.find({ professor: userId });
};

const getOneClase = async (claseId) => {
    return await Clase.findOne({ _id: claseId });
};

const getOneClaseByProfessor = async (userId, claseId) => {
    return await Clase.findOne({ _id: claseId, professor: userId });
};

const getFlowsByClase = async (classId, role) => {
    try {
        const classDetails = await Clase.findById({_id: classId}).populate('flows');
        if (!classDetails) {
            throw new Error('Class not found');
        }

        if (role === 'professor') {
            return classDetails.flows;
        } else if (role === 'student') {
            // Filtramos los flujos donde el userId del flujo sea igual al professor de la clase
            return classDetails.flows.filter(flow => flow.userId.toString() === classDetails.professor.toString());
        } else {
            throw new Error('Role not recognized');
        }
    } catch (error) {
        console.error('Error in getFlowsByClase service:', error);
        throw error;
    }
};

const getFlowsByClaseandStudent = async (classId, userId) => {
    try {

        // Convertir classId a ObjectId
        const classObjectId = new mongoose.Types.ObjectId(classId);
        const userObjectId = new mongoose.Types.ObjectId(userId);
console.log(classObjectId);
console.log(userObjectId);
        // Obtener los flujos del usuario que pertenecen a esta clase
        const flows = await Flow.find({ userId: userObjectId, classes: classObjectId });
        return flows;
    } catch (error) {
        throw error;
    }
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

const addFlow = async (classId, flowId) => {
    try {
        // Buscar la clase por su ID
        const clase = await Clase.findById(classId);

        // Verificar si la clase existe
        if (!clase) {
            throw new Error('Clase no encontrada');
        }

        // Agregar el flow a la lista de flows de la clase
        clase.flows.push(flowId);

        // Guardar los cambios en la base de datos
        await clase.save();

        // Buscar el flow por su ID y agregar la clase a su lista de clases
        const flow = await Flow.findById(flowId);
        if (!flow) {
            throw new Error('Flow no encontrado');
        }

        flow.classes.push(classId);
        await flow.save();

        // Mensaje de éxito
        return { mensaje: 'Flujo agregado correctamente' };
    } catch (error) {
        console.error('Error al agregar flujo:', error);
        throw new Error('Error interno del servidor');
    }
};

const updateClase = async (userId, classId, changes) => {
    try {
        return await Clase.findOneAndUpdate({ _id: classId, professor: userId }, changes, { new: true });
    } catch (error) {
        throw new Error("Failed to update clase in the database");
    }
};

const deleteClase = async (classId) => {
    try {
        // Encuentra la clase
        const clase = await Clase.findById(classId);
        if (!clase) {
            throw new Error("Class not found");
        }

        // Obtén todos los flujos asociados a la clase
        const flows = await Flow.find({ classes: classId });

        // Para cada flujo, elimina la clase de su lista de clases y guarda los cambios
        for (const flow of flows) {
            flow.classes.pull(classId);
            await flow.save();
        }

        // Elimina la clase
        await Clase.findByIdAndDelete(classId);

        console.log("Class and related references deleted successfully");
        return { message: "Class deleted successfully" };
    } catch (error) {
        throw new Error(`Failed to delete class: ${error.message}`);
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

const uploadFlow = async (classId, flowId) => {
    await Clase.findByIdAndUpdate(classId, { $push: { flows: flowId } });
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
    getFlowsByClaseandStudent,
    getJoinedClasses,
    uploadFlow,
    createNewClase,
    updateClase,
    deleteClase,
    ejectStudentFromClass,
    deleteFlowFromClass,
    leaveClass,
    joinClass
}