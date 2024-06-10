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
            type: String,
        },
        classes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class' // Referencia al modelo de clase
        }],
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Esto es opcional si deseas referenciar al modelo User
            required: true
        }
    }
);

module.exports = mongoose.model('Flow', UserSchema);