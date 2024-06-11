const userService = require("../services/userService");

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



const createNewUser = async (req, res) => {
    const { body } = req;

    if (!body.name) {
        return res.status(400).send({ status: "Error", message: "Name is required" });
    }

    const newUser = { name: body.name, description: body.description };

    try {
        const createdUser = await userService.createNewUser(newUser);
        res.status(201).send({ status: "OK", data: createdUser });
    } catch (error) {
        console.error("Error creating new user:", error);
        res.status(500).send({ status: "Error", message: "Failed to create new user" });
    }
};

const updateUser = async (req, res) => {
    try {
      const { body, params: { userId } } = req;
  
      if (!userId) {
        return res.status(400).json({ status: "Error", message: "User ID is required" });
      }
  
      const updatedUser = await userService.updateUser(userId, body);
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


module.exports = {
    getAllUsers,
    getOneUser,
    getJoinedClasses,
    getCreatedClasses,
    createNewUser,
    updateUser,
    deleteUser,
    getUserRole
}