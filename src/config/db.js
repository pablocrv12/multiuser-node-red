const mongoose = require("mongoose");

const DB_URI = "mongodb+srv://pablocarvajalbenitez:y1O44Y1Y9endY7Kb@clustertfg.bblxsmc.mongodb.net/Multiuser-Node-RED";

module.exports = () => {
    const connect = async () => {
        try {
            await mongoose.connect(DB_URI);
            console.log("Conexión correcta");
        } catch (err) {
            console.error("DB: Error!!", err);
        }
    };

    connect();
}