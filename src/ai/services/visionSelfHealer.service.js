import { qwen27b } from "../models/qwen27b.js";
import { retryWithRateLimit } from "../../utils/retryWithRateLimit.js";
import { logger } from "../../utils/logger.js";
import { z } from "zod";

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
   * Executes primary scraping with automatic visual layout self-healing fallback
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
}
