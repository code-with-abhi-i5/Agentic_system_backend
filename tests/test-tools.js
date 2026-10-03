import mongoose from 'mongoose';
import { calculatorTool } from '../src/ai/tools/calculator.tool.js';
import { webScraperTool } from '../src/ai/tools/webScraper.tool.js';
import { currentTimeTool } from '../src/ai/tools/currentTime.tool.js';
import { wikipediaTool } from '../src/ai/tools/wikipedia.tool.js';
import { weatherTool } from '../src/ai/tools/weather.tool.js';
import { jsExecutionTool } from '../src/ai/tools/jsExecution.tool.js';
import { hackerNewsTool } from '../src/ai/tools/hackerNews.tool.js';
import { githubTool } from '../src/ai/tools/github.tool.js';
import { imageGeneratorTool } from '../src/ai/tools/imageGenerator.tool.js';
import { advancedBrowserTool } from '../src/ai/tools/advancedBrowser.tool.js';
import { documentGeneratorTool } from '../src/ai/tools/documentGenerator.tool.js';

async function runTests() {
    console.log("=== STARTING TIER 2 TOOL TESTS ===");

    console.log("\n1. Testing Calculator...");
    const calc = await calculatorTool.invoke({ expression: "100 / 3" });
    console.log(calc.substring(0, 100));

    console.log("\n2. Testing Web Scraper...");
    const scrape = await webScraperTool.invoke({ url: "https://example.com" });
    console.log(scrape.substring(0, 100) + "...");

    console.log("\n3. Testing Current Time...");
    const time = await currentTimeTool.invoke({});
    console.log(time);

    console.log("\n4. Testing Wikipedia...");
    const wiki = await wikipediaTool.invoke({ query: "Alan Turing" });
    console.log(wiki.substring(0, 100) + "...");

    console.log("\n5. Testing Weather...");
    const weather = await weatherTool.invoke({ location: "London" });
    console.log(weather);

    console.log("\n6. Testing JS Sandbox...");
    const js = await jsExecutionTool.invoke({ code: "const x = [3,1,2]; x.sort(); return x;" });
    console.log(js);

    console.log("\n8. Testing HackerNews...");
    const hn = await hackerNewsTool.invoke({ limit: 3 });
    // 9. GitHub API Tool
    console.log("9. Testing GitHub...");
    const gitRes = await githubTool.invoke({ owner: "facebook", repo: "react", action: "info" });
    console.log(gitRes, "\n");

    // 10. Image Generator Tool
    console.log("10. Testing Image Generator...");
    const imgRes = await imageGeneratorTool.invoke({ prompt: "A highly detailed cute robot typing on a computer, cyberpunk style" });
    console.log(imgRes, "\n");

    // 11. Advanced Browser Tool (Puppeteer)
    console.log("11. Testing Advanced Browser...");
    try {
        const browserRes = await advancedBrowserTool.invoke({
            actions: [
                { type: "goto", target: "https://example.com" },
                { type: "scrape" }
            ]
        });
        console.log(browserRes, "\n");
    } catch (e) {
        console.log("Browser failed (expected if blocked by Windows policy)", e.message);
    }

    // 12. Document Generator Tool
    console.log("12. Testing Document Generator...");
    const docHtml = `
        <html>
            <body style="font-family: Arial; padding: 40px; text-align: center;">
                <h1 style="color: blue;">Hello from Meta-Architect!</h1>
                <p>This is a dynamically generated PDF uploaded to the ephemeral cloud.</p>
            </body>
        </html>
    `;
    const docRes = await documentGeneratorTool.invoke({ filename: "Test_Doc.pdf", htmlContent: docHtml });
    console.log(docRes, "\n");

    console.log("=== ALL TESTS COMPLETED ===");
    process.exit(0);
}

runTests();
