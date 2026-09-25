import { qwen27b } from "../models/qwen27b.js";
import { gpt120b } from "../models/gpt-120b.js";
import { logger } from "../../utils/logger.js";
import { retryWithRateLimit } from "../../utils/retryWithRateLimit.js";

/**
 * Dataset Chat Node
 * AI Q&A over dataset records — takes user question + dataset context,
 * returns structured answer with relevant record references.
 */

const safeJsonParse = (str) => {
  if (!str) return null;
  let text = str.replace(/```json/gi, "").replace(/```/g, "").trim();

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;

  const candidate = text.substring(firstBrace, lastBrace + 1);

  try {
    return JSON.parse(candidate);
  } catch (err) {
    // Try to repair truncated JSON
    const lastComma = candidate.lastIndexOf("},");
    if (lastComma !== -1) {
      try {
        return JSON.parse(candidate.slice(0, lastComma + 1) + "]}");
      } catch {}
    }
    return null;
  }
};

export const datasetChatNode = async ({ records, question, conversationHistory = [] }) => {
  logger.info(`🤖 [Dataset Chat] Processing question: "${question.slice(0, 80)}..."`);

  if (!records || records.length === 0) {
    return {
      answer: "This dataset is empty. No records available to analyze.",
      relevantRecords: [],
      suggestedFollowups: ["Try running an extraction job first."],
    };
  }

  // Prepare concise dataset context (limit to avoid token overflow)
  const maxRecordsInContext = Math.min(records.length, 50);
  const contextRecords = records.slice(0, maxRecordsInContext).map((r, i) => ({
    index: i + 1,
    company: r.company || r.name || "N/A",
    category: r.category || "N/A",
    founder: r.founder || "N/A",
    role: r.role || "N/A",
    email: r.email || "N/A",
    location: r.location || "N/A",
    funding: r.funding || "N/A",
    techStack: r.techStack || "N/A",
    confidence: r.confidence || "N/A",
    sourceUrl: r.sourceUrl || "N/A",
  }));

  const systemPrompt = `You are an expert Data Analyst AI assistant. You have access to a structured dataset with ${records.length} business intelligence records.

Your job is to answer the user's questions accurately based ONLY on the data provided below. If the data doesn't contain enough information, say so honestly.

DATASET RECORDS (${maxRecordsInContext} of ${records.length} total):
${JSON.stringify(contextRecords, null, 1)}

RULES:
- Answer based on the actual data. Do NOT fabricate or hallucinate information.
- Reference specific companies/records by name when relevant.
- For numerical questions (counts, averages, etc.), compute the answer from the data.
- For filtering questions, list the matching entities.
- Keep answers concise but comprehensive.

Return ONLY a valid JSON object with this structure:
{
  "answer": "Your detailed analytical answer here...",
  "relevantRecordIndices": [1, 3, 5],
  "suggestedFollowups": [
    "What is the average funding across these companies?",
    "Which companies use AI/ML in their tech stack?",
    "Show me companies based in the US"
  ],
  "dataInsight": "Optional one-line data insight or trend observation"
}

IMPORTANT: Return ONLY the JSON object. No markdown backticks, no extra text.`;

  // Build conversation messages
  const messages = [
    { role: "system", content: systemPrompt },
  ];

  // Add conversation history for multi-turn context
  if (conversationHistory.length > 0) {
    const recentHistory = conversationHistory.slice(-6); // Keep last 3 exchanges
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      });
    }
  }

  messages.push({ role: "user", content: question });

  let parsed = null;
  let modelUsed = "gpt-oss-120b";

  // Try primary model
  try {
    const response = await retryWithRateLimit(() => gpt120b.invoke(messages));
    parsed = safeJsonParse(response?.content);
  } catch (err) {
    logger.warn(`Dataset Chat primary model failed: ${err.message}. Falling back to qwen27b...`);
  }

  // Fallback
  if (!parsed || !parsed.answer) {
    try {
      modelUsed = "qwen3.8-27b";
      const fallbackResponse = await retryWithRateLimit(() => qwen27b.invoke(messages));
      parsed = safeJsonParse(fallbackResponse?.content);
    } catch (err2) {
      logger.error(`Dataset Chat fallback also failed: ${err2.message}`);
    }
  }

  if (!parsed || !parsed.answer) {
    return {
      answer: "I couldn't process that question right now. Please try rephrasing or try again later.",
      relevantRecords: [],
      suggestedFollowups: [
        "How many companies are in this dataset?",
        "What are the main categories?",
        "Which companies have the highest confidence scores?",
      ],
    };
  }

  // Map record indices back to actual records
  const relevantRecords = (parsed.relevantRecordIndices || [])
    .filter((i) => i >= 1 && i <= records.length)
    .map((i) => records[i - 1]);

  logger.info(`✅ [Dataset Chat] (${modelUsed}) answered with ${relevantRecords.length} relevant records.`);

  return {
    answer: parsed.answer,
    relevantRecords,
    suggestedFollowups: parsed.suggestedFollowups || [],
    dataInsight: parsed.dataInsight || null,
    modelUsed,
  };
};
