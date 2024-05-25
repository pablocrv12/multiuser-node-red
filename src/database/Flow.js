const DB = require("./db.json");
const { saveToDatabase } = require("./utils");

const getAllFlows = (userId) => {
    return DB.flows.filter(flow => flow.userId === userId);
};

const getOneFlow = (userId, flowId) => {
    const flow = DB.flows.find(
        (flow) => flow.id === flowId && flow.userId === userId
    );

    if (!flow) {
        return;
    }

    return flow;
};

const createNewFlow = (newFlow) => {
    const isAlreadyAdded = DB.flows.findIndex((flow) => flow.name === newFlow.name && flow.userId === newFlow.userId) > -1;

    if (isAlreadyAdded) {
        return;
    }

    DB.flows.push(newFlow);
    saveToDatabase(DB);
    return newFlow;
};

const updateFlow = (userId, flowId, changes) => {
    const indexForUpdated = DB.flows.findIndex(
        (flow) => flow.id === flowId && flow.userId === userId
    );

    if (indexForUpdated === -1) {
        return;
    }

    const updatedFlow = {
        ...DB.flows[indexForUpdated],
        ...changes,
        last_update: new Date().toLocaleString("en-US", { timeZone: "UTC" })
    };

    DB.flows[indexForUpdated] = updatedFlow;
    saveToDatabase(DB);
    return updatedFlow;
};

const deleteFlow = (userId, flowId) => {
    const indexForDelete = DB.flows.findIndex(
        (flow) => flow.id === flowId && flow.userId === userId
    );

    if (indexForDelete === -1) {
        return;
    }

    DB.flows.splice(indexForDelete, 1);
    saveToDatabase(DB);
};


module.exports = {
getAllFlows,
getOneFlow,
createNewFlow,
updateFlow,
deleteFlow
};