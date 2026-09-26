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

export const generateContextualQuestions = (title = "", records = []) => {
  const t = (title || "").toLowerCase();

  // 1. YouTube / Creators / Channels / Video Content (High specificity)
  if (t.includes("youtube") || t.includes("channel") || t.includes("creator") || t.includes("video")) {
    const subTopic = (t.includes("blockchain") || t.includes("crypto") || t.includes("web3"))
      ? "blockchain and crypto"
      : (t.includes("fullstack") || t.includes("web") || t.includes("frontend") || t.includes("dev") || t.includes("code") || t.includes("program"))
      ? "programming and web development"
      : (t.includes("ai") || t.includes("ml") || t.includes("machine learning"))
      ? "AI and machine learning"
      : "key content";

    return [
      "Which YouTube channel has the highest confidence rating?",
      `What are the primary ${subTopic} topics and focus areas covered by these channels?`,
      "Can you list all creators or channels along with their source links and details?",
    ];
  }

  // 2. Colleges / Universities / Schools / Education / Campus
  const recordCategories = (records || []).slice(0, 10).map((r) => (r.category || "").toLowerCase());
  const isEducationFromRecords = recordCategories.some((c) => c.includes("higher education") || c.includes("college") || c.includes("university"));

  if (
    t.includes("college") ||
    t.includes("collage") ||
    t.includes("universit") ||
    t.includes("institute") ||
    t.includes("campus") ||
    t.includes("school") ||
    t.includes("academic") ||
    isEducationFromRecords
  ) {
    return [
      "Which college or institution has the highest rating or confidence score?",
      "What are the locations, courses, and educational categories of these institutions?",
      "Can you compare the listed institutions along with their verified source links?",
    ];
  }

  // 3. Blockchain / Crypto / Web3 / DeFi / NFT
  if (t.includes("crypto") || t.includes("blockchain") || t.includes("web3") || t.includes("defi") || t.includes("nft")) {
    return [
      "Which blockchain entities in this dataset have the highest confidence score?",
      "What are the primary categories and tech stacks represented?",
      "Show me the key founders and source links mentioned.",
    ];
  }

  // 4. Jobs / Hiring / Careers / Roles
  if (t.includes("job") || t.includes("hiring") || t.includes("career") || t.includes("role") || t.includes("developer")) {
    return [
      "Which roles or job titles are most common in this dataset?",
      "What are the top required skills and tech stacks listed?",
      "What locations and work arrangements are available?",
    ];
  }

  // 5. Healthcare / Hospitals / Clinics / Medical
  if (t.includes("hospital") || t.includes("clinic") || t.includes("doctor") || t.includes("health") || t.includes("medical")) {
    return [
      "Which hospital or healthcare center has the highest rating or confidence score?",
      "What are the primary medical specialties and facilities offered?",
      "Can you list the facility locations and source links?",
    ];
  }

  // 6. Startups / Companies / Funding / VCs
  if (t.includes("startup") || t.includes("fund") || t.includes("invest") || t.includes("company") || t.includes("companies")) {
    return [
      "Which companies have the highest funding or valuation?",
      "What are the leading industries and categories represented?",
      "Who are the key founders and what tech stacks do they use?",
    ];
  }

  // 7. Universal dynamic fallback using the actual title
  const cleanTitle = title.replace(/^(top|list of|best|find|get|show me|all)\s*\d*\s*/i, "").trim() || "entries";
  return [
    `Which ${cleanTitle} have the highest confidence score?`,
    `What are the main categories or specializations in this dataset?`,
    `Can you summarize the top ${cleanTitle} with key details?`,
  ];
};

/**
 * Generate 3 deep, genuine, data-grounded analytical questions using AI Model
 * Compact token footprint: uses only 5-6 sample rows (< 250 tokens total)
 */
export const generateAISuggestions = async ({ title = "", prompt = "", records = [] }) => {
  if (!records || records.length === 0) {
    return generateContextualQuestions(title || prompt, records);
  }

  // Slice top 5 records with minimal attributes to conserve tokens
  const sample = records.slice(0, 5).map((r) => ({
    entity: r.company || r.name || "N/A",
    category: r.category || "N/A",
    location: r.location || "N/A",
    confidence: r.confidence || "N/A",
  }));

  const systemPrompt = `You are an elite Data Analyst. Analyze this dataset title and 5 sample rows.
Generate EXACTLY 3 sharp, analytical follow-up questions that an investigator or user would ask about this exact dataset.

Rules:
- Questions must specifically relate to these records (entities, locations, categories, confidence).
- Focus on comparisons, top performers, patterns, and source verification.
- Output ONLY a JSON array with 3 strings. No markdown, no explanations.
Example: ["Question 1?", "Question 2?", "Question 3?"]

TITLE: "${title || prompt || "Dataset"}"
SAMPLE DATA:
${JSON.stringify(sample)}`;

  try {
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Generate 3 analytical follow-up questions for this dataset." },
    ];

    const response = await retryWithRateLimit(() => qwen27b.invoke(messages));
    const content = response?.content || "";
    const clean = content.replace(/```json/gi, "").replace(/```/g, "").trim();
    const start = clean.indexOf("[");
    const end = clean.lastIndexOf("]");

    if (start !== -1 && end !== -1 && end > start) {
      const parsed = JSON.parse(clean.substring(start, end + 1));
      if (Array.isArray(parsed) && parsed.length >= 3) {
        return parsed.slice(0, 3).map((q) => String(q).trim());
      }
    }
  } catch (err) {
    logger.warn(`AI suggestion generation skipped (${err.message}). Using smart fallback.`);
  }

  return generateContextualQuestions(title || prompt, records);
};

export const datasetChatNode = async ({ records, question, conversationHistory = [], datasetTitle = "" }) => {
  logger.info(`🤖 [Dataset Chat] Processing question for "${datasetTitle || "Dataset"}": "${question.slice(0, 80)}..."`);

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

  const topicDescription = datasetTitle ? `titled "${datasetTitle}"` : "extracted records";
  const systemPrompt = `You are an expert Data Analyst AI assistant. You have access to a structured dataset ${topicDescription} with ${records.length} records.

Your job is to answer the user's questions accurately based ONLY on the data provided below. If the data doesn't contain enough information, say so honestly.

DATASET RECORDS (${maxRecordsInContext} of ${records.length} total):
${JSON.stringify(contextRecords, null, 1)}

RULES:
- Answer based on the actual data. Do NOT fabricate or hallucinate information.
- Reference specific entities/records by name when relevant.
- For numerical questions (counts, averages, etc.), compute the answer from the data.
- For filtering or listing questions, enumerate ALL matching entities from the dataset. Do NOT artificially truncate to only 2 or 3 items unless the user explicitly requested a small count.
- Keep answers informative, well-structured, and comprehensive.

Return ONLY a valid JSON object with this structure:
{
  "answer": "Your detailed analytical answer here...",
  "relevantRecordIndices": [1, 3, 5],
  "suggestedFollowups": [
    "Relevant follow-up 1 for ${datasetTitle || "this topic"}",
    "Relevant follow-up 2 for ${datasetTitle || "this topic"}",
    "Relevant follow-up 3 for ${datasetTitle || "this topic"}"
  ],
  "dataInsight": "Optional one-line data insight or trend observation"
}

IMPORTANT RULES FOR suggestedFollowups:
- The 3 suggestedFollowups MUST be directly relevant to "${datasetTitle || "this dataset topic"}".
- Never ask generic questions about companies or funding unless the dataset is explicitly about companies or funding.
- If the dataset is about YouTube channels, ask about channels, creators, covered topics, or tech stacks.
- Return ONLY the JSON object. No markdown backticks, no extra text.`;

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
      suggestedFollowups: generateContextualQuestions(datasetTitle, records),
    };
  }

  // Map record indices back to actual records
  const relevantRecords = (parsed.relevantRecordIndices || [])
    .filter((i) => i >= 1 && i <= records.length)
    .map((i) => records[i - 1]);

  logger.info(`✅ [Dataset Chat] (${modelUsed}) answered with ${relevantRecords.length} relevant records.`);

  const followups = (Array.isArray(parsed.suggestedFollowups) && parsed.suggestedFollowups.length > 0)
    ? parsed.suggestedFollowups
    : generateContextualQuestions(datasetTitle, records);

  return {
    answer: parsed.answer,
    relevantRecords,
    suggestedFollowups: followups,
    dataInsight: parsed.dataInsight || null,
    modelUsed,
  };
};
