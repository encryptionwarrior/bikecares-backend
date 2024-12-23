import mongoose from "mongoose";
import logger from "../logger/winston.logger.js";
import {DB_NAME} from "../constants.js"

export let dbInstance;

const connectDB = async () => {

    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        dbInstance = connectionInstance;
        logger.info(`\n MongoDB Connected! DB host: ${connectionInstance.connection.host}\n`)
    } catch (error) {
        logger.error("MongoDB connection error: ", error);
        process.exit(1);
    }
}


export default connectDB;
