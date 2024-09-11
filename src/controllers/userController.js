const userService = require("../services/userService");
const bcrypt = require('bcrypt');

const registerUser = async (req, res) => {
    const { email, password, role, name } = req.body;

    if (!email || !password || !role || !name) {
        return res.status(400).json({
            success: false,
            message: 'Email, password, role, and name are required'
        });
    }

    try {
        const newUser = await userService.registerUser(email, password, role, name);
        res.status(201).json({
            success: true,
            message: 'User created successfully.',
            user: {
                id: newUser._id,
                email: newUser.email,
                role: newUser.role,
                name: newUser.name
            }
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong',
            error: error.message
        });
    }
};


const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email and password are required'
        });
    }

    try {
        const { user, token } = await userService.loginUser(email, password);
        res.status(200).json({
            success: true,
            message: 'Logged in successfully!',
            token: `Bearer ${token}`,
            userId: user._id
        });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(401).json({
            success: false,
            message: error.message
        });
    }
};

const getAllUsers = async (req, res) => {

    try {
        const allUsers = await userService.getAllUsers();
        res.status(200).json({ status: "Ok", data: allUsers });
    } catch (error) {
        console.error("Error getting all users:", error);
        res.status(500).json({ status: "Error", message: "Failed to get all users" });
    }
};

const getOneUser = async (req, res) => {
    try {
        const {
            params: { userId },
        } = req;

        if (!userId) {
            return res.status(400).json({ status: "Error", message: "User ID is required" });
        }

        const user = await userService.getOneUser(userId);
        res.status(200).json({ status: "Ok", data: user });
    } catch (error) {
        console.error("Error getting user:", error);
        res.status(500).json({ status: "Error", message: "Failed to get user" });
    }
};

const getUserByEmail = async (req, res) => {
    const { email } = req.params;

    if (!email) {
        return res.status(400).json({ status: "Error", message: "Email is required" });
    }

    try {
        const user = await userService.getUserByEmail(email);
        if (!user) {
            return res.status(404).json({ status: "Error", message: "User not found" });
        }
        res.status(200).json({ status: "Ok", data: user });
    } catch (error) {
        console.error("Error getting user by email:", error);
        res.status(500).json({ status: "Error", message: "Failed to get user" });
    }
};

const getJoinedClasses = async (req, res) => {
    const userId = req.params.userId;

    try {
        const joinedClasses = await userService.getJoinedClasses(userId);
        res.status(200).json({ status: 'OK', data: joinedClasses });
    } catch (error) {
        console.error('Error retrieving joined classes:', error);
        res.status(500).json({ status: 'Error', message: 'Server error' });
    }
};

const getCreatedClasses = async (req, res) => {
    const userId = req.params.userId;

    try {
        const createdClasses = await userService.getCreatedClasses(userId);
        res.status(200).json({ status: 'OK', data: createdClasses });
    } catch (error) {
        console.error('Error retrieving created classes:', error);
        res.status(500).json({ status: 'Error', message: 'Server error' });
    }
};

const getFlowsByUser = async (req, res) => {
    const userId = req.params.userId;

    try {
        const flows = await userService.getFlowsByUser(userId);
        res.status(200).json({ status: 'OK', data: flows });
    } catch (error) {
        console.error('Error retrieving flows:', error);
        res.status(500).json({ status: 'Error', message: 'Server error' });
    }
};



const updateUser = async (req, res) => {
    try {
        const { body, params: { userId } } = req;
        const { currentPassword, newPassword, ...otherUpdates } = body;

        if (!userId) {
            return res.status(400).json({ status: "Error", message: "User ID is required" });
        }

        // Si solo se proporciona la nueva contraseña (sin contraseña actual)
        if (newPassword && !currentPassword) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            otherUpdates.password = hashedPassword;
        } 
        // Si se proporciona tanto la contraseña actual como la nueva
        else if (currentPassword && newPassword) {
            const user = await userService.getOneUser(userId);
            if (!user) {
                return res.status(404).json({ status: "Error", message: "User not found" });
            }

            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ status: "Error", message: "Incorrect current password" });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            otherUpdates.password = hashedPassword;
        }

        // Actualizar otros campos del usuario si existen
        const updatedUser = await userService.updateUser(userId, otherUpdates);

        res.status(200).json({ status: "OK", data: updatedUser });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ status: "Error", message: "Failed to update user" });
    }
};




const deleteUser = async (req, res) => {
    try {
        const {
            params: { userId }, 
        } = req;

        if(!userId){
            return res.status(400).json({ status: "Error", message: "User ID is required" });
        }

        await userService.deleteUser(userId);
        res.status(204).json({ status: "OK" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ status: "Error", message: "Failed to delete user" });
    }
};

// Obtener el rol de un usuario
const getUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
  

        if (!userId) {
            return res.status(400).json({ status: "Error", message: "User ID is required" });
        }

        const userRole = await userService.getUserRole(userId);

        if (!userRole) {
            return res.status(404).json({ status: "Error", message: "User not found" });
        }

        res.status(200).json({ status: "Ok", data: userRole });
    } catch (error) {
        console.error("Error getting user role:", error);
        res.status(500).json({ status: "Error", message: "Failed to get user role" });
    }
};


// Controlador para manejar la solicitud de envío de correo de restablecimiento de contraseña
const sendResetPasswordEmail = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        await passwordService.sendResetPasswordEmail(email);
        res.status(200).json({ message: 'Password reset email sent successfully' });
    } catch (error) {
        console.error('Error sending password reset email:', error);
        res.status(500).json({ message: 'Error sending password reset email', error: error.message });
    }
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
}