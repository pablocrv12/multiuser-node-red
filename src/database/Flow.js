const DB = require("./db.json");
const { saveToDatabase } = require("./utils");

const getAllFlows = () => {
    return DB.flows;
};

const getOneFlow = (flowId) => {
    const flow = DB.flows.find(
        (flow) => (flow.id === flowId)
        );

    if (!flow) {
        return;
    }

    return flow;
};

const createNewFlow = (newFlow) => {
    const isAlreadyAdded = DB.flows.findIndex((flow) => flow.name === newFlow.name) > -1;

    if(isAlreadyAdded){
        return;
    }

    DB.flows.push(newFlow);
    saveToDatabase(DB);
    return newFlow;
} 

const updateFlow = (flowId, changes) => {
    const indexForUpdated = DB.flows.findIndex(
        (flow) => (flow.id === flowId)
    ); 

    if(indexForUpdated === -1){
        return;
    }

    const updateFlow = {
        ...DB.flows[indexForUpdated],
        ...changes,
        last_update: new Date().toLocaleString("en-US", { timeZone: "UTC"})
    };

    DB.flows[indexForUpdated] = updateFlow;
    saveToDatabase(DB);
    return updateFlow;
};

const deleteFlow = (workoutId) => {
    const indexForDelete = DB.flows.findIndex(
        (flow) => (flow.id === flowId)
    );

    if(indexForDelete === -1){
        return;
    }

    DB.flows.splice(indexForDelete, 1);
    saveToDatabase(DB);
}

module.exports = {
getAllFlows,
getOneFlow,
createNewFlow,
updateFlow,
deleteFlow
};