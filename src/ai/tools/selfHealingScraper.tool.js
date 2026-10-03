import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { VisionSelfHealer } from "../services/visionSelfHealer.service.js";
import { logger } from "../../utils/logger.js";

/**
 * Self-Healing Web Scraper Tool
 * Uses Puppeteer and Multimodal Visual Layout Grounding to extract structured data
 * even when websites redesign or obfuscate CSS classes.
 */
export const selfHealingScraperTool = tool(
  async (args) => {
    try {
      logger.info(`🛡️ [Self-Healing Scraper Tool] Invoking VisionSelfHealer for: ${args.url}`);
      const result = await VisionSelfHealer.scrapeUrl(args.url, {
        preferredSelector: args.preferredSelector || null
      });
      return JSON.stringify(result);
    } catch (err) {
      logger.error(`❌ [Self-Healing Scraper Error]: ${err.message}`);
      return JSON.stringify({
        content: `Scrape error: ${err.message}`,
        selfHealed: false,
        itemsCount: 0
      });
    }
  },
  {
    name: "self_healing_scraper_tool",
    description: "High-reliability web scraper equipped with Multimodal Visual Layout Grounding. Automatically recovers and self-heals when website CSS selectors or DOM structures break. Perfect for SPAs and redesign-prone websites.",
    schema: z.object({
      url: z.string().url().describe("The webpage URL to scrape."),
      preferredSelector: z.string().optional().describe("Optional CSS selector hint to attempt first.")
    })
  }
);
