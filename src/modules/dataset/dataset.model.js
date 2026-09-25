import mongoose from "mongoose";

const schemaFieldDefinition = new mongoose.Schema(
  {
    field: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, default: "string" },
  },
  { _id: false }
);

const datasetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    prompt: {
      type: String,
      required: true,
      trim: true,
    },
    schemaDefinition: {
      type: [schemaFieldDefinition],
      default: [],
    },
    records: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    stats: {
      totalRecords: { type: Number, default: 0 },
      duplicatesRemoved: { type: Number, default: 0 },
      sourcesCount: { type: Number, default: 0 },
      accuracy: { type: Number, default: 99 },
    },
    sources: {
      type: [String],
      default: [],
    },
    lineage: {
      discovery: {
        startedAt: { type: Number },
        completedAt: { type: Number },
        sourcesFound: { type: Number, default: 0 },
        status: { type: String, default: "pending" },
      },
      extraction: {
        startedAt: { type: Number },
        completedAt: { type: Number },
        rawRecords: { type: Number, default: 0 },
        model: { type: String },
        status: { type: String, default: "pending" },
      },
      deduplication: {
        startedAt: { type: Number },
        completedAt: { type: Number },
        input: { type: Number, default: 0 },
        output: { type: Number, default: 0 },
        removed: { type: Number, default: 0 },
        status: { type: String, default: "pending" },
      },
      validation: {
        startedAt: { type: Number },
        completedAt: { type: Number },
        verified: { type: Number, default: 0 },
        avgConfidence: { type: Number, default: 0 },
        status: { type: String, default: "pending" },
      },
      storage: {
        startedAt: { type: Number },
        completedAt: { type: Number },
        datasetId: { type: String },
        status: { type: String, default: "pending" },
      },
    },
    status: {
      type: String,
      enum: ["PROCESSING", "COMPLETED", "FAILED"],
      default: "COMPLETED",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for high performance search & querying
datasetSchema.index({ title: "text", prompt: "text" });
datasetSchema.index({ createdAt: -1 });

export const Dataset = mongoose.model("Dataset", datasetSchema);
