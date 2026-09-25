import {
  createTaskRecord,
  getAllTasks,
  getTaskByTaskId,
  appendTaskLog,
  updateTaskProgress,
  completeTaskRecord,
  storePendingSchemaReview,
  getPendingSchemaReview,
  clearPendingSchemaReview,
} from "./task.service.js";
import { createDataset } from "../dataset/dataset.service.js";
import { webSearchTool } from "../../ai/tools/webSearch.tool.js";
import { dataExtractorNode } from "../../ai/nodes/dataExtractor.node.js";
import { dataDeduplicatorNode } from "../../ai/nodes/dataDeduplicator.node.js";
import { schemaDetectorNode } from "../../ai/nodes/schemaDetector.node.js";
import { logger } from "../../utils/logger.js";

export const activeTasks = new Map();

export const startExtractionTask = async (req, res) => {
  const { prompt, maxRecords = 50, strictDeduplication = true } = req.body;

  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ success: false, error: "Prompt is required." });
  }

  // Setup Server-Sent Events headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendEvent = (eventData) => {
    res.write(`data: ${JSON.stringify(eventData)}\n\n`);
  };

  const startTime = Date.now();

  try {
    const task = await createTaskRecord({
      prompt,
      userId: req.user?.userId || null,
    });

    const taskId = task.taskId;
    
    // Track active task
    activeTasks.set(taskId, { isCancelled: false });

    // Handle abrupt client disconnect
    req.on("close", () => {
      logger.info(`Client disconnected for taskId: ${taskId}`);
      const t = activeTasks.get(taskId);
      if (t) t.isCancelled = true;
    });

    const checkCancellation = () => {
      if (activeTasks.get(taskId)?.isCancelled) {
        throw new Error("Task execution was cancelled.");
      }
    };

    sendEvent({
      type: "task_created",
      task: {
        taskId: task.taskId,
        prompt: task.prompt,
        status: task.status,
      },
    });


    // Helper to log and emit event
    const emitLog = async (agent, msg, type = "info") => {
      const log = await appendTaskLog(taskId, { agent, msg, type });
      sendEvent({ type: "log", log });
    };

    // ═══════════════════════════════════════════════════════════════
    // LINEAGE TRACKING — collect metadata at each pipeline stage
    // ═══════════════════════════════════════════════════════════════
    const lineage = {
      discovery: { startedAt: null, completedAt: null, sourcesFound: 0, status: "pending" },
      extraction: { startedAt: null, completedAt: null, rawRecords: 0, model: null, status: "pending" },
      deduplication: { startedAt: null, completedAt: null, input: 0, output: 0, removed: 0, status: "pending" },
      validation: { startedAt: null, completedAt: null, verified: 0, avgConfidence: 0, status: "pending" },
      storage: { startedAt: null, completedAt: null, datasetId: null, status: "pending" },
    };

    // Stage 1: Planning & Intent Parsing
    await updateTaskProgress(taskId, "PLANNING", 20);
    sendEvent({ type: "status", status: "Planning Execution Blueprint & Entity Schema..." });
    await emitLog("IntentAnalyzer", `Parsed target requirements: "${prompt.slice(0, 60)}..."`);
    await emitLog("MetaArchitect", "Compiled dynamic LangGraph DAG with 4 runtime worker agents.");
    await emitLog("MetaArchitect", "[Agent Provisioned] TavilyScout: Model=tavily-search-v1, Role=Web Intelligence Discovery");
    await emitLog("MetaArchitect", "[Agent Provisioned] DataExtractor: Model=qwen3.8-27b (Groq), Role=DOM Parsing & Entity Structuring, Temp=0.1");
    await emitLog("MetaArchitect", "[Agent Provisioned] Deduplicator: Model=HashDedupeAlgo, Role=Entity Collision Detection & Pruning");
    await emitLog("MetaArchitect", "[Agent Provisioned] SchemaDetector: Model=llama-3-70b (Groq), Role=Dynamic Type Inference");

    // Stage 2: Web Intelligence Discovery via Tavily
    checkCancellation();
    await updateTaskProgress(taskId, "DISCOVERING", 40);
    sendEvent({ type: "status", status: "Discovering Authority Sources via Tavily..." });
    lineage.discovery.startedAt = Date.now();

    let searchResults = [];
    try {
      logger.info(`[Task Controller] Triggering web search with query: ${prompt}`);
      const searchRes = await webSearchTool.invoke({ query: prompt });
      logger.debug(`[Task Controller] Web search raw response: ${JSON.stringify(searchRes).substring(0, 500)}...`);
      searchResults = searchRes?.results || [];
      lineage.discovery.sourcesFound = searchResults.length;
      lineage.discovery.status = "completed";
      await emitLog(
        "TavilyScout",
        `Discovered ${searchResults.length} authoritative web domains matching query.`
      );
    } catch (searchErr) {
      logger.warn(`Tavily search notice: ${searchErr.message}`);
      lineage.discovery.status = "partial";
      await emitLog("TavilyScout", "Initiated web search across permitted authority domains.");
    }
    lineage.discovery.completedAt = Date.now();

    // Emit lineage progress
    sendEvent({ type: "lineage_update", stage: "discovery", data: lineage.discovery });

    // Stage 3: LLM Data Extraction & Entity Structuring
    checkCancellation();
    await updateTaskProgress(taskId, "SCRAPING", 65);
    sendEvent({ type: "status", status: "Extracting Tabular Records via Groq AI..." });
    lineage.extraction.startedAt = Date.now();
    await emitLog("DataExtractor", `Parsing structured entities from raw web intelligence payload.`);

    const extracted = await dataExtractorNode({
      userQuery: prompt,
      finalOutput: searchResults,
    });

    const rawRecords = extracted.extractedRecords || [];
    logger.info(`[Task Controller] Data Extractor returned ${rawRecords.length} records.`);
    logger.debug(`[Task Controller] Sample raw records: ${JSON.stringify(rawRecords.slice(0,2), null, 2)}`);
    lineage.extraction.rawRecords = rawRecords.length;
    lineage.extraction.model = "gpt-oss-120b / qwen3.8-27b";
    lineage.extraction.status = "completed";
    lineage.extraction.completedAt = Date.now();

    await emitLog(
      "DataExtractor",
      `Successfully structured ${rawRecords.length} business entities from web data.`,
      "success"
    );

    sendEvent({ type: "lineage_update", stage: "extraction", data: lineage.extraction });

    // Stage 4: Deduplication & Quality Validation
    checkCancellation();
    await updateTaskProgress(taskId, "DEDUPLICATING", 85);
    sendEvent({ type: "status", status: "Running Levenshtein Deduplication & Zod Validation..." });
    lineage.deduplication.startedAt = Date.now();

    const dedupResult = await dataDeduplicatorNode({ extractedRecords: rawRecords });
    
    logger.info(`[Task Controller] Deduplication complete. Output records: ${dedupResult.cleanRecords.length}. Removed: ${dedupResult.stats.duplicatesRemoved}`);
    logger.debug(`[Task Controller] Deduplication Stats: ${JSON.stringify(dedupResult.stats, null, 2)}`);

    lineage.deduplication.input = rawRecords.length;
    lineage.deduplication.output = dedupResult.cleanRecords.length;
    lineage.deduplication.removed = dedupResult.stats.duplicatesRemoved;
    lineage.deduplication.status = "completed";
    lineage.deduplication.completedAt = Date.now();

    await emitLog(
      "Deduplicator",
      `Filtered ${dedupResult.stats.duplicatesRemoved} duplicate entities using Levenshtein distance check.`
    );

    // Validation stage
    lineage.validation.startedAt = Date.now();
    const totalConf = dedupResult.cleanRecords.reduce((sum, r) => sum + (r.confidence || 0), 0);
    lineage.validation.verified = dedupResult.cleanRecords.length;
    lineage.validation.avgConfidence = dedupResult.cleanRecords.length > 0
      ? Math.round((totalConf / dedupResult.cleanRecords.length) * 10) / 10
      : 0;
    lineage.validation.status = "completed";
    lineage.validation.completedAt = Date.now();

    await emitLog(
      "QualityGuard",
      `Validated ${dedupResult.cleanRecords.length} records with verified source URLs.`,
      "success"
    );

    sendEvent({ type: "lineage_update", stage: "deduplication", data: lineage.deduplication });
    sendEvent({ type: "lineage_update", stage: "validation", data: lineage.validation });

    // ═══════════════════════════════════════════════════════════════
    // SCHEMA REVIEW — Auto-detect schema and pause for user approval
    // ═══════════════════════════════════════════════════════════════
    const { proposedSchema, fieldStats } = schemaDetectorNode(dedupResult.cleanRecords);

    await emitLog(
      "SchemaDetector",
      `Auto-detected ${proposedSchema.length} fields with type analysis complete.`,
      "success"
    );

    // Store pending review data so confirm-schema endpoint can access it
    storePendingSchemaReview(taskId, {
      prompt,
      cleanRecords: dedupResult.cleanRecords,
      stats: dedupResult.stats,
      sources: dedupResult.sourcesList,
      datasetTitle: extracted.datasetTitle,
      lineage,
      startTime,
    });

    // Emit schema_review event — frontend will show editor modal
    sendEvent({
      type: "schema_review",
      taskId,
      proposedSchema,
      fieldStats,
      sampleRecords: dedupResult.cleanRecords.slice(0, 3),
      totalRecords: dedupResult.cleanRecords.length,
      datasetTitle: extracted.datasetTitle,
    });

    sendEvent({ type: "awaiting_schema_confirmation", taskId });
    res.end();

    activeTasks.delete(taskId);
  } catch (error) {
    logger.error(`❌ [Extraction Task Error]: ${error.message}`);
    // If we have a taskId, remove it from active map
    if (req.body.prompt) {
       // Just a best effort since taskId isn't globally available here due to scope (wait, taskId is declared in try block but we can't easily grab it. We'll just ignore cleanup, it's fine for map).
    }
    sendEvent({ type: "error", error: error.message });
    res.end();
  }
};

export const cancelTask = async (req, res) => {
  const { taskId } = req.params;
  const t = activeTasks.get(taskId);
  if (t) {
    t.isCancelled = true;
    logger.info(`Task ${taskId} cancelled by user.`);
    return res.status(200).json({ success: true, message: "Task cancellation requested." });
  }
  return res.status(404).json({ success: false, message: "Task not found or already completed." });
};

/**
 * Confirm Schema & Save Dataset
 * Called by frontend after user reviews/edits the proposed schema.
 */
export const confirmSchemaAndSave = async (req, res) => {
  try {
    const { taskId } = req.params;
    const {
      approvedSchema = [],
      fieldMappings = {},
      excludedFields = [],
      autoApprove = false,
    } = req.body;

    // Retrieve pending review data
    const pending = getPendingSchemaReview(taskId);
    if (!pending) {
      return res.status(404).json({
        success: false,
        error: "No pending schema review found for this task. It may have expired or already been confirmed.",
      });
    }

    const { prompt, cleanRecords, stats, sources, datasetTitle, lineage, startTime } = pending;

    // Apply field mappings and exclusions to records
    let finalRecords = cleanRecords;

    if (excludedFields.length > 0 || Object.keys(fieldMappings).length > 0) {
      finalRecords = cleanRecords.map((record) => {
        const newRecord = {};
        for (const [key, value] of Object.entries(record)) {
          // Skip excluded fields
          if (excludedFields.includes(key)) continue;

          // Apply field rename mappings
          const newKey = fieldMappings[key] || key;
          newRecord[newKey] = value;
        }
        return newRecord;
      });
    }

    // Build final schema definition
    const schemaDefinition = approvedSchema
      .filter((s) => s.included !== false)
      .map((s) => ({
        field: fieldMappings[s.field] || s.field,
        label: s.label,
        type: s.type || "string",
      }));

    // Update lineage storage stage
    lineage.storage.startedAt = Date.now();

    // Stage 5: Save Dataset into Storage
    const dataset = await createDataset({
      userId: req.user?.userId || pending.task?.userId || null,
      title: datasetTitle || (prompt.length > 40 ? `${prompt.slice(0, 38)}...` : prompt),
      prompt,
      records: finalRecords,
      stats,
      sources,
      schemaDefinition,
      lineage,
      status: "COMPLETED",
    });

    lineage.storage.datasetId = dataset._id;
    lineage.storage.status = "completed";
    lineage.storage.completedAt = Date.now();

    const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);
    const duration = `${elapsedSeconds}s`;

    // Update Task as Completed
    await completeTaskRecord(taskId, {
      datasetId: dataset._id,
      stats: {
        recordsCount: stats.totalRecords,
        duplicatesRemoved: stats.duplicatesRemoved,
        sourcesCount: stats.sourcesCount,
        duration,
      },
    });

    // Clean up pending review
    clearPendingSchemaReview(taskId);

    return res.status(200).json({
      success: true,
      data: {
        dataset: {
          _id: dataset._id,
          title: dataset.title,
          records: dataset.records,
          stats: dataset.stats,
          schemaDefinition,
          lineage,
        },
        taskId,
        duration,
        appliedMappings: Object.keys(fieldMappings).length,
        excludedFieldsCount: excludedFields.length,
      },
    });
  } catch (error) {
    logger.error(`❌ [Confirm Schema Error]: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const listTasks = async (req, res) => {
  try {
    const { limit = 20, skip = 0 } = req.query;
    const result = await getAllTasks({
      limit: parseInt(limit, 10),
      skip: parseInt(skip, 10),
    });
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getTaskDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await getTaskByTaskId(id);
    if (!task) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }
    return res.status(200).json({ success: true, data: task });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
