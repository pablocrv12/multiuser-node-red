const DB = require("./db.json");
const { saveToDatabase } = require("./utils");
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

const getAllClases = (userId) => {
    return DB.classes.filter(clase => clase.professor === userId);
};


const getOneClaseByProfessor = (userId, claseId) => {
    const clase = DB.classes.find(
        (clase) => clase.id === claseId && clase.professor === userId
    );

    if (!clase) {
        return;
    }

    return clase;
};

const getFlowsByClase = async (userId, claseId) => {
    const clase = await Clase.findOne({ _id: claseId, professor: userId }).populate('flows');
    return clase ? clase.flows : null;
};



const createNewClase = (newClase) => {
    const isAlreadyAdded = DB.clases.findIndex((clase) => clase.name === newClase.name && clase.professor === newClase.professor) > -1;

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
getOneClaseByProfessor,
getFlowsByClase,
createNewClase,
updatedClase,
deleteClase
};