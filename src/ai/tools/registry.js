import { webSearchTool } from "./webSearch.tool.js";
import { calculatorTool } from "./calculator.tool.js";
import { webScraperTool } from "./webScraper.tool.js";
import { currentTimeTool } from "./currentTime.tool.js";
import { wikipediaTool } from "./wikipedia.tool.js";
import { weatherTool } from "./weather.tool.js";
import { jsExecutionTool } from "./jsExecution.tool.js";
import { databaseAnalyticsTool } from "./databaseAnalytics.tool.js";
import { hackerNewsTool } from "./hackerNews.tool.js";
import { githubTool } from "./github.tool.js";
import { chartGeneratorTool } from "./chartGenerator.tool.js";
import { advancedBrowserTool } from "./advancedBrowser.tool.js";
import { emailDispatcherTool } from "./emailDispatcher.tool.js";
import { imageGeneratorTool } from "./imageGenerator.tool.js";
import { documentGeneratorTool } from "./documentGenerator.tool.js";
import { selfHealingScraperTool } from "./selfHealingScraper.tool.js";

export const TOOL_REGISTRY = {

    web_search_tool: webSearchTool,
    calculator_tool: calculatorTool,
    web_scraper_tool: webScraperTool,
    current_time_tool: currentTimeTool,
    wikipedia_tool: wikipediaTool,
    weather_tool: weatherTool,
    js_execution_tool: jsExecutionTool,
    database_analytics_tool: databaseAnalyticsTool,
    hacker_news_tool: hackerNewsTool,
    github_tool: githubTool,
    chart_generator_tool: chartGeneratorTool,
    advanced_browser_tool: advancedBrowserTool,
    email_dispatcher_tool: emailDispatcherTool,
    image_generator_tool: imageGeneratorTool,
    document_generator_tool: documentGeneratorTool,
    self_healing_scraper_tool: selfHealingScraperTool

};