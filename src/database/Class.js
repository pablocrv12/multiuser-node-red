const DB = require("./db.json");
const { saveToDatabase } = require("./utils");

const getAllClases = (userId) => {
    return DB.clases.filter(clase => clase.userId === userId);
};

const getOneClase = (userId, claseId) => {
    const clase = DB.clases.find(
        (clase) => clase.id === claseId && clase.userId === userId
    );

    if (!clase) {
        return;
    }

    return clase;
};

const createNewClase = (newClase) => {
    const isAlreadyAdded = DB.clases.findIndex((clase) => clase.name === newClase.name && clase.userId === newClase.userId) > -1;

    if (isAlreadyAdded) {
        return;
    }

    DB.clases.push(newClase);
    saveToDatabase(DB);
    return newClase;
};

const updatedClase = (userId, claseId, changes) => {
    const indexForUpdated = DB.clases.findIndex(
        (clase) => clase.id === claseId && clase.userId === userId
    );

    if (indexForUpdated === -1) {
        return;
    }

    const updatedClase = {
        ...DB.clases[indexForUpdated],
        ...changes,
        last_update: new Date().toLocaleString("en-US", { timeZone: "UTC" })
    };

    DB.clases[indexForUpdated] = updatedClase;
    saveToDatabase(DB);
    return updatedClase;
};

const deleteClase = (userId, claseId) => {
    const indexForDelete = DB.clases.findIndex(
        (clase) => clase.id === claseId && clase.userId === userId
    );

    if (indexForDelete === -1) {
        return;
    }

    DB.clases.splice(indexForDelete, 1);
    saveToDatabase(DB);
};


module.exports = {
getAllClases,
getOneClase,
createNewClase,
updateClase,
deleteClase
};