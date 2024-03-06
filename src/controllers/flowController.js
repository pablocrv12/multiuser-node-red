const flowService = require("../services/flowService");

const getAllFlows = (req, res) => {
    const allFlows = flowService.getAllFlows();
    res.send({status: "Ok", data: allFlows });
};

const getOneFlow = (req, res) => {
    const {
        params: { flowId },
    } = req

    if(!flowId){
        return;
    }

    const flow = flowService.getOneFlow(flowId);
    res.send({status: "Ok", data: flow});
};

const createNewFlow = (req, res) => {
    const { body } = req;

    if(!body.name || !user){
        return;
    }

    const newFlow = {name: body.name, description: body.description, nodes: {}, user: body.user};

    const createdFlow = flowService.createNewFlow(newFlow);
    res.status(201).send({status: "OK", data: createdFlow});
};

const updateFlow = (req, res) => {
    const { body, params: { flowId },
    }  = req

    if(!flowId){
        return;
    }

    const updateFlow = flowService.updateFlow(flowId, body);
    res.send({status: "OK", data: updateFlow});
};

const deleteFlow = (req, res) => {
    const {
        params: { flowId }, 
    } = req

    if(!flowId){
        return;
    }

    flowService.deleteFlow(flowId);
    res.status(204).send({ status: "OK" });
};

module.exports = {
    getAllFlows,
    getOneFlow,
    createNewFlow,
    updateFlow,
    deleteFlow
}