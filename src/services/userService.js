const userDataAccess = require('../dataAccess/userDataAccess');
const { hashSync, compareSync } = require('bcrypt');
const jwt = require('jsonwebtoken');


const registerUser = async (email, password, role, name) => {
    try {
        // Hashear la contraseña
        const hashedPassword = hashSync(password, 10);

        // Crear un nuevo usuario
        const newUser = await userDataAccess.createUser({
            email,
            password: hashedPassword,
            role,
            name
        });

        return newUser;
    } catch (error) {
        throw new Error('Failed to register user: ' + error.message);
    }
};

const loginUser = async (email, password) => {
    try {
        // Buscar el usuario por su correo electrónico
        const user = await userDataAccess.findOneByEmail(email);
        if (!user) {
            throw new Error('Could not find the user.');
        }

        // Comprobar la contraseña
        if (!compareSync(password, user.password)) {
            throw new Error('Incorrect password');
        }

        // Generar el token JWT
        const payload = { email: user.email, id: user._id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "120m" });

        return { user, token };
    } catch (error) {
        throw new Error(error.message);
    }
};


const getAllUsers = async () => {
    return await userDataAccess.findAll();
};

const getOneUser = async (userId) => {
    return await userDataAccess.findById(userId);
};

const getUserByEmail = async (email) => {
    try {
        return await userDataAccess.findOneByEmail(email);
    } catch (error) {
        console.error("Error fetching user by email:", error);
        throw new Error('Error fetching user by email');
    }
};

const getJoinedClasses = async (userId) => {
    try {
        const user = await userDataAccess.findByIdWithJoinedClasses(userId);
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
        const user = await userDataAccess.findByIdWithCreatedClasses(userId);
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
        const user = await userDataAccess.findByIdWithFlows(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return user.flows;
    } catch (error) {
        throw new Error('Failed to retrieve flows');
    }
};

const updateUser = async (userId, changes) => {
    try {
        return await userDataAccess.findByIdAndUpdate(userId, changes);
    } catch (error) {
        throw new Error("Failed to update user in the database");
    }
};

const deleteUser = async (userId) => {
    try {
        const deletedUser = await userDataAccess.findByIdAndDelete(userId);
        if (!deletedUser) {
            throw new Error("User not found");
        }
    } catch (error) {
        throw new Error(`Failed to delete user: ${error.message}`);
    }
};

const getUserRole = async (userId) => {
    return await userDataAccess.findRoleById(userId);
};

module.exports = {
    registerUser,
    loginUser,
    getAllUsers,
    getOneUser,
    getUserByEmail,
    getJoinedClasses,
    getCreatedClasses,
    getFlowsByUser,
    updateUser,
    deleteUser,
    getUserRole
};
