import { z } from "zod";
import { qwen27b } from "../models/qwen27b.js";
import { retryWithRateLimit } from "../../utils/retryWithRateLimit.js";
import { logger } from "../../utils/logger.js";

/**
 * Execution Blueprint Schema
 * Defines the structured plan synthesized by the MetaArchitect for any user query.
 */
export const ExecutionBlueprintSchema = z.object({
  domain: z.string().describe("Target problem domain (e.g. 'Generative AI', 'B2B SaaS Sales', 'Tech Recruiting', 'Clean Energy', 'Finance')"),
  entityType: z.enum([
    "COMPANIES_STARTUPS",
    "JOB_OPENINGS",
    "SALES_LEADS",
    "SPONSORS_PARTNERS",
    "MARKET_DATA",
    "OPEN_SOURCE_PROJECTS",
    "OTHER_ENTITIES"
  ]).describe("The primary semantic entity type being extracted"),
  searchVectors: z.array(z.string()).min(2).max(4).describe("2-4 high-intent, diversified search queries with domain-specific search operators designed to discover authoritative directories, registries, or listings"),
  targetFields: z.array(z.string()).min(4).max(10).describe("Optimal tabular column field keys to extract for this specific entity type (e.g. ['company', 'founder', 'funding'] or ['jobTitle', 'company', 'salaryRange', 'requiredSkills'])"),
  extractionStrategy: z.string().describe("1-2 sentence instruction to the DataExtractor LLM on how to accurately extract and disambiguate this specific entity type"),
  estimatedTargetCount: z.number().int().min(5).max(100).describe("Optimal number of entities to target based on the user prompt")
});

const plannerModel = qwen27b.withStructuredOutput(ExecutionBlueprintSchema);

/**
 * MetaArchitect Planner Service
 * Analyzes natural language prompts and compiles an actionable, domain-specific execution blueprint.
 */
export const planExecutionBlueprint = async (prompt, options = {}) => {
  const { maxRecords = 50 } = options;

  logger.info(`📐 [MetaArchitect Service] Compiling dynamic execution blueprint for: "${prompt.slice(0, 60)}..."`);

  const systemPrompt = `You are the MetaArchitect of an autonomous web intelligence platform.
Given a user's natural language data collection prompt, your job is to decompose it into an actionable execution blueprint:
1. Classify the problem domain and primary entity type (COMPANIES_STARTUPS, JOB_OPENINGS, SALES_LEADS, SPONSORS_PARTNERS, MARKET_DATA, OPEN_SOURCE_PROJECTS, OTHER_ENTITIES).
2. Synthesize 2 to 3 diversified, high-intent web search vectors. Use advanced query phrasing or site operators (e.g., crunchbase, techcrunch, lever.co, github.com) when appropriate.
3. Recommend 4 to 8 targeted tabular fields that best represent this entity type.
4. Formulate a concise extraction strategy for the extraction sub-agent.
5. Determine an optimal target record count based on prompt semantics (e.g. "top 10" -> 10, default to ${maxRecords}).`;

  try {
    const blueprint = await retryWithRateLimit(() =>
      plannerModel.invoke([
        { role: "system", content: systemPrompt },
        { role: "user", content: `USER PROMPT: "${prompt}"\nMAX REQUESTED RECORDS: ${maxRecords}` }
      ])
    );

    logger.info(`✅ [MetaArchitect Service] Blueprint compiled: Domain="${blueprint.domain}" | EntityType="${blueprint.entityType}" | TargetFields=[${blueprint.targetFields.join(", ")}]`);

    return {
      success: true,
      blueprint: {
        ...blueprint,
        estimatedTargetCount: Math.min(Math.max(blueprint.estimatedTargetCount || maxRecords, 5), 100)
      }
    };
  } catch (err) {
    logger.warn(`⚠️ [MetaArchitect Service] Planning failed (${err.message}). Activating resilient fallback blueprint...`);

    // Resilient fallback blueprint if LLM is unavailable or times out
    const numberMatch = prompt.match(/\b(?:top|find|give|get|show|list)?\s*(\d{1,3})\b/i);
    const targetCount = numberMatch ? parseInt(numberMatch[1], 10) : maxRecords || 25;

    return {
      success: false,
      blueprint: {
        domain: "General Intelligence",
        entityType: "COMPANIES_STARTUPS",
        searchVectors: [
          prompt,
          `${prompt} comprehensive directory list`,
          `top popular ${prompt} rankings guide`
        ],
        targetFields: ["company", "category", "stage", "founder", "funding", "location", "techStack"],
        extractionStrategy: "Extract all distinct, high-relevance entities matching the user query with clean tabular attributes.",
        estimatedTargetCount: Math.min(Math.max(targetCount, 5), 100)
      }
    };
  }
};
