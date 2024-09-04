const mongoose = require("mongoose");

const FlowSchema = new mongoose.Schema(
    {   
        name:{
            type: String
        },
        description:{
            type: String
        },
        creation_date:{
            type: Date,
            default: Date.now,
            required: true
        },
        last_update:{
            type: Date,
            default: Date.now,
            required: true
        },
        nodes:{
            type: String,
        },
        classes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class'
        }],
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', 
            required: true
        }
    }
);

module.exports = mongoose.model('Flow', FlowSchema);