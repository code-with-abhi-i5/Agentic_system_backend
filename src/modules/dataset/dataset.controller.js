import {
  getAllDatasets,
  getDatasetById,
  queryDatasetRecords,
  generateExportContent,
  updateDatasetSuggestions,
} from "./dataset.service.js";
import { datasetChatNode, generateContextualQuestions, generateAISuggestions } from "../../ai/nodes/datasetChat.node.js";
import { reportGeneratorNode } from "../../ai/nodes/reportGenerator.node.js";
import { computeDatasetDiff } from "../../ai/services/datasetDiff.service.js";
import { Dataset } from "./dataset.model.js";
import { logger } from "../../utils/logger.js";
import mongoose from "mongoose";
import { fileStorage } from "../../utils/fileStorage.js";

export const listDatasets = async (req, res) => {
  try {
    const { limit = 20, skip = 0, search = "", userId } = req.query;
    const effectiveUserId = req.user?.userId || userId || null;
    const result = await getAllDatasets({
      limit: parseInt(limit, 10),
      skip: parseInt(skip, 10),
      search,
      userId: effectiveUserId,
    });
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getDataset = async (req, res) => {
  try {
    const { id } = req.params;
    const dataset = await getDatasetById(id);
    if (!dataset) {
      return res.status(404).json({ success: false, error: "Dataset not found" });
    }
    return res.status(200).json({ success: true, data: dataset });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getDatasetRecords = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      search = "",
      category = "ALL",
      sortField = "confidence",
      sortOrder = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const result = await queryDatasetRecords(id, {
      search,
      category,
      sortField,
      sortOrder,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const exportDatasetFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { format = "csv" } = req.query;

    const { content, contentType, filename } = await generateExportContent(id, format);

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.status(200).send(content);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Chat With Dataset — AI Q&A over dataset records
 * POST /api/datasets/:id/chat
 */
export const chatWithDataset = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, conversationHistory = [] } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, error: "Question is required." });
    }

    const dataset = await getDatasetById(id);
    if (!dataset) {
      return res.status(404).json({ success: false, error: "Dataset not found." });
    }

    const records = dataset.records || [];
    if (records.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          answer: "This dataset has no records to analyze.",
          relevantRecords: [],
          suggestedFollowups: ["Try running an extraction job to populate this dataset."],
        },
      });
    }

    logger.info(`💬 [Dataset Chat] Question for dataset ${id}: "${question.slice(0, 80)}"`);

    const result = await datasetChatNode({
      records,
      question,
      conversationHistory,
      datasetTitle: dataset.title || dataset.prompt || "",
    });

    return res.status(200).json({
      success: true,
      data: {
        answer: result.answer,
        relevantRecords: result.relevantRecords,
        suggestedFollowups: result.suggestedFollowups,
        dataInsight: result.dataInsight,
        datasetTitle: dataset.title,
        totalRecords: records.length,
      },
    });
  } catch (error) {
    logger.error(`❌ [Dataset Chat Error]: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Generate Executive Research Report
 * POST /api/datasets/:id/report
 */
export const generateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { reportType = "executive" } = req.body;

    const validTypes = ["executive", "technical", "competitive"];
    if (!validTypes.includes(reportType)) {
      return res.status(400).json({
        success: false,
        error: `Invalid report type. Must be one of: ${validTypes.join(", ")}`,
      });
    }

    const dataset = await getDatasetById(id);
    if (!dataset) {
      return res.status(404).json({ success: false, error: "Dataset not found." });
    }

    const records = dataset.records || [];
    if (records.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          report: {
            title: "Empty Dataset",
            executiveSummary: "No records available for report generation.",
            keyFindings: [],
            recommendations: [],
          },
        },
      });
    }

    logger.info(`📊 [Report Generator] Generating ${reportType} report for dataset ${id} (${records.length} records)`);

    const result = await reportGeneratorNode({
      records,
      prompt: dataset.prompt || dataset.title,
      reportType,
    });

    return res.status(200).json({
      success: true,
      data: {
        report: result.report,
        datasetTitle: dataset.title,
        datasetId: id,
      },
    });
  } catch (error) {
    logger.error(`❌ [Report Generator Error]: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get Dataset Lineage
 * GET /api/datasets/:id/lineage
 */
export const getDatasetLineage = async (req, res) => {
  try {
    const { id } = req.params;
    const dataset = await getDatasetById(id);

    if (!dataset) {
      return res.status(404).json({ success: false, error: "Dataset not found." });
    }

    return res.status(200).json({
      success: true,
      data: {
        lineage: dataset.lineage || null,
        datasetTitle: dataset.title,
        totalRecords: (dataset.records || []).length,
        createdAt: dataset.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get Contextual Follow-up Suggestions for Dataset
 * GET /api/datasets/:id/suggestions
 */
export const getDatasetSuggestions = async (req, res) => {
  try {
    const { id } = req.params;
    const dataset = await getDatasetById(id);

    if (!dataset) {
      return res.status(404).json({ success: false, error: "Dataset not found." });
    }

    // 1. If dataset already has cached AI suggested questions, return them instantly (0 extra tokens)
    if (Array.isArray(dataset.suggestedQuestions) && dataset.suggestedQuestions.length > 0) {
      return res.status(200).json({
        success: true,
        data: {
          datasetTitle: dataset.title,
          datasetId: dataset._id,
          suggestions: dataset.suggestedQuestions,
          cached: true,
        },
      });
    }

    // 2. Otherwise generate with AI Model (compact token footprint, < 250 tokens)
    let suggestions = [];
    try {
      suggestions = await generateAISuggestions({
        title: dataset.title || dataset.prompt || "",
        prompt: dataset.prompt || "",
        records: dataset.records || [],
      });
    } catch (err) {
      logger.warn(`AI suggestion generation error: ${err.message}. Using fallback.`);
    }

    if (!suggestions || suggestions.length === 0) {
      suggestions = generateContextualQuestions(
        dataset.title || dataset.prompt || "",
        dataset.records || []
      );
    }

    // 3. Cache to dataset storage so future visits don't consume tokens
    if (suggestions && suggestions.length > 0) {
      try {
        await updateDatasetSuggestions(id, suggestions);
      } catch (cacheErr) {
        // silent fail on cache
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        datasetTitle: dataset.title,
        datasetId: dataset._id,
        suggestions,
        cached: false,
      },
    });
  } catch (error) {
    logger.error(`❌ [Dataset Suggestions Error]: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Time-Travel Dataset Diff
 * GET /api/datasets/:id/diff?compareWith=<optional_older_id>
 */
export const getDatasetDiff = async (req, res) => {
  try {
    const { id } = req.params;
    const { compareWith } = req.query;

    const currentDataset = await getDatasetById(id);
    if (!currentDataset) {
      return res.status(404).json({ success: false, error: "Target dataset not found." });
    }

    let olderDataset = null;

    if (compareWith) {
      olderDataset = await getDatasetById(compareWith);
    } else if (currentDataset.parentDatasetId) {
      olderDataset = await getDatasetById(currentDataset.parentDatasetId);
    } else {
      // Find the most recent older dataset matching the same prompt or title
      let olderCandidates = [];
      if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(currentDataset._id)) {
        try {
          olderCandidates = await Dataset.find({
            _id: { $ne: currentDataset._id },
            $or: [
              ...(currentDataset.prompt ? [{ prompt: currentDataset.prompt }] : []),
              ...(currentDataset.title ? [{ title: currentDataset.title }] : [])
            ]
          })
          .sort({ createdAt: -1 })
          .limit(1)
          .lean();
        } catch (e) {}
      }

      if (!olderCandidates || olderCandidates.length === 0) {
        const diskList = fileStorage.getDatasets();
        olderCandidates = diskList.filter(d => 
          String(d._id) !== String(currentDataset._id) &&
          ((currentDataset.prompt && d.prompt === currentDataset.prompt) || 
           (currentDataset.title && d.title === currentDataset.title))
        );
      }

      if (olderCandidates && olderCandidates.length > 0) {
        olderDataset = olderCandidates[0];
      }
    }

    if (!olderDataset) {
      // No older version to compare with - return clean self baseline
      return res.status(200).json({
        success: true,
        data: {
          hasComparison: false,
          message: "This is the initial baseline version of this dataset (No earlier version found).",
          summary: {
            totalOld: 0,
            totalNew: (currentDataset.records || []).length,
            addedCount: (currentDataset.records || []).length,
            removedCount: 0,
            mutatedCount: 0,
            unchangedCount: 0,
            driftPercentage: 0
          },
          diffs: {
            added: (currentDataset.records || []).map(r => ({ ...r, _diffType: "ADDED" })),
            removed: [],
            mutated: [],
            unchanged: []
          },
          allRecordsWithDiff: (currentDataset.records || []).map(r => ({ ...r, _diffType: "ADDED" })),
          currentDataset: {
            id: currentDataset._id,
            title: currentDataset.title,
            version: currentDataset.version || 1,
            createdAt: currentDataset.createdAt
          },
          comparedWith: null
        }
      });
    }

    const diffResult = computeDatasetDiff(olderDataset.records || [], currentDataset.records || []);

    return res.status(200).json({
      success: true,
      data: {
        hasComparison: true,
        summary: diffResult.summary,
        diffs: diffResult.diffs,
        allRecordsWithDiff: diffResult.allRecordsWithDiff,
        currentDataset: {
          id: currentDataset._id,
          title: currentDataset.title,
          version: currentDataset.version || 1,
          createdAt: currentDataset.createdAt
        },
        comparedWith: {
          id: olderDataset._id,
          title: olderDataset.title,
          version: olderDataset.version || 1,
          createdAt: olderDataset.createdAt
        }
      }
    });

  } catch (error) {
    logger.error(`❌ [Dataset Diff Error]: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Configure Autonomous Swarm Cron for Dataset
 * POST /api/datasets/:id/schedule
 */
export const configureDatasetSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { enabled, frequency = "weekly", cron = "0 9 * * 1", webhookUrl = "" } = req.body;

    let dataset = null;
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      try {
        dataset = await Dataset.findById(id);
      } catch (e) {}
    }
    if (!dataset) {
      dataset = fileStorage.getDatasetById(id);
    }
    if (!dataset) {
      return res.status(404).json({ success: false, error: "Dataset not found." });
    }

    let nextRunAt = new Date();
    if (frequency === "daily") {
      nextRunAt.setDate(nextRunAt.getDate() + 1);
    } else if (frequency === "monthly") {
      nextRunAt.setMonth(nextRunAt.getMonth() + 1);
    } else {
      nextRunAt.setDate(nextRunAt.getDate() + 7);
    }

    dataset.schedule = {
      enabled: Boolean(enabled),
      frequency,
      cron,
      webhookUrl,
      lastRunAt: dataset.schedule?.lastRunAt || null,
      nextRunAt: enabled ? nextRunAt : null
    };

    if (dataset.save) {
      await dataset.save();
    } else {
      fileStorage.saveDataset(dataset);
    }

    logger.info(`⏰ [Swarm Cron] Schedule updated for dataset "${dataset.title}": Enabled=${enabled}, Frequency=${frequency}`);

    return res.status(200).json({
      success: true,
      data: {
        datasetId: dataset._id,
        schedule: dataset.schedule,
        message: enabled
          ? `Autonomous Swarm Cron scheduled (${frequency}). Next execution: ${nextRunAt.toLocaleDateString()}`
          : "Autonomous Swarm Cron paused."
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get Historical Versions for a Dataset
 * GET /api/datasets/:id/versions
 */
export const getDatasetVersions = async (req, res) => {
  try {
    const { id } = req.params;
    const current = await getDatasetById(id);
    if (!current) {
      return res.status(404).json({ success: false, error: "Dataset not found." });
    }

    let versions = [];
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(current._id)) {
      try {
        versions = await Dataset.find({
          $or: [
            { _id: current._id },
            { parentDatasetId: current._id },
            { parentDatasetId: current.parentDatasetId },
            ...(current.prompt ? [{ prompt: current.prompt }] : [])
          ]
        })
        .select("_id title version stats records createdAt schedule")
        .sort({ createdAt: -1 })
        .lean();
      } catch (e) {}
    }

    if (!versions || versions.length === 0) {
      const diskList = fileStorage.getDatasets();
      versions = diskList.filter(d => 
        String(d._id) === String(current._id) ||
        (current.parentDatasetId && String(d._id) === String(current.parentDatasetId)) ||
        (d.parentDatasetId && String(d.parentDatasetId) === String(current._id)) ||
        (current.prompt && d.prompt === current.prompt)
      );
    }

    const formattedVersions = versions.map((v) => ({
      id: v._id,
      title: v.title,
      version: v.version || 1,
      recordsCount: (v.records || []).length,
      createdAt: v.createdAt,
      isCurrent: String(v._id) === String(current._id)
    }));

    return res.status(200).json({ success: true, data: formattedVersions });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

