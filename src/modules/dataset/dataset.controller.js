import {
  getAllDatasets,
  getDatasetById,
  queryDatasetRecords,
  generateExportContent,
  updateDatasetSuggestions,
} from "./dataset.service.js";
import { datasetChatNode, generateContextualQuestions, generateAISuggestions } from "../../ai/nodes/datasetChat.node.js";
import { reportGeneratorNode } from "../../ai/nodes/reportGenerator.node.js";
import { logger } from "../../utils/logger.js";

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

