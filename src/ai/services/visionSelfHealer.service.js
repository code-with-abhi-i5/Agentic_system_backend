import { qwen27b } from "../models/qwen27b.js";
import { retryWithRateLimit } from "../../utils/retryWithRateLimit.js";
import { logger } from "../../utils/logger.js";
import { z } from "zod";
import puppeteer from "puppeteer";
import { webScraperTool } from "../tools/webScraper.tool.js";

// In-Memory Persistent Selector & Healing Cache
const SELECTOR_CACHE = new Map();

const SelfHealingVerdictSchema = z.object({
  success: z.boolean(),
  synthesizedSelector: z.string().describe("The newly discovered, robust CSS selector for recurring data items"),
  entityCount: z.number().int(),
  extractedItems: z.array(z.string()).describe("Text excerpts of the recovered entities"),
  healingRationale: z.string().describe("Explanation of how the DOM mutation was detected and resolved")
});

const healingJudgeModel = qwen27b.withStructuredOutput(SelfHealingVerdictSchema);

/**
 * Vision-Guided & Layout-Grounding Self-Healing Scraper Engine
 * Provides DOM-breakage immunity when standard CSS selectors fail.
 */
export class VisionSelfHealer {
  /**
   * Retrieves any previously learned selector for a domain
   */
  static getCachedSelector(url) {
    try {
      const hostname = new URL(url).hostname;
      return SELECTOR_CACHE.get(hostname) || null;
    } catch {
      return null;
    }
  }

  /**
   * Caches a synthesized selector for future fast-path execution
   */
  static setCachedSelector(url, selectorData) {
    try {
      const hostname = new URL(url).hostname;
      SELECTOR_CACHE.set(hostname, {
        ...selectorData,
        learnedAt: new Date().toISOString(),
        hits: 1
      });
      logger.info(`💾 [Self-Healer Cache] Cached learned selector for ${hostname}: "${selectorData.synthesizedSelector}"`);
    } catch (err) {
      logger.warn(`Failed to cache selector: ${err.message}`);
    }
  }

  /**
   * Executes primary scraping with automatic visual layout self-healing fallback on a Puppeteer page
   */
  static async scrapePage(page, url, options = {}) {
    const { targetSelector = null, onProgress = null } = options;

    logger.info(`🔍 [Self-Healing Scraper] Attempting extraction on: ${url}`);

    // Fast Path 1: Check Learned Cache
    const cached = this.getCachedSelector(url);
    if (cached && cached.synthesizedSelector) {
      logger.info(`⚡ [Self-Healer Cache Hit] Utilizing learned selector: "${cached.synthesizedSelector}"`);
      try {
        const cachedResults = await page.evaluate((sel) => {
          const items = Array.from(document.querySelectorAll(sel));
          return items.map(el => el.innerText.trim()).filter(Boolean);
        }, cached.synthesizedSelector);

        if (cachedResults.length > 0) {
          cached.hits++;
          return {
            content: cachedResults.join("\n\n---\n\n"),
            itemsCount: cachedResults.length,
            selfHealed: false,
            usedCachedSelector: true,
            selector: cached.synthesizedSelector
          };
        }
      } catch (cachedErr) {
        logger.warn(`Cached selector failed, falling back to full healing cascade: ${cachedErr.message}`);
      }
    }

    // Fast Path 2: Standard Semantic Selectors
    const candidateSelectors = targetSelector
      ? [targetSelector, "article", "[class*='card']", "[class*='item']", "[class*='row']", "table tbody tr", ".content"]
      : ["article", "[class*='card']", "[class*='item']", "[class*='row']", "table tbody tr", "main", ".content"];

    for (const sel of candidateSelectors) {
      try {
        const found = await page.evaluate((s) => {
          const els = Array.from(document.querySelectorAll(s));
          if (!els.length) return null;
          const text = els.map(e => e.innerText.trim()).filter(t => t.length > 20);
          return text.length >= 2 ? text : null;
        }, sel);

        if (found && found.length > 0) {
          logger.info(`✅ [Fast Path Match] Extracted ${found.length} items using standard selector: "${sel}"`);
          return {
            content: found.join("\n\n---\n\n"),
            itemsCount: found.length,
            selfHealed: false,
            selector: sel
          };
        }
      } catch {}
    }

    // ═══════════════════════════════════════════════════════════════
    // EMERGENCY FALLBACK: MULTIMODAL VISUAL LAYOUT GROUNDING
    // ═══════════════════════════════════════════════════════════════
    logger.warn(`⚠️ [DOM Breakage Detected] Standard selectors failed for ${url}. Triggering Multimodal Visual Grounding...`);
    if (onProgress) {
      await onProgress(`DOM mutation detected on ${new URL(url).hostname}. Initiating Visual Layout Self-Healing...`);
    }

    // 1. Inspect computed visual bounding boxes in live page viewport
    const visualBlocks = await page.evaluate(() => {
      const candidates = [];
      const all = Array.from(document.querySelectorAll('div, section, article, li, tr'));

      for (const el of all) {
        const rect = el.getBoundingClientRect();
        // Discard non-visible or improperly sized blocks
        if (rect.width >= 160 && rect.height >= 35 && rect.height <= 900) {
          const style = window.getComputedStyle(el);
          if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
            const text = el.innerText.trim();
            if (text.length >= 25 && text.length <= 1500) {
              // Construct a safe, clean CSS identifier
              let selectorTag = el.tagName.toLowerCase();
              if (el.className && typeof el.className === 'string') {
                const validClasses = el.className
                  .split(/\s+/)
                  .filter(c => c && !c.includes(':') && !c.includes('/') && c.length < 25)
                  .slice(0, 2);
                if (validClasses.length) selectorTag += '.' + validClasses.join('.');
              }

              candidates.push({
                selector: selectorTag,
                sampleText: text.slice(0, 300).replace(/\n+/g, " "),
                x: Math.round(rect.x),
                y: Math.round(rect.y),
                width: Math.round(rect.width),
                height: Math.round(rect.height)
              });
            }
          }
        }
      }
      return candidates.slice(0, 12);
    });

    if (!visualBlocks || visualBlocks.length === 0) {
      // Ultimate fallback: Extract plain cleaned body text
      const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 8000));
      return {
        content: bodyText,
        itemsCount: 1,
        selfHealed: true,
        healingMethod: "BODY_FALLBACK",
        selector: "body"
      };
    }

    // 2. Synthesize New Selector via LLM Grounding Judge
    try {
      const verdict = await retryWithRateLimit(() =>
        healingJudgeModel.invoke([
          {
            role: "system",
            content: `You are an elite Self-Healing Web Scraper Architect.
The target website changed its DOM structure and standard selectors failed.
Analyze the provided visual bounding boxes and text samples captured by Headless Chrome.
Identify which selector represents the recurring data container (card, entity row, table line).
Synthesize a resilient CSS selector that captures all items, and extract the text excerpts.`
          },
          {
            role: "user",
            content: `Target URL: ${url}

Detected Visual Bounding Rects & Text Signatures:
${JSON.stringify(visualBlocks, null, 2)}`
          }
        ])
      );

      // Cache the newly synthesized selector for future zero-latency runs
      if (verdict.synthesizedSelector) {
        this.setCachedSelector(url, {
          synthesizedSelector: verdict.synthesizedSelector,
          healingRationale: verdict.healingRationale
        });
      }

      logger.info(`✨ [Self-Healing Complete] Synthesized new selector "${verdict.synthesizedSelector}" with ${verdict.entityCount} entities.`);
      if (onProgress) {
        await onProgress(`Self-Healed via Visual Grounding: Synthesized selector "${verdict.synthesizedSelector}".`);
      }

      return {
        content: verdict.extractedItems.join("\n\n---\n\n"),
        itemsCount: verdict.entityCount,
        selfHealed: true,
        healingMethod: "VISUAL_LAYOUT_GROUNDING",
        synthesizedSelector: verdict.synthesizedSelector,
        healingRationale: verdict.healingRationale
      };

    } catch (err) {
      logger.warn(`Self-healing synthesis notice: ${err.message}`);
      // Fallback: extract concatenated visual block text
      const concatenated = visualBlocks.map(b => b.sampleText).join("\n\n---\n\n");
      return {
        content: concatenated,
        itemsCount: visualBlocks.length,
        selfHealed: true,
        healingMethod: "VISUAL_BLOCK_HEURISTIC",
        selector: visualBlocks[0]?.selector || "div"
      };
    }
  }

  /**
   * High-Level Headless Scraper with automatic browser lifecycle & Cheerio fallback
   */
  static async scrapeUrl(url, options = {}) {
    const { preferredSelector = null, timeout = 12000, onProgress = null } = options;
    let browser = null;

    try {
      logger.info(`🛡️ [VisionSelfHealer] Launching Headless Chrome for: ${url}`);
      browser = await puppeteer.launch({
        headless: "new",
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--disable-gpu"
        ]
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      );

      // Block heavy resources (images, fonts, media) to maximize speed
      await page.setRequestInterception(true);
      page.on("request", (req) => {
        const type = req.resourceType();
        if (type === "image" || type === "media" || type === "font") {
          req.abort();
        } else {
          req.continue();
        }
      });

      await page.goto(url, { waitUntil: "domcontentloaded", timeout });
      // Brief pause for client-side JS hydration
      await new Promise(r => setTimeout(r, 800));

      const result = await this.scrapePage(page, url, {
        targetSelector: preferredSelector,
        onProgress
      });

      return result;
    } catch (err) {
      logger.warn(`Puppeteer scrape error on ${url}: ${err.message}. Trying Cheerio fallback...`);
      // Fallback using lightweight webScraperTool
      try {
        const markdown = await webScraperTool.invoke({ url });
        return {
          content: typeof markdown === "string" ? markdown : "",
          itemsCount: 1,
          selfHealed: false,
          selector: "cheerio-fallback"
        };
      } catch (fallbackErr) {
        return {
          content: "",
          itemsCount: 0,
          selfHealed: false,
          error: err.message
        };
      }
    } finally {
      if (browser) {
        try {
          await browser.close();
        } catch {}
      }
    }
  }

  /**
   * Enriches sparse records using Deep DOM Scraping and Multimodal Visual Self-Healing
   */
  static async enrichEntityRecords(records = [], options = {}) {
    const { searchResults = [], blueprint = null, onProgress = null, maxPages = 2 } = options;
    if (!records || records.length === 0) return { enrichedRecords: records, healedCount: 0 };

    let healedCount = 0;
    const healedDomains = [];

    // 1. Identify records that have missing or unknown attributes
    const sparseRecords = records.filter(r => {
      const founderMissing = !r.founder || r.founder.toLowerCase().includes("n/a") || r.founder.toLowerCase().includes("unknown");
      const fundingMissing = !r.funding || r.funding.toLowerCase().includes("n/a") || r.funding.toLowerCase().includes("unknown");
      const roleMissing = !r.role || r.role.toLowerCase().includes("n/a");
      return founderMissing || fundingMissing || roleMissing;
    });

    // 2. Select up to maxPages authoritative target URLs from records or search results
    const candidateUrls = [];
    const seenHostnames = new Set();

    // From sparse records that have direct sourceUrl
    for (const rec of sparseRecords) {
      if (rec.sourceUrl && rec.sourceUrl.startsWith("http")) {
        try {
          const host = new URL(rec.sourceUrl).hostname;
          if (!seenHostnames.has(host) && !host.includes("google") && !host.includes("tavily")) {
            seenHostnames.add(host);
            candidateUrls.push({ url: rec.sourceUrl, entityName: rec.company || rec.name, host });
          }
        } catch {}
      }
      if (candidateUrls.length >= maxPages) break;
    }

    // If candidateUrls < maxPages, pick from top search results
    if (candidateUrls.length < maxPages && Array.isArray(searchResults)) {
      for (const res of searchResults) {
        if (res?.url && res.url.startsWith("http")) {
          try {
            const host = new URL(res.url).hostname;
            if (!seenHostnames.has(host) && !host.includes("google") && !host.includes("tavily")) {
              seenHostnames.add(host);
              candidateUrls.push({ url: res.url, entityName: res.title || host, host });
            }
          } catch {}
        }
        if (candidateUrls.length >= maxPages) break;
      }
    }

    if (candidateUrls.length === 0) {
      return { enrichedRecords: records, healedCount: 0 };
    }

    const enrichedRecords = [...records];

    for (let i = 0; i < candidateUrls.length; i++) {
      const target = candidateUrls[i];
      try {
        if (onProgress) {
          await onProgress(`Inspecting DOM layout on authority domain: ${target.host} (${i + 1}/${candidateUrls.length})...`);
        }

        const scrapeResult = await this.scrapeUrl(target.url, {
          onProgress
        });

        if (scrapeResult.selfHealed) {
          healedCount++;
          healedDomains.push(target.host);
          if (onProgress) {
            await onProgress(`Self-Healed: Repaired DOM mutation on ${target.host}. Synthesized selector "${scrapeResult.synthesizedSelector || 'adaptive-container'}"`, "success");
          }
        }

        // If we retrieved meaningful content, enrich matching records
        if (scrapeResult.content && scrapeResult.content.length > 80) {
          const contentSnippet = scrapeResult.content.slice(0, 5000);

          try {
            const targetEntities = enrichedRecords.slice(0, 10).map(r => r.company || r.name).filter(Boolean);
            const enrichmentPrompt = `Analyze the following webpage content and find any missing details (founders, funding, headcount, tech stack, email) for any of these entities: ${targetEntities.join(", ")}.
Return ONLY a JSON array of objects with keys: "company" (matching name), "founder", "funding", "headcount", "techStack", "email". If an attribute isn't found, leave it as null.

WEBPAGE CONTENT:
${contentSnippet}`;

            const enrichmentResponse = await retryWithRateLimit(() =>
              qwen27b.invoke([
                { role: "system", content: "You extract missing company/entity details from webpage text into structured JSON. Output JSON array only." },
                { role: "user", content: enrichmentPrompt }
              ])
            );

            let updates = [];
            try {
              const cleaned = enrichmentResponse.content.replace(/```json/gi, "").replace(/```/g, "").trim();
              const start = cleaned.indexOf("[");
              const end = cleaned.lastIndexOf("]");
              if (start !== -1 && end !== -1) {
                updates = JSON.parse(cleaned.substring(start, end + 1));
              }
            } catch {}

            if (Array.isArray(updates) && updates.length > 0) {
              let updatedCount = 0;
              for (const update of updates) {
                if (!update?.company) continue;
                const match = enrichedRecords.find(r => 
                  (r.company && r.company.toLowerCase().includes(update.company.toLowerCase())) ||
                  (r.name && r.name.toLowerCase().includes(update.company.toLowerCase()))
                );
                if (match) {
                  if (update.founder && (!match.founder || match.founder.includes("N/A"))) {
                    match.founder = update.founder;
                    updatedCount++;
                  }
                  if (update.funding && (!match.funding || match.funding.includes("N/A"))) {
                    match.funding = update.funding;
                    updatedCount++;
                  }
                  if (update.headcount && (!match.headcount || match.headcount.includes("N/A"))) {
                    match.headcount = update.headcount;
                  }
                  if (update.techStack && (!match.techStack || match.techStack.includes("N/A"))) {
                    match.techStack = update.techStack;
                  }
                  if (update.email && (!match.email || match.email.includes("N/A"))) {
                    match.email = update.email;
                  }
                }
              }
              if (updatedCount > 0 && onProgress) {
                await onProgress(`Enriched ${updatedCount} entity record(s) with deep DOM attributes from ${target.host}.`, "success");
              }
            }
          } catch (llmErr) {
            logger.warn(`Entity enrichment LLM notice: ${llmErr.message}`);
          }
        }
      } catch (scrapeErr) {
        logger.warn(`Deep scrape error on ${target.url}: ${scrapeErr.message}`);
      }
    }

    return { enrichedRecords, healedCount, healedDomains };
  }
}
