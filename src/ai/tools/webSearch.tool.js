import { TavilySearch } from "@langchain/tavily";
import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";

export const webSearchTool = new TavilySearch({
    maxResults: 20,
    topic: "general",
    searchDepth: "advanced",
    includeAnswer: true,
    includeRawContent: false,
    tavilyApiKey: env.TAVILY_API_KEY
});

webSearchTool.name = "web_search_tool";

/**
 * Executes a multi-query search to retrieve deep authoritative sources safely.
 * Runs sequentially with rate-limit pacing (1.1s delay) to strictly prevent Tavily 429 errors.
 */
export const executeMultiWebSearch = async (query, options = {}) => {
    const { targetCount = 15, onProgress } = options;

    const cleanTopic = query
        .replace(/\b(?:top|find|give|get|show|list)\b/gi, "")
        .replace(/\b\d{1,3}\b/g, "")
        .replace(/\s+/g, " ")
        .trim();

    // Generate up to 3 diversified discovery vectors for comprehensive web coverage
    const queries = [query];
    if (cleanTopic) {
        queries.push(`best ${cleanTopic} comprehensive directory list`);
        if (targetCount >= 8) {
            queries.push(`top popular ${cleanTopic} rankings guide`);
        }
    }

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
                await new Promise(r => setTimeout(r, 1100));
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