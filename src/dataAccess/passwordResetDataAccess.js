const PasswordReset = require('../models/PasswordReset');

// Guardar el token de restablecimiento en la base de datos
const create = async (data) => {
    return await PasswordReset.create(data);
};


const findResetRecord = async (token) => {
    return await PasswordReset.findOne({
        token,
        expiresAt: { $gt: Date.now() } // Comprobar que el token no ha expirado
    }).exec();
};

const findUserByEmail = async (email) => {
    return await User.findOne({ email }).exec();
};

const updateUserPassword = async (userId, hashedPassword) => {
    return await User.findByIdAndUpdate(userId, { password: hashedPassword }, { new: true }).exec();
};

const deleteResetToken = async (token) => {
    return await PasswordReset.deleteOne({ token }).exec();
};   

module.exports = {
    create,
    findResetRecord,
    findUserByEmail,
    updateUserPassword,
    deleteResetToken
};
