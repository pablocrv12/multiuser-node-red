const User = require('../models/User');

// Crear un nuevo usuario en la base de datos
const createUser = async (userData) => {
    return await User.create(userData);
};

const findAll = async () => {
    return await User.find();
};

const findById = async (userId) => {
    return await User.findById(userId);
};

const findOneByEmail = async (email) => {
    return await User.findOne({ email }).exec();
};

const findByIdWithJoinedClasses = async (userId) => {
    return await User.findById(userId).populate('joinedClasses');
};

const findByIdWithCreatedClasses = async (userId) => {
    return await User.findById(userId).populate('createdClasses');
};

const findByIdWithFlows = async (userId) => {
    return await User.findById(userId).populate('flows');
};

const findByIdAndUpdate = async (userId, changes) => {
    return await User.findByIdAndUpdate(userId, changes, { new: true });
};

const findByIdAndDelete = async (userId) => {
    return await User.findByIdAndDelete(userId);
};

const findRoleById = async (userId) => {
    return await User.findById(userId, 'role');
};

module.exports = {
    createUser,
    findAll,
    findById,
    findOneByEmail,
    findByIdWithJoinedClasses,
    findByIdWithCreatedClasses,
    findByIdWithFlows,
    findByIdAndUpdate,
    findByIdAndDelete,
    findRoleById
};
