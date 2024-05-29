const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true // Garantiza que cada correo electrónico sea único
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
        ref: 'Class' // Referencia al modelo de clase
    }],
    joinedClasses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class' // Referencia al modelo de clase
    }]
});

module.exports = mongoose.model('User', UserSchema);