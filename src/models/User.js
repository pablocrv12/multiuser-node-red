const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String
    },
    role: {
        type: String,
        enum: ['admin', 'student', 'professor', 'user'],
        default: 'user'
    },
    createdClasses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    }],
    joinedClasses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    }],
    flows: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Flow' 
    }]
});

module.exports = mongoose.model('User', UserSchema);