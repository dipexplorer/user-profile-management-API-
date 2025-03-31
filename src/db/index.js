const mongoose = require("mongoose");
require("dotenv").config();

const DB_NAME = process.env.DB_NAME || "user_profile";

const DB_URL = process.env.DB_URL;

const db_connect = async () => {
    try {
        const connectionIsntance = await mongoose.connect(
            `${DB_URL}/${DB_NAME}`
        );
        console.log(
            `connected to DB! DB host: ${connectionIsntance.connection.host}`
        );
    } catch (err) {
        console.error("Error connecting to MongoDB", err);
        process.exit(1);
    }
};

module.exports = db_connect;
