const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {   
        name:{
            type: String
        },
        description:{
            type: String
        },
        creation_date:{
            type: Date,
            default: Date.now,//Date().toLocaleString("en-US", { timezone: "UTC"} ),
            required: true
        },
        last_update:{
            type: Date,
            default: Date.now,//Date().toLocaleString("en-US", { timezone: "UTC"} ),
            required: true
        },
        nodes:{
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        userId:{
            type: String, //mongoose.Schema.Types.ObjectId,
            // ref: 'User',
            default: "prueba",
            required: true
        }
    }
);

module.exports = mongoose.model('Flow', UserSchema);