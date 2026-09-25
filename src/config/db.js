import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

export const connectDB = async () => {
    try {
        const connection = await mongoose.connect(
            process.env.MONGO_URI
        );

        logger.info(
            `MongoDB Connected: ${connection.connection.host}`
        );
    }
    catch (error) {
        logger.error(
            "MongoDB Connection Failed: " + error.message
        );
        logger.warn(
            "⚠️ Please start local MongoDB or provide a MongoDB Atlas cloud URI in .env (MONGO_URI). Server will continue running..."
        );
    }
};