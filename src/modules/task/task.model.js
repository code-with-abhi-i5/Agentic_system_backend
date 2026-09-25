import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    time: { type: String, required: true },
    agent: { type: String, required: true },
    type: { type: String, enum: ["info", "success", "warning", "error"], default: "info" },
    msg: { type: String, required: true },
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    taskId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    prompt: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["QUEUED", "PLANNING", "DISCOVERING", "SCRAPING", "DEDUPLICATING", "COMPLETED", "FAILED"],
      default: "QUEUED",
      index: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    datasetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dataset",
      required: false,
    },
    stats: {
      recordsCount: { type: Number, default: 0 },
      duplicatesRemoved: { type: Number, default: 0 },
      sourcesCount: { type: Number, default: 0 },
      duration: { type: String, default: "0s" },
    },
    logs: {
      type: [logSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.index({ createdAt: -1 });

export const Task = mongoose.model("Task", taskSchema);
