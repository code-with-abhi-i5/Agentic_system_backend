import { TavilySearch } from "@langchain/tavily";
import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";

export const webSearchTool = new TavilySearch({
    maxResults: 15,
    topic: "general",
    searchDepth: "advanced",
    includeAnswer: true,
    includeRawContent: false,
    tavilyApiKey: env.TAVILY_API_KEY
});

webSearchTool.name = "web_search_tool";

/**
 * Executes a multi-query search to retrieve deep authoritative sources safely.
 * Runs sequentially with rate-limit pacing (1.2s delay) to strictly prevent Tavily 429 errors.
 */
export const executeMultiWebSearch = async (query, options = {}) => {
    const { targetCount = 15, onProgress } = options;

    // For 15 or fewer, a single Tavily call with maxResults: 15 is optimal and fast
    if (targetCount <= 15) {
        try {
            const single = await webSearchTool.invoke({ query });
            return {
                query,
                answer: single?.answer || "",
                results: single?.results || [],
                totalSources: (single?.results || []).length
            };
        } catch (err) {
            logger.warn(`Single search notice: ${err.message}`);
            return { query, answer: "", results: [], totalSources: 0 };
        }
    }

    // For larger targets (> 15, e.g. 50), run up to 3 queries sequentially with 1.2s pacing
    const cleanTopic = query
        .replace(/\b(?:top|find|give|get|show|list)\b/gi, "")
        .replace(/\b\d{1,3}\b/g, "")
        .replace(/\s+/g, " ")
        .trim();

    const queries = [
        query,
        `best ${cleanTopic} comprehensive directory`,
        `popular ${cleanTopic} rankings guide`
    ];

    if (onProgress) {
        await onProgress(`Initiating multi-query search across ${queries.length} discovery vectors...`);
    }

    const seenUrls = new Set();
    const mergedResults = [];
    let combinedAnswer = "";

    for (let i = 0; i < queries.length; i++) {
        const q = queries[i];
        try {
            if (i > 0) {
                // Rate-limit pause to ensure Tavily's 1 req/sec limit is respected
                await new Promise(r => setTimeout(r, 1200));
            }
            if (onProgress) {
                await onProgress(`Querying vector ${i + 1}/${queries.length}: "${q.slice(0, 45)}..."`);
            }
            const res = await webSearchTool.invoke({ query: q });
            if (res?.answer && !combinedAnswer) {
                combinedAnswer = res.answer;
            }
            for (const item of (res?.results || [])) {
                if (item?.url && !seenUrls.has(item.url.toLowerCase())) {
                    seenUrls.add(item.url.toLowerCase());
                    mergedResults.push(item);
                }
            }
        } catch (err) {
            logger.warn(`Multi-search subquery ${i + 1} notice: ${err.message}`);
        }
    }

    return {
        query,
        answer: combinedAnswer,
        results: mergedResults,
        totalSources: mergedResults.length
    };
};