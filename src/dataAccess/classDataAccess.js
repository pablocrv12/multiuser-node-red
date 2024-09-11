const Clase = require('../models/Class');
const Flow = require('../models/Flow');
const User = require('../models/User');

const findByProfessor = async (userId) => {
    return await Clase.find({ professor: userId });
};

const findOneById = async (claseId) => {
    return await Clase.findById(claseId);
};

const findOneByIdAndProfessor = async (userId, claseId) => {
    return await Clase.findOne({ _id: claseId, professor: userId });
};

const findByIdWithFlows = async (classId) => {
    return await Clase.findById(classId).populate('flows');
};



const findByIdWithStudents = async (classId) => {
    return await Clase.findById(classId).populate('students', 'name email');
};

const create = async (newClase) => {
    return await Clase.create(newClase);
};

const addFlow = async (classId, flowId) => {
    return await Clase.findByIdAndUpdate(classId, { $push: { flows: flowId } }, { new: true });
};


const update = async (userId, classId, changes) => {
    return await Clase.findOneAndUpdate({ _id: classId, professor: userId }, changes, { new: true });
};

const findByIdAndDelete = async (classId) => {
    return await Clase.findByIdAndDelete(classId);
};

const deleteFlowFromClass = async (classId, flowId) => {
    await Clase.findByIdAndUpdate(classId, { $pull: { flows: flowId } });
    return await Flow.findByIdAndUpdate(flowId, { $pull: { classes: classId } });
};

const joinClass = async (userId, classId) => {
    await Clase.findByIdAndUpdate(classId, { $addToSet: { students: userId } });
    return await User.findByIdAndUpdate(userId, { $addToSet: { joinedClasses: classId } });
};

const ejectStudentFromClass = async (classId, userId) => {
    await Clase.findByIdAndUpdate(classId, { $pull: { students: userId } });
    return await User.findByIdAndUpdate(userId, { $pull: { joinedClasses: classId } });
};

module.exports = {
    findByProfessor,
    findOneById,
    findOneByIdAndProfessor,
    findByIdWithFlows,
    findByIdWithStudents,
    create,
    addFlow,
    update,
    findByIdAndDelete,
    deleteFlowFromClass,
    joinClass,
    ejectStudentFromClass
};
