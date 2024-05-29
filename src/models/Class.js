const mongoose = require("mongoose");

const ClassSchema = new mongoose.Schema({
    professor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Referencia al modelo de usuario
        required: true
    },
    creation_date: {
        type: Date,
        default: Date.now,
        required: true
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Referencia al modelo de usuario
    }],
    flows: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Flow' // Referencia al modelo de flow
    }]
});

module.exports = mongoose.model('Class', ClassSchema);