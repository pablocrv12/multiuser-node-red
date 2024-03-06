const { v4: uuid } = require("uuid"); 
const Flow = require("../database/Flow");

const getAllFlows = () => {
    const allFlows = Flow.getAllFlows();
    return allFlows;
};
const getOneFlow = (flowId) => {
    const flow = Flow.getOneFlow(flowId);
    return flow;
};
const createNewFlow = (newFlow) => {
    const flowToInsert = {
        ...newFlow,
        id: uuid(),
        creation_date: new Date().toLocaleString("en-US", { timezone: "UTC"} ),
        last_update: new Date().toLocaleString("en-US", { timezone: "UTC"} )
    }

    const createdFlow = Flow.createNewFlow(flowToInsert);
    return createdFlow;
};
const updateFlow = (flowId, changes) => {
    const updateFlow = Flow.updateFlow(flowId,changes);
    return updateFlow;
};
const deleteFlow = () => {
    Flow.deleteFlow(flowId);
};

module.exports = {
    getAllFlows,
    getOneFlow,
    createNewFlow,
    updateFlow,
    deleteFlow
}