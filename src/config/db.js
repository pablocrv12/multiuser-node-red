const mongoose = require("mongoose");
require('dotenv').config();

module.exports = () => {
    const connect = async () => {
        try {
            await mongoose.connect(process.env.DB_URI);
            console.log("Conexión correcta");
        } catch (err) {
            console.error("DB: Error!!", err);
        }
    };

    connect();
}