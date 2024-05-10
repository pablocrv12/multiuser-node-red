const User = require("../models/User");

// Get todos los usuarios
const getAllUsers = async () => {
    return await User.find();
};

// Get del usuario que tenga el Id pasado por parámetro
const getOneUser = async (userId) => {
    return await User.findById(UserId);
};


// Crear un nuevo usuario
const createNewUser = async (newUser) => {
    try {
        const createdUser = await User.create(newUser);
        return createdUser;
    } catch (error) {
        throw error;
    }
};

// Actualizar el usuario el cuál se pasa el Id por parámetro
const updateUser = async (userId, changes) => {
    try {
        changes.last_update = Date().toLocaleString("en-US", { timezone: "UTC"} );
        return await User.findByIdAndUpdate(userId, changes, { new: true });
    } catch (error) {
        throw new Error("Failed to update user in the database");
    }
};


// eliminar un usuario
const deleteUser = async (userId) => {
    try {
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            throw new Error("User not found");
        }
    } catch (error) {
        throw new Error(`Failed to delete user: ${error.message}`);
    }
};

module.exports = {
    getAllUsers,
    getOneUser,
    createNewUser,
    updateUser,
    deleteUser
}