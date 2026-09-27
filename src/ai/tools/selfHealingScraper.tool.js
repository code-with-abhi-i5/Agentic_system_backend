import { tool } from "@langchain/core/tools";
import { z } from "zod";
import puppeteer from "puppeteer";
import { VisionSelfHealer } from "../services/visionSelfHealer.service.js";
import { logger } from "../../utils/logger.js";

/**
 * Self-Healing Web Scraper Tool
 * Uses Puppeteer and Multimodal Visual Layout Grounding to extract structured data
 * even when websites redesign or obfuscate CSS classes.
 */
export const selfHealingScraperTool = tool(
  async (args) => {
    let browser = null;
    try {
      logger.info(`🛡️ [Self-Healing Scraper Tool] Launching Headless Chrome for: ${args.url}`);

      browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 850 });
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36"
      );

      // Block unnecessary images/fonts to maximize speed
      await page.setRequestInterception(true);
      page.on("request", (req) => {
        const resourceType = req.resourceType();
        if (resourceType === "media" || resourceType === "font") {
          req.abort();
        } else {
          req.continue();
        }
      });

      await page.goto(args.url, { waitUntil: "domcontentloaded", timeout: 20000 });

      // Wait 1.2s for dynamic client-side JS rendering
      await new Promise(r => setTimeout(r, 1200));

      const result = await VisionSelfHealer.scrapePage(page, args.url, {
        targetSelector: args.preferredSelector || null
      });

      return JSON.stringify(result);

    } catch (err) {
      logger.error(`❌ [Self-Healing Scraper Error]: ${err.message}`);
      return JSON.stringify({
        content: `Scrape error: ${err.message}`,
        selfHealed: false,
        itemsCount: 0
      });
    } finally {
      if (browser) {
        await browser.close();
      }
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
