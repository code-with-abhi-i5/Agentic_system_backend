import mongoose from "mongoose";
import { Task } from "./task.model.js";
import { Dataset } from "../dataset/dataset.model.js";
import { logger } from "../../utils/logger.js";
import { fileStorage } from "../../utils/fileStorage.js";

export const createTaskRecord = async ({ prompt, userId }) => {
  const taskId = `TASK-${Math.floor(1000 + Math.random() * 9000)}`;
  const nowStr = new Date().toTimeString().split(" ")[0];

  const initialTask = {
    taskId,
    userId: userId || null,
    prompt,
    status: "QUEUED",
    progress: 5,
    logs: [
      {
        time: nowStr,
        agent: "Engine",
        type: "info",
        msg: `Task ${taskId} registered with prompt: "${prompt.slice(0, 50)}..."`,
      },
    ],
    createdAt: new Date().toISOString(),
  };

  if (mongoose.connection.readyState === 1) {
    try {
      const doc = await Task.create(initialTask);
      const res = doc.toObject ? doc.toObject() : doc;
      fileStorage.saveTask(res);
      return res;
    } catch (e) {
      logger.warn(`MongoDB Task.create error: ${e.message}`);
    }
  }

  fileStorage.saveTask(initialTask);
  return initialTask;
};

export const getAllTasks = async ({ limit = 20, skip = 0, userId = null } = {}) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const query = {};
      if (userId) query.userId = userId;
      const [tasks, total] = await Promise.all([
        Task.find(query).populate("datasetId").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Task.countDocuments(query),
      ]);
      if (tasks && tasks.length > 0) {
        return { tasks, total };
      }
    } catch (e) {
      logger.warn(`MongoDB getAllTasks error: ${e.message}`);
    }
  }

  let list = fileStorage.getTasks();
  if (userId) {
    list = list.filter((t) => !t.userId || String(t.userId) === String(userId));
  }
  return { tasks: list.slice(skip, skip + limit), total: list.length };
};

export const getTaskByTaskId = async (taskId) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const found = await Task.findOne({
        $or: [{ taskId }, { _id: taskId.match(/^[0-9a-fA-F]{24}$/) ? taskId : null }],
      })
        .populate("datasetId")
        .lean();
      if (found) return found;
    } catch (e) {
      logger.warn(`MongoDB getTask error: ${e.message}`);
    }
  }

  return fileStorage.getTaskById(taskId);
};

export const appendTaskLog = async (taskId, { agent, type = "info", msg }) => {
  const time = new Date().toTimeString().split(" ")[0];
  if (mongoose.connection.readyState === 1) {
    try {
      await Task.findOneAndUpdate(
        { taskId },
        {
          $push: { logs: { time, agent, type, msg } },
        }
      );
    } catch (e) {}
  }
  const task = fileStorage.getTaskById(taskId);
  if (task) {
    if (!task.logs) task.logs = [];
    task.logs.push({ time, agent, type, msg });
    fileStorage.saveTask(task);
  }
  return { time, agent, type, msg };
};

export const updateTaskProgress = async (taskId, status, progress) => {
  if (mongoose.connection.readyState === 1) {
    try {
      await Task.findOneAndUpdate(
        { taskId },
        { status, progress },
        { returnDocument: 'after' }
      );
    } catch (e) {}
  }
  const task = fileStorage.getTaskById(taskId);
  if (task) {
    task.status = status;
    task.progress = progress;
    fileStorage.saveTask(task);
  }
  return task;
};

export const completeTaskRecord = async (taskId, { datasetId, stats }) => {
  if (mongoose.connection.readyState === 1) {
    try {
      await Task.findOneAndUpdate(
        { taskId },
        {
          status: "COMPLETED",
          progress: 100,
          datasetId,
          stats,
        },
        { returnDocument: 'after' }
      );
    } catch (e) {}
  }
  const task = fileStorage.getTaskById(taskId);
  if (task) {
    task.status = "COMPLETED";
    task.progress = 100;
    task.datasetId = datasetId;
    task.stats = stats;
    fileStorage.saveTask(task);
  }
  return task;
};

// ═══════════════════════════════════════════════════════════════
// Pending Schema Review — In-Memory Cache
// Stores extraction results while awaiting user schema confirmation.
// Auto-expires after 30 minutes to prevent memory leaks.
// ═══════════════════════════════════════════════════════════════
const pendingSchemaReviews = new Map();
const SCHEMA_REVIEW_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

export const storePendingSchemaReview = (taskId, data) => {
  pendingSchemaReviews.set(taskId, {
    ...data,
    storedAt: Date.now(),
  });

  // Auto-cleanup after expiry
  setTimeout(() => {
    if (pendingSchemaReviews.has(taskId)) {
      pendingSchemaReviews.delete(taskId);
      logger.info(`🗑️ [Schema Review] Auto-expired pending review for task ${taskId}`);
    }
  }, SCHEMA_REVIEW_EXPIRY_MS);
};

export const getPendingSchemaReview = (taskId) => {
  const pending = pendingSchemaReviews.get(taskId);
  if (!pending) return null;

  // Check expiry
  if (Date.now() - pending.storedAt > SCHEMA_REVIEW_EXPIRY_MS) {
    pendingSchemaReviews.delete(taskId);
    return null;
  }

  return pending;
};

export const clearPendingSchemaReview = (taskId) => {
  pendingSchemaReviews.delete(taskId);
};
