import { logger } from "../../utils/logger.js";

/**
 * Schema Detector Node
 * Automatically detects field types from extracted records.
 * Generates a schemaDefinition[] by analyzing data patterns.
 */

const FIELD_LABELS = {
  company: "Company / Entity",
  name: "Name",
  category: "Category",
  founder: "Founder / Contact",
  role: "Role / Title",
  email: "Email",
  location: "Location",
  funding: "Funding / Valuation",
  techStack: "Tech Stack",
  sourceUrl: "Source URL",
  sourceDomain: "Source Domain",
  snippet: "Excerpt / Snippet",
  confidence: "Confidence Score",
  scrapedAt: "Extracted At",
  status: "Status",
  id: "Record ID",
};

/**
 * Detect the type of a value
 */
const detectType = (value) => {
  if (value === null || value === undefined || value === "") return "string";

  if (typeof value === "number" || (!isNaN(Number(value)) && String(value).trim() !== "")) {
    return "number";
  }

  if (typeof value === "boolean" || value === "true" || value === "false") {
    return "boolean";
  }

  if (typeof value === "string") {
    // URL detection
    if (/^https?:\/\//i.test(value)) return "url";

    // Email detection
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "email";

    // Date detection (ISO format or common patterns)
    if (/^\d{4}-\d{2}-\d{2}/.test(value) || /^\d{2}\/\d{2}\/\d{4}/.test(value)) return "date";
  }

  return "string";
};

/**
 * Generate a human-readable label from a camelCase/snake_case field name
 */
const generateLabel = (fieldName) => {
  if (FIELD_LABELS[fieldName]) return FIELD_LABELS[fieldName];

  return fieldName
    .replace(/([A-Z])/g, " $1")       // camelCase → spaced
    .replace(/_/g, " ")                 // snake_case → spaced
    .replace(/^\s+/, "")                // trim leading space
    .replace(/\b\w/g, (c) => c.toUpperCase()); // capitalize each word
};

/**
 * Analyze all records and produce a proposed schema
 */
export const schemaDetectorNode = (records = []) => {
  logger.info("🔎 [Schema Detector] Analyzing record structures to auto-detect schema...");

  if (!records.length) {
    return { proposedSchema: [], fieldStats: {} };
  }

  // Collect all unique field names across all records
  const fieldOccurrences = new Map(); // field -> { types: Map<type, count>, nonEmpty: number }

  for (const record of records) {
    for (const [key, value] of Object.entries(record)) {
      if (!fieldOccurrences.has(key)) {
        fieldOccurrences.set(key, { types: new Map(), nonEmpty: 0, total: 0 });
      }

      const stats = fieldOccurrences.get(key);
      stats.total++;

      if (value !== null && value !== undefined && value !== "" && value !== "Undisclosed" && value !== "N/A") {
        stats.nonEmpty++;
        const detectedType = detectType(value);
        stats.types.set(detectedType, (stats.types.get(detectedType) || 0) + 1);
      }
    }
  }

  // Internal/system fields to exclude from user-editable schema
  const excludedFields = new Set(["id", "_id", "__v", "status", "scrapedAt"]);

  // Build proposedSchema with analytics
  const proposedSchema = [];
  const fieldStats = {};

  // Priority order for common fields
  const priorityOrder = [
    "company", "name", "category", "founder", "role", "email",
    "location", "funding", "techStack", "sourceUrl", "sourceDomain",
    "snippet", "confidence"
  ];

  const sortedFields = [...fieldOccurrences.keys()].sort((a, b) => {
    const aIdx = priorityOrder.indexOf(a);
    const bIdx = priorityOrder.indexOf(b);
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return a.localeCompare(b);
  });

  for (const field of sortedFields) {
    if (excludedFields.has(field)) continue;

    const stats = fieldOccurrences.get(field);

    // Determine dominant type
    let dominantType = "string";
    let maxCount = 0;
    for (const [type, count] of stats.types) {
      if (count > maxCount) {
        dominantType = type;
        maxCount = count;
      }
    }

    const fillRate = records.length > 0
      ? Math.round((stats.nonEmpty / records.length) * 100)
      : 0;

    const typeConfidence = stats.nonEmpty > 0
      ? Math.round((maxCount / stats.nonEmpty) * 100)
      : 100;

    proposedSchema.push({
      field,
      label: generateLabel(field),
      type: dominantType,
      included: true,
      fillRate,
      typeConfidence,
    });

    fieldStats[field] = {
      nonEmpty: stats.nonEmpty,
      total: stats.total,
      fillRate,
      typeDistribution: Object.fromEntries(stats.types),
      dominantType,
      typeConfidence,
    };
  }

  logger.info(
    `✅ [Schema Detector] Detected ${proposedSchema.length} fields from ${records.length} records.`
  );

  return { proposedSchema, fieldStats };
};
