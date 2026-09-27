import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import "./config/groqRotation.js"; // Initialize dynamic API key rotation patch
import { logger } from "./utils/logger.js";
import { initSwarmCronScheduler } from "./ai/services/swarmCronScheduler.service.js";

const startServer = async () => {
    await connectDB();

    // Start background autonomous Swarm Cron Scheduler
    initSwarmCronScheduler();

    app.listen(
        env.PORT,
        () => {
            logger.info(
                `Server running on port ${env.PORT}`
            );
        }
    );
};

startServer();