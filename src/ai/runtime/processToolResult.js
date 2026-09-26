import { ToolMessage } from "@langchain/core/messages";

export const processToolResult = ({
    toolCall,
    toolMessage
}) => {

    switch (toolCall.name) {

        case "web_search_tool":
            return processWebSearchResult({
                toolCall,
                toolMessage
            });

        default:
            return toolMessage;

    }

};

const processWebSearchResult = ({
    toolCall,
    toolMessage
}) => {

    let parsed;

    try {

        parsed = JSON.parse(toolMessage.content);

    }

    catch {

        // If parsing fails, don't interrupt execution.
        return toolMessage;

    }

    if (parsed.error) {
        return new ToolMessage({
            tool_call_id: toolCall.id,
            name: toolMessage.name,
            content: `Search error: ${parsed.error}. Proceed to provide your final answer using internal knowledge without retrying this search tool.`
        });
    }

    const compact = {

        answer: parsed.answer ?? "",

        sources: Array.isArray(parsed.results)
            ? parsed.results
                .slice(0, 30)
                .map(result => ({
                    title: result.title,
                    url: result.url,
                    content: result.content
                        ? (result.content.length > 400 ? result.content.slice(0, 400) + "..." : result.content)
                        : ""
                }))
            : []

    };

    return new ToolMessage({

        tool_call_id: toolCall.id,

        name: toolMessage.name,

        content: JSON.stringify(compact)

    });

};