const classDataAccess = require('../dataAccess/classDataAccess');
const userDataAccess = require('../dataAccess/userDataAccess');
const flowDataAccess = require('../dataAccess/flowDataAccess');

const getAllClases = async (userId) => {
    return await classDataAccess.findByProfessor(userId);
};

const getOneClase = async (claseId) => {
    return await classDataAccess.findOneById(claseId);
};

const getOneClaseByProfessor = async (userId, claseId) => {
    return await classDataAccess.findOneByIdAndProfessor(userId, claseId);
};

const getFlowsByClase = async (classId, role) => {
    try {
        const classDetails = await classDataAccess.findByIdWithFlows(classId);
        if (!classDetails) {
            throw new Error('Class not found');
        }

        if (role === 'professor') {
            return classDetails.flows;
        } else if (role === 'student') {
            return classDetails.flows.filter(flow => flow.userId.toString() === classDetails.professor.toString());
        } else {
            throw new Error('Role not recognized');
        }
    } catch (error) {
        console.error('Error in getFlowsByClase service:', error);
        throw error;
    }
};

const getAllFlowsByClase = async (classId) => {
    try {
        const classDetails = await classDataAccess.findByIdWithFlows(classId);
        if (!classDetails) {
            throw new Error('Class not found');
        }
        return classDetails.flows;
    } catch (error) {
        console.error('Error in getAllFlowsByClase service:', error);
        throw error;
    }
};

const getJoinedClasses = async (userId) => {
    try {
        const user = await userDataAccess.findByIdAndUpdate(userId, { $addToSet: { joinedClasses: classId } });
        if (!user) {
            throw new Error('User not found');
        }
        return user.joinedClasses;
    } catch (error) {
        console.error("Error fetching joined classes:", error);
        throw error;
    }
};

const getStudentsByClassId = async (classId) => {
    try {
        const classDetails = await classDataAccess.findByIdWithStudents(classId);
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
        return await classDataAccess.create(newClase);
    } catch (error) {
        throw error;
    }
};

const addFlow = async (classId, flowId) => {
    try {
        // Buscar la clase
        const clase = await classDataAccess.findOneById(classId);
        if (!clase) {
            throw new Error('Class not found');
        }

        // Buscar el flujo
        const flow = await flowDataAccess.findOneById(flowId);
        if (!flow) {
            throw new Error('Flow not found');
        }

        // Agregar el flujo a la clase
        await classDataAccess.addFlow(classId, flowId);

        // Agregar la clase al flujo
        flow.classes.push(classId);
        await flow.save();

        return { message: 'Flow added successfully' };
    } catch (error) {
        console.error('Error adding flow:', error);
        throw new Error('Internal server error');
    }
};


const updateClase = async (userId, classId, changes) => {
    try {
        return await classDataAccess.update(userId, classId, changes);
    } catch (error) {
        throw new Error("Failed to update clase in the database");
    }
};

const deleteClase = async (classId) => {
    try {
        // Buscar la clase en la base de datos
        const clase = await classDataAccess.findOneById(classId);
        if (!clase) {
            throw new Error("Class not found");
        }

        // Buscar los flujos de la clase
        const flows = await flowDataAccess.findFlowsByClassId(classId);
        for (const flow of flows) {
            flow.classes.pull(classId);
            await flow.save();
        }

        // Eliminar la clase
        await classDataAccess.findByIdAndDelete(classId);

        console.log("Class and related references deleted successfully");
        return { message: "Class deleted successfully" };
    } catch (error) {
        throw new Error(`Failed to delete class: ${error.message}`);
    }
};

const ejectStudentFromClass = async (classId, userId) => {
    try {
        await classDataAccess.ejectStudentFromClass(classId, userId);
    } catch (error) {
        throw new Error(`Failed to eject student: ${error.message}`);
    }
};

const leaveClass = async (classId, userId) => {
    try {
        await classDataAccess.ejectStudentFromClass(classId, userId);
    } catch (error) {
        throw new Error(`Failed to leave class: ${error.message}`);
    }
};

const uploadFlow = async (classId, flowId) => {
    try {
        await classDataAccess.addFlow(classId, flowId);
    } catch (error) {
        throw new Error(`Failed to upload flow: ${error.message}`);
    }
};

const deleteFlowFromClass = async (classId, flowId) => {
    try {
        return await classDataAccess.deleteFlowFromClass(classId, flowId);
    } catch (error) {
        console.error('Error removing flow from class or removing class from flow:', error);
        throw new Error('Failed to remove flow from class or update flow');
    }
};

const joinClass = async (userId, classId) => {
    try {
        return await classDataAccess.joinClass(userId, classId);
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
    getAllFlowsByClase,
    getJoinedClasses,
    uploadFlow,
    createNewClase,
    updateClase,
    deleteClase,
    ejectStudentFromClass,
    deleteFlowFromClass,
    leaveClass,
    joinClass
};
