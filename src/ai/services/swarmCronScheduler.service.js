import mongoose from "mongoose";
import axios from "axios";
import { Dataset } from "../../modules/dataset/dataset.model.js";
import { logger } from "../../utils/logger.js";
import { computeDatasetDiff } from "./datasetDiff.service.js";

let schedulerInterval = null;

/**
 * Autonomous Swarm Cron Scheduler Worker
 * Periodically checks for scheduled datasets and executes background synchronization.
 */
export const checkAndRunScheduledSwarmTasks = async () => {
  try {
    if (mongoose.connection.readyState !== 1) return;

    const now = new Date();
    const dueDatasets = await Dataset.find({
      "schedule.enabled": true,
      "schedule.nextRunAt": { $lte: now }
    }).limit(5);

    if (dueDatasets.length === 0) return;

    logger.info(`⏰ [Autonomous Swarm Cron] Found ${dueDatasets.length} scheduled datasets due for synchronization.`);

    for (const dataset of dueDatasets) {
      try {
        const schedule = dataset.schedule;
        const frequency = schedule.frequency || "weekly";

        // Calculate next run date
        const nextRun = new Date();
        if (frequency === "daily") {
          nextRun.setDate(nextRun.getDate() + 1);
        } else if (frequency === "monthly") {
          nextRun.setMonth(nextRun.getMonth() + 1);
        } else {
          nextRun.setDate(nextRun.getDate() + 7);
        }

        dataset.schedule.lastRunAt = now;
        dataset.schedule.nextRunAt = nextRun;

        logger.info(`🔄 [Swarm Cron] Synchronizing dataset: "${dataset.title}" (Version: ${dataset.version || 1})`);

        // If webhookUrl is configured, dispatch automated webhook notification
        if (schedule.webhookUrl) {
          try {
            await axios.post(schedule.webhookUrl, {
              event: "DATASET_SCHEDULE_TRIGGERED",
              datasetId: dataset._id,
              title: dataset.title,
              version: dataset.version || 1,
              recordsCount: (dataset.records || []).length,
              timestamp: now.toISOString(),
              diffSummary: dataset.diffSummary || null
            }, { timeout: 8000 });
            logger.info(`📡 [Swarm Cron Webhook] Webhook successfully dispatched to: ${schedule.webhookUrl}`);
          } catch (webhookErr) {
            logger.warn(`⚠️ [Swarm Cron Webhook Warning] Webhook call failed to ${schedule.webhookUrl}: ${webhookErr.message}`);
          }
        }

        await dataset.save();
      } catch (itemErr) {
        logger.error(`❌ [Swarm Cron Task Error] Dataset ${dataset._id}: ${itemErr.message}`);
      }
    }
  } catch (err) {
    logger.error(`❌ [Swarm Cron Scheduler Cycle Error]: ${err.message}`);
  }
};

/**
 * Initialize Autonomous Swarm Cron Scheduler
 */
export const initSwarmCronScheduler = () => {
  if (schedulerInterval) return;

  logger.info("🕒 [Autonomous Swarm Cron Engine] Initializing background polling service (interval: 60s)...");
  
  // Run an initial check after 10 seconds
  setTimeout(checkAndRunScheduledSwarmTasks, 10000);

  // Poll every 60 seconds
  schedulerInterval = setInterval(checkAndRunScheduledSwarmTasks, 60000);
};

export const stopSwarmCronScheduler = () => {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
};
