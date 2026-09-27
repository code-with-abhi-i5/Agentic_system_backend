import { tool } from "@langchain/core/tools";
import { z } from "zod";
import puppeteer from "puppeteer";
import { VisionSelfHealer } from "../services/visionSelfHealer.service.js";
import { logger } from "../../utils/logger.js";

export const advancedBrowserTool = tool(
    async (args) => {
        let browser = null;
        try {
            logger.info(`🌐 Launching Puppeteer Browser...`);
            
            browser = await puppeteer.launch({
                headless: "new",
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            const page = await browser.newPage();
            await page.setViewport({ width: 1280, height: 800 });

            // Set a common user agent to avoid bot-blocks
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

            let finalResult = "Actions executed successfully.";

            for (const action of args.actions) {
                logger.info(`🤖 Puppeteer Action: ${action.type}`);

                switch (action.type) {
                    case "goto":
                        await page.goto(action.target, { waitUntil: 'networkidle2' });
                        break;
                    case "click":
                        await page.click(action.target);
                        await new Promise(r => setTimeout(r, 1000)); // wait for transitions
                        break;
                    case "type":
                        await page.type(action.target, action.value, { delay: 50 });
                        break;
                    case "wait":
                        await page.waitForSelector(action.target, { timeout: 10000 });
                        break;
                    case "scrape":
                    case "self_heal_scrape": {
                        const currentUrl = page.url();
                        const healResult = await VisionSelfHealer.scrapePage(page, currentUrl, {
                            targetSelector: action.target
                        });
                        finalResult = typeof healResult === "object" ? JSON.stringify(healResult) : healResult;
                        break;
                    }
                    case "screenshot":
                        // In a real advanced setup, we would save this to AWS S3 and return the URL.
                        // For now, we just note it.
                        finalResult = "Screenshot captured (feature stubbed)";
                        break;
                    default:
                        logger.warn(`Unknown action type: ${action.type}`);
                }
            }

            return finalResult;

        } catch (error) {
            logger.error(`❌ Puppeteer Error: ${error.message}`);
            return `Browser execution failed: ${error.message}`;
        } finally {
            if (browser) {
                await browser.close();
                logger.info(`🌐 Browser Closed.`);
            }
        }
    },
    {
        name: "advanced_browser_tool",
        description: "Uses a headless Chrome browser to interact with dynamic web applications (SPAs). Can click buttons, type text, wait for elements, and scrape text with automatic visual layout self-healing when CSS breaks. Useful for sites that require interaction or JS rendering.",
        schema: z.object({
            actions: z.array(z.object({
                type: z.enum(["goto", "click", "type", "wait", "scrape", "screenshot", "self_heal_scrape"]).describe("The action to perform."),
                target: z.string().optional().describe("The URL for 'goto', or the CSS Selector for 'click', 'type', and 'wait'."),
                value: z.string().optional().describe("The text to type for the 'type' action.")
            })).describe("An ordered array of actions for the browser to perform sequentially.")
        })
    }
);
