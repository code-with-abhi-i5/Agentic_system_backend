export const TOOL_CATALOG = [
    {
        name: "web_search_tool",
        description:
            "Executes live web searches to retrieve current information."
    },
    {
        name: "calculator_tool",
        description: "Evaluates mathematical expressions deterministically. Use this tool whenever you need to perform math, as LLMs can hallucinate arithmetic."
    },
    {
        name: "web_scraper_tool",
        description: "Fetches a webpage from a URL and returns its textual content as Markdown. Useful for deep reading of articles, documentation, or websites."
    },
    {
        name: "current_time_tool",
        description: "Returns the current exact time and date. Useful when asked about 'today', 'now', or temporal queries."
    },
    {
        name: "wikipedia_tool",
        description: "Searches Wikipedia for factual summaries of topics, people, or events. Extremely reliable for encyclopedic knowledge."
    },
    {
        name: "weather_tool",
        description: "Fetches current weather conditions (temperature, condition, wind) for any city or location."
    },
    {
        name: "js_execution_tool",
        description: "Executes isolated JavaScript code in a secure Node.js VM sandbox. Perfect for complex data filtering, sorting, or string manipulation that LLMs struggle with. MUST return a value or use console.log."
    },
    {
        name: "database_analytics_tool",
        description: "Executes read-only analytical queries against the local application MongoDB database to get statistics about conversations."
    },
    {
        name: "hacker_news_tool",
        description: "Fetches the top technology and startup stories currently trending on HackerNews."
    },
    {
        name: "github_tool",
        description: "Fetches information, README files, or recent commits from public GitHub repositories."
    },
    {
        name: "chart_generator_tool",
        description: "Generates a beautiful data visualization chart (bar, line, pie, etc.) and returns a Markdown image link that renders in the UI."
    },
    {
        name: "advanced_browser_tool",
        description: "Uses a headless Chrome browser to interact with dynamic web applications (SPAs). Can click buttons, type text, wait for elements, and scrape text. Useful for sites that require interaction or JS rendering."
    },
    {
        name: "email_dispatcher_tool",
        description: "Sends a real email to the specified recipient using the backend's SMTP configuration. Use this when the user asks you to email someone or send a notification."
    },
    {
        name: "image_generator_tool",
        description: "Generates high-quality AI images based on a descriptive text prompt. It returns a Markdown image link that will natively render in the chat UI."
    },
    {
        name: "document_generator_tool",
        description: "Generates a highly-styled PDF document (like a Resume, Invoice, or Report) from raw HTML/CSS and returns a secure, temporary download link. Always write beautiful HTML/CSS for the document."
    },
    {
        name: "self_healing_scraper_tool",
        description: "High-reliability web scraper equipped with Multimodal Visual Layout Grounding. Automatically recovers and self-heals when website CSS selectors or DOM structures break. Perfect for SPAs and redesign-prone websites."
    }
];

export const AVAILABLE_TOOL_NAMES =
    TOOL_CATALOG.map(tool => tool.name);