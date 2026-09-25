import { qwen27b } from "../models/qwen27b.js";
import { gpt120b } from "../models/gpt-120b.js";
import { logger } from "../../utils/logger.js";
import { retryWithRateLimit } from "../../utils/retryWithRateLimit.js";

/**
 * Report Generator Node
 * Generates executive research reports from dataset records.
 * Produces multi-section structured analysis with insights and recommendations.
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
    // Try to repair truncated JSON arrays
    const lastComma = candidate.lastIndexOf("},");
    if (lastComma !== -1) {
      try {
        return JSON.parse(candidate.slice(0, lastComma + 1) + "]}");
      } catch {}
    }
    const lastArr = candidate.lastIndexOf('",');
    if (lastArr !== -1) {
      try {
        return JSON.parse(candidate.slice(0, lastArr + 1) + '"]}');
      } catch {}
    }
    return null;
  }
};

export const reportGeneratorNode = async ({ records, prompt, reportType = "executive" }) => {
  logger.info(`📊 [Report Generator] Generating ${reportType} report for ${records.length} records...`);

  if (!records || records.length === 0) {
    return {
      report: {
        title: "Empty Dataset Report",
        executiveSummary: "No records available for analysis.",
        keyFindings: [],
        marketAnalysis: "Insufficient data.",
        trendInsights: [],
        recommendations: [],
        dataQualityScore: 0,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  // Prepare dataset summary for LLM context
  const maxRecordsInContext = Math.min(records.length, 40);
  const contextRecords = records.slice(0, maxRecordsInContext).map((r) => ({
    company: r.company || r.name || "N/A",
    category: r.category || "N/A",
    founder: r.founder || "N/A",
    location: r.location || "N/A",
    funding: r.funding || "N/A",
    techStack: r.techStack || "N/A",
    confidence: r.confidence || "N/A",
  }));

  // Pre-compute data statistics for the LLM
  const locations = {};
  const categories = {};
  const techStacks = {};
  let totalConfidence = 0;
  let confCount = 0;

  for (const r of records) {
    if (r.location && r.location !== "N/A" && r.location !== "Undisclosed") {
      locations[r.location] = (locations[r.location] || 0) + 1;
    }
    if (r.category && r.category !== "N/A") {
      categories[r.category] = (categories[r.category] || 0) + 1;
    }
    if (r.techStack && r.techStack !== "N/A") {
      const techs = r.techStack.split(/[,;/]/).map(t => t.trim()).filter(Boolean);
      for (const tech of techs) {
        techStacks[tech] = (techStacks[tech] || 0) + 1;
      }
    }
    if (typeof r.confidence === "number") {
      totalConfidence += r.confidence;
      confCount++;
    }
  }

  const avgConfidence = confCount > 0 ? Math.round(totalConfidence / confCount * 10) / 10 : 0;

  const reportTypeInstructions = {
    executive: "Write for C-level executives. Focus on strategic insights, market positioning, and investment opportunities. Keep language professional but accessible.",
    technical: "Write for technical leaders (CTO/VP Engineering). Focus on technology stacks, engineering trends, and technical capabilities. Include specific tech details.",
    competitive: "Write for competitive intelligence analysts. Focus on market positioning, competitor analysis, strengths/weaknesses, and market gaps.",
  };

  const systemPrompt = `You are an elite Business Intelligence Research Analyst generating a ${reportType} report.

ORIGINAL RESEARCH QUERY: "${prompt}"

DATASET STATISTICS:
- Total Entities: ${records.length}
- Unique Locations: ${Object.keys(locations).length} (top: ${Object.entries(locations).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => `${k}: ${v}`).join(", ")})
- Categories: ${Object.entries(categories).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => `${k}: ${v}`).join(", ")}
- Top Technologies: ${Object.entries(techStacks).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => `${k}: ${v}`).join(", ")}
- Average Data Confidence: ${avgConfidence}%

DATASET RECORDS (${maxRecordsInContext} of ${records.length}):
${JSON.stringify(contextRecords, null, 1)}

INSTRUCTIONS: ${reportTypeInstructions[reportType] || reportTypeInstructions.executive}

Generate a comprehensive research report as a JSON object with this EXACT structure:
{
  "title": "Compelling Report Title",
  "executiveSummary": "2-3 paragraphs providing a high-level overview of the findings, key takeaways, and strategic implications.",
  "keyFindings": [
    { "finding": "Key finding statement", "detail": "Supporting detail with data", "impact": "high" },
    { "finding": "...", "detail": "...", "impact": "medium" }
  ],
  "marketAnalysis": "2-3 paragraphs analyzing market dynamics, competitive landscape, and positioning.",
  "geographicDistribution": [
    { "region": "Region Name", "count": 5, "percentage": 33 }
  ],
  "trendInsights": [
    { "trend": "Trend title", "description": "Trend explanation with data backing", "direction": "growing" }
  ],
  "recommendations": [
    { "action": "Recommended action", "rationale": "Why this matters", "priority": "high" }
  ],
  "dataQualityScore": 97.5
}

RULES:
- Provide 5-8 key findings with real data references.
- Include 3-5 trend insights based on patterns in the data.
- Provide 3-5 actionable recommendations.
- Geographic distribution should reflect actual data.
- Data quality score based on confidence and completeness.
- Return ONLY the JSON object. No markdown, no extra text.`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `Generate a comprehensive ${reportType} research report for the dataset collected from the query: "${prompt}"` },
  ];

  let parsed = null;
  let modelUsed = "gpt-oss-120b";

  // Try primary model
  try {
    const response = await retryWithRateLimit(() => gpt120b.invoke(messages));
    parsed = safeJsonParse(response?.content);
  } catch (err) {
    logger.warn(`Report Generator primary model failed: ${err.message}. Falling back to qwen27b...`);
  }

  // Fallback
  if (!parsed || !parsed.title) {
    try {
      modelUsed = "qwen3.8-27b";
      const fallbackResponse = await retryWithRateLimit(() => qwen27b.invoke(messages));
      parsed = safeJsonParse(fallbackResponse?.content);
    } catch (err2) {
      logger.error(`Report Generator fallback also failed: ${err2.message}`);
    }
  }

  if (!parsed || !parsed.title) {
    // Generate a basic report from pre-computed stats
    parsed = {
      title: `Research Intelligence Report: ${prompt.slice(0, 50)}`,
      executiveSummary: `This report analyzes ${records.length} entities discovered through autonomous web intelligence gathering for the query "${prompt}". The dataset contains entities across ${Object.keys(locations).length} geographic locations and ${Object.keys(categories).length} industry categories.`,
      keyFindings: [
        { finding: `${records.length} entities discovered`, detail: "Entities were extracted and verified from multiple web sources.", impact: "high" },
        { finding: `${Object.keys(locations).length} unique locations identified`, detail: `Most entities are concentrated in ${Object.keys(locations).slice(0, 3).join(", ")}`, impact: "medium" },
      ],
      marketAnalysis: "Detailed market analysis requires additional data enrichment. The current dataset provides a foundation for competitive intelligence.",
      geographicDistribution: Object.entries(locations)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([region, count]) => ({
          region,
          count,
          percentage: Math.round((count / records.length) * 100),
        })),
      trendInsights: [
        { trend: "Technology Concentration", description: `Top technologies include ${Object.keys(techStacks).slice(0, 3).join(", ")}`, direction: "growing" },
      ],
      recommendations: [
        { action: "Expand search scope", rationale: "Broader coverage yields better intelligence", priority: "medium" },
      ],
      dataQualityScore: avgConfidence,
    };
  }

  // Enrich with metadata
  parsed.generatedAt = new Date().toISOString();
  parsed.totalRecords = records.length;
  parsed.reportType = reportType;
  parsed.modelUsed = modelUsed;
  parsed.originalQuery = prompt;

  logger.info(`✅ [Report Generator] (${modelUsed}) Generated ${reportType} report: "${parsed.title}"`);

  return { report: parsed };
};
