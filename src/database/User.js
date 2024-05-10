const DB = require("./db.json");
const { saveToDatabase } = require("./utils");

const getAllUsers = () => {
    return DB.users;
};

const getOneUser = (userId) => {
    const user = DB.users.find(
        (user) => (user.id === userId)
        );

    if (!user) {
        return;
    }

    return user;
};

const createNewUser = (newUser) => {
    const isAlreadyAdded = DB.users.findIndex((user) => user.name === newUser.name) > -1;

    if(isAlreadyAdded){
        return;
    }

    DB.users.push(newUser);
    saveToDatabase(DB);
    return newUser;
} 

const updateUser = (userId, changes) => {
    const indexForUpdated = DB.users.findIndex(
        (user) => (user.id === userId)
    ); 

    if(indexForUpdated === -1){
        return;
    }

    const updateUser = {
        ...DB.users[indexForUpdated],
        ...changes,
        last_update: new Date().toLocaleString("en-US", { timeZone: "UTC"})
    };

    DB.users[indexForUpdated] = updateUser;
    saveToDatabase(DB);
    return updateUser;
};

const deleteUser = (userId) => {
    const indexForDelete = DB.users.findIndex(
        (user) => (user.id === userId)
    );

    if(indexForDelete === -1){
        return;
    }

    DB.users.splice(indexForDelete, 1);
    saveToDatabase(DB);
}

module.exports = {
getAllUsers,
getOneUser,
createNewUser,
updateUser,
deleteUser
};