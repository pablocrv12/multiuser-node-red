const Flow = require('../models/Flow');

const findByUserId = async (userId) => {
    return await Flow.find({ userId });
};

const findOneById = async (flowId) => {
    return await Flow.findOne({ _id: flowId });
};

const findByIdWithClasses = async (flowId) => {
    return await Flow.findById(flowId).select('classes');
};

const create = async (newFlow) => {
    return await Flow.create(newFlow);
};

const findOneAndUpdate = async (userId, flowId, changes) => {
    return await Flow.findOneAndUpdate({ _id: flowId, userId }, changes, { new: true });
};

const findOneAndDelete = async (userId, flowId) => {
    return await Flow.findOneAndDelete({ _id: flowId, userId });
};

const findFlowsByClassId = async (classId) => {
    return await Flow.find({ classes: classId }).exec();
};

module.exports = {
    findByUserId,
    findOneById,
    findByIdWithClasses,
    create,
    findOneAndUpdate,
    findOneAndDelete,
    findFlowsByClassId
};
