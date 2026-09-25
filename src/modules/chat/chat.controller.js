import { generateResponse } from "./chat.service.js";
import { createConversationIfNeeded } from "../conversation/conversation.service.js";
import { saveMessage } from "../message/message.service.js";
import { generateConversationTitle } from "../conversation/title.service.js";

export const sendMessage = async (req, res) => {
    const { message, conversationId } = req.body;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
        const { conversation, isNew } = await createConversationIfNeeded(
            conversationId,
            req.user.userId,
            message
        );

        const actualConversationId = conversation._id;

        await saveMessage({
            conversationId: actualConversationId,
            role: "user",
            content: message,
        });

        let assistantResponse = "";

        const response = await generateResponse(
            message,
            req.user.userId,
            actualConversationId
        );

        // NEW: We are iterating over an async event stream (v2 streamEvents)
        let activeNode = null;
        let validAgentIds = new Set();

        for await (const event of response) {

            // Track active graph node to filter out internal orchestration tokens
            if (event.event === "on_chain_start") {
                if (
                    event.name === "intentAnalyzer" ||
                    event.name === "metaArchitect" ||
                    event.name === "agentSpecificationGenerator" ||
                    event.name === "runtimeExecution" ||
                    event.name === "dataExtractor" ||
                    event.name === "dataDeduplicator" ||
                    event.name === "responseGenerator"
                ) {
                    activeNode = event.name;
                    const formattedNodeName = activeNode
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/_/g, ' ')
                        .replace(/^./, str => str.toUpperCase())
                        .trim();
                    res.write(
                        `data: ${JSON.stringify({
                            type: "status",
                            status: `Processing ${formattedNodeName}...`,
                        })}\n\n`
                    );
                } else if (validAgentIds.has(event.name)) {
                    // Only switch activeNode if it's a known agent from the specifications
                    activeNode = event.name;
                    const formattedNodeName = activeNode
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/_/g, ' ')
                        .replace(/^./, str => str.toUpperCase())
                        .trim();
                    res.write(
                        `data: ${JSON.stringify({
                            type: "status",
                            status: `Agent Name: "${formattedNodeName}"`,
                        })}\n\n`
                    );
                }
            }

            // 1. Handle actual token generation ONLY for the final Markdown Response Generator
            const coreNodes = ["intentAnalyzer", "metaArchitect", "agentSpecificationGenerator", "runtimeExecution", "responseGenerator"];
            
            if (event.event === "on_chat_model_stream") {
                if (activeNode === "responseGenerator") {
                    const chunk = event.data?.chunk?.content;

                    if (chunk) {
                        assistantResponse += chunk;
                        res.write(
                            `data: ${JSON.stringify({
                                type: "content", // Flag as content
                                role: "assistant",
                                content: chunk,
                            })}\n\n`
                        );
                    }
                }
            }

            // 2. NEW: Intercept agent specifications and emit them
            if (event.event === "on_chain_end" && event.name === "agentSpecificationGenerator") {
                const specifications = event.data?.output?.specifications || event.data?.output?.agentSpecificationGenerator?.specifications;
                if (specifications && Array.isArray(specifications)) {
                    specifications.forEach(spec => {
                        if (spec.taskId) validAgentIds.add(spec.taskId);
                    });
                    res.write(
                        `data: ${JSON.stringify({
                            type: "agents",
                            agents: specifications
                        })}\n\n`
                    );
                }
            }
        }

        await saveMessage({
            conversationId: actualConversationId,
            role: "assistant",
            content: assistantResponse,
        });

        if (isNew) {
            try {
                // FIX 1: Map the variables to the correct keys expected by the service
                const title = await generateConversationTitle({
                    conversationId: actualConversationId,
                    userMessage: message,
                });

                if (title) {

                    res.write(
                        `data: ${JSON.stringify({
                            conversation: {
                                _id: conversation._id,
                                title,
                                createdAt: conversation.createdAt,
                            },
                        })}\n\n`
                    );
                }
            }
            catch (error) {
                // FIX 2: Change 'err' to 'error'
                console.error("Title generation failed", error);
            }
        }

        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();

    } catch (error) {
        console.error(error);
        res.write(
            `data: ${JSON.stringify({
                role: "assistant",
                error: error.message,
            })}\n\n`
        );
        res.end();
    }
};