const User = require("../models/User");

// Get todos los usuarios
const getAllUsers = async () => {
    return await User.find();
};

// Get del usuario que tenga el Id pasado por parámetro
const getOneUser = async (userId) => {
    return await User.findById(userId);
};

const getUserByEmail = async (email) => {
    try {
        // Buscar al usuario en la base de datos por su correo electrónico
        return await User.findOne({ email }).exec();
    } catch (error) {
        console.error("Error fetching user by email:", error);
        throw new Error('Error fetching user by email');
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
        throw new Error('Failed to retrieve joined classes');
    }
};

const getCreatedClasses = async (userId) => {
    try {
        const user = await User.findById(userId).populate('createdClasses');
        if (!user) {
            throw new Error('User not found');
        }
        return user.createdClasses;
    } catch (error) {
        throw new Error('Failed to retrieve created classes');
    }
};

const getFlowsByUser = async (userId) => {
    try {
        const user = await User.findById(userId).populate('flows');
        if (!user) {
            throw new Error('User not found');
        }
        return user.flows;
    } catch (error) {
        throw new Error('Failed to retrieve flows');
    }
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
        return await User.findByIdAndUpdate({_id: userId}, changes, { new: true });
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

// Obtener el rol del usuario con el ID proporcionado
const getUserRole = async (userId) => {
    return await User.findById(userId, 'role');
};


module.exports = {
    getAllUsers,
    getOneUser,
    getUserByEmail,
    getJoinedClasses,
    getCreatedClasses,
    getFlowsByUser,
    createNewUser,
    updateUser,
    deleteUser,
    getUserRole
}