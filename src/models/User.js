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
    }
});

module.exports = mongoose.model('User', UserSchema);