import { qwen27b } from "../models/qwen27b.js";
import { gpt120b } from "../models/gpt-120b.js";
import { logger } from "../../utils/logger.js";
import { retryWithRateLimit } from "../../utils/retryWithRateLimit.js";

const safeJsonParse = (str) => {
  if (!str) return null;
  let text = str.replace(/```json/gi, "").replace(/```/g, "").trim();

  // Find JSON object boundaries
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;

  const candidate = text.substring(firstBrace, lastBrace + 1);

  try {
    return JSON.parse(candidate);
  } catch (err1) {
    // Attempt repair if array of records got cut off
    const lastComma = candidate.lastIndexOf("},");
    if (lastComma !== -1) {
      try {
        return JSON.parse(candidate.slice(0, lastComma + 1) + "]}");
      } catch (err2) {}
    }
    const lastSingleBrace = candidate.lastIndexOf("}");
    if (lastSingleBrace !== -1) {
      try {
        return JSON.parse(candidate.slice(0, lastSingleBrace + 1) + "]}");
      } catch (err3) {}
    }
    return null;
  }
};

export const dataExtractorNode = async (state, config) => {
  logger.info("🔍 [Data Extractor] Converting raw web text to structured tabular records...");

  const rawData = state.finalOutput || state.rawScrapedData || [];
  const systemPrompt = `You are an elite autonomous Data Extraction & Structuring AI Engine.
Extract ALL distinct, high-relevance entities (companies, channels, creators, projects, products) from the provided search excerpts that match the user query. Be thorough and enumerate every single valid entity (aim for 10-15 entities if mentioned). Do NOT stop after only 2 or 3 entities.

Output ONLY a valid parseable JSON object with this exact structure:
{
  "title": "Clean Dataset Title",
  "records": [
    {
      "company": "Name of Company, Channel or Entity",
      "category": "Industry or Category",
      "founder": "Founder, Creator or Key Person",
      "role": "Role (e.g. Creator, Founder)",
      "email": "Contact Email or Handle",
      "location": "City, Country",
      "funding": "Funding, Valuation or Subscribers",
      "techStack": "Technologies used or Focus Area",
      "sourceUrl": "Source URL citation",
      "sourceDomain": "Domain name (e.g. youtube.com)",
      "snippet": "Short excerpt mentioning this entity",
      "confidence": 98
    }
  ]
}

RULES:
- Return ONLY the JSON object. No markdown backticks, no explanatory comments.
- Keep snippet and techStack concise (1-2 sentences max).
- If specific fields are not explicitly mentioned in the text, use sensible estimates or "Undisclosed".`;

  const messages = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `USER QUERY: ${state.userQuery}\n\nWEB SEARCH EXCERPTS:\n${JSON.stringify(rawData).slice(0, 20000)}`,
    },
  ];

  logger.debug(`[Data Extractor] Sending request to model with user query: ${state.userQuery}`);

  let parsed = null;
  let modelUsed = "gpt-oss-120b";

  // Try primary model (gpt-oss-120b)
  try {
    const response = await retryWithRateLimit(() => gpt120b.invoke(messages), config);
    parsed = safeJsonParse(response?.content);
  } catch (err1) {
    logger.warn(`Primary model gpt120b failed: ${err1.message}. Falling back to qwen27b...`);
  }

  // Fallback to qwen27b if needed
  if (!parsed || !Array.isArray(parsed?.records) || parsed.records.length === 0) {
    try {
      modelUsed = "qwen3.8-27b";
      const fallbackResponse = await retryWithRateLimit(() => qwen27b.invoke(messages), config);
      parsed = safeJsonParse(fallbackResponse?.content);
    } catch (err2) {
      logger.error(`Fallback model qwen27b also failed: ${err2.message}`);
    }
  }

  const records = Array.isArray(parsed?.records) ? parsed.records : [];
  logger.info(`✅ [Data Extractor] (${modelUsed}) extracted ${records.length} structured records.`);
  logger.debug(`[Data Extractor] RAW LLM Response:\n${parsed ? JSON.stringify(parsed, null, 2) : "Failed to parse"}`);

  return {
    extractedDataset: parsed,
    extractedRecords: records,
    datasetTitle: parsed?.title || (state.userQuery?.length > 40 ? `${state.userQuery.slice(0, 38)}...` : state.userQuery) || "Intelligence Dataset",
  };
};
