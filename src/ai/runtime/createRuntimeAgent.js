import { MODEL_REGISTRY } from "../models/registry.js";
import { resolveInputs } from "./inputResolver.js";
import { createAgentPrompt } from "./createAgentPrompt.js";
import { mergeOutputs } from "./outputMerger.js";
import { parseRuntimeOutput } from "./parseRuntimeOutput.js";
import { ToolMessage } from "@langchain/core/messages";
import { processToolResult } from "./processToolResult.js";
import { retryWithRateLimit } from "../../utils/retryWithRateLimit.js";
import { extractHallucinatedJsonTool } from "../../utils/extractHallucinatedJsonTool.js";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { logger } from "../../utils/logger.js";

export const createRuntimeAgent = ({
    task,
    specification,
    tools
}) => {

    return async (state, config) => {
        logger.info("====================================");
        logger.info(`🤖 ${task.name}`);
        logger.info("====================================");

        // ---------------------------------
        // Resolve Inputs
        // ---------------------------------
        const inputs = resolveInputs({
            task,
            state
        });

        // ---------------------------------
        // Build Prompt
        // ---------------------------------
        const messages = createAgentPrompt({
            task,
            specification,
            inputs
        });

        const submitFinalAnswerSchema = z.object(
            Object.fromEntries(
                task.expectedOutput.map(key => [key, z.any().describe(`The final generated data for ${key}`)])
            )
        );

        const submitFinalAnswerTool = tool(
            async (args) => {
                return "Final answer submitted.";
            },
            {
                name: "submit_final_answer",
                description: "MUST be called to submit your final answer once you have completed all tasks.",
                schema: submitFinalAnswerSchema
            }
        );

        const agentTools = [...tools, submitFinalAnswerTool];

        const toolMap = new Map(
            agentTools.map(t => [t.name, t])
        );

        // ---------------------------------
        // Resolve Model
        // ---------------------------------
        const model = MODEL_REGISTRY[specification.model];

        if (!model) {
            throw new Error(`Unknown model "${specification.model}".`);
        }

        // ---------------------------------
        // Invoke LLM Configuration
        // ---------------------------------
        let llm;

        let llmTools;

        if (
            specification.toolStrategy === "NONE"
        ) {
            llmTools = [submitFinalAnswerTool];
        } else {
            llmTools = agentTools;
        }

        llm = model.bindTools(llmTools);

        let conversation = [...messages];
        let toolCalls = 0;
        const toolCache = new Map();

        let iteration = 1;
        const maxIterations = specification?.maxIterations || 6;
        let parseFailures = 0;
        const MAX_PARSE_FAILURES = 3;

        while (iteration <= maxIterations) {
            logger.info(`  [Iteration ${iteration}/${maxIterations}] 🧠 Invoking LLM... (Context length: ${conversation.length} messages)`);
            let response
            try {

                response = await retryWithRateLimit(() =>
                    llm.invoke(conversation, config),
                    config
                );

            }
            catch (error) {

                const recovered = extractHallucinatedJsonTool(error);

                if (!recovered) {
                    throw error;
                }

                logger.warn("⚠️ Recovered hallucinated JSON tool.");

                response = JSON.stringify(recovered)
            }

            conversation.push(response);

            // ---------------------------------
            // EXIT CONDITION: No valid tools requested
            // ---------------------------------
            if (!response.tool_calls?.length) {
                logger.info(`  [Iteration ${iteration}] 🏁 LLM finished thinking. Parsing final output...`);

                try {
                    const output = parseRuntimeOutput({
                        task,
                        response
                    });

                    return mergeOutputs({
                        task,
                        state,
                        output
                    });
                } catch (error) {
                    parseFailures++;
                    if (parseFailures >= MAX_PARSE_FAILURES) {
                        logger.error(`❌ Max parse failures reached. Task "${task.id}" failed permanently.`);
                        throw error;
                    }

                    logger.warn(`  [Iteration ${iteration}] ⚠️ Failed to parse output: ${error.message}. Asking LLM to correct...`);
                    
                    conversation.push({
                        role: "user",
                        content: `CRITICAL ERROR: Your last response was invalid. You must output ONLY valid JSON matching the exact schema. Do not include markdown formatting like \`\`\`json. Error details: ${error.message}`
                    });

                    iteration++;
                    continue;
                }
            }

            // ---------------------------------
            // TOOL EXECUTION
            // ---------------------------------
            for (const toolCall of response.tool_calls) {
                logger.info(`    -> 🔍 Executing: ${toolCall.name}`);

                // --- SUBMIT FINAL ANSWER HANDLER ---
                if (toolCall.name === "submit_final_answer") {
                    logger.info(`    -> 🏁 LLM submitted final answer via tool. Resolving task...`);
                    return mergeOutputs({
                        task,
                        state,
                        output: toolCall.args
                    });
                }
                const cacheKey = `${toolCall.name}:${JSON.stringify(toolCall.args)}`;

                // ---------------------------------
                // Duplicate Tool Detection
                // ---------------------------------
                if (toolCache.has(cacheKey)) {
                    logger.info("    -> ♻️ Using cached tool result.");
                    conversation.push(toolCache.get(cacheKey));
                    continue;
                }

                const tool = toolMap.get(toolCall.name);

                if (!tool) {
                    throw new Error(`Unknown tool "${toolCall.name}".`);
                }

                const rawToolMessage = await tool.invoke(toolCall);

                const toolMessage = processToolResult({
                    toolCall,
                    toolMessage: rawToolMessage
                });

                toolCache.set(cacheKey, toolMessage);
                toolCalls++;

                const dataLength = typeof toolMessage.content === "string"
                    ? toolMessage.content.length
                    : JSON.stringify(toolMessage.content).length;

                logger.info(`    -> ✅ Tool retrieved ${dataLength} characters of data.`);

                conversation.push(toolMessage);
            }

            iteration++;
        }

        // Fallback finalization if maxIterations is reached without explicit return
        logger.warn(`  ⚠️ Task "${task.id}" reached maximum iterations (${maxIterations}). Finalizing output...`);
        const lastResponse = conversation[conversation.length - 1];
        try {
            const output = parseRuntimeOutput({
                task,
                response: lastResponse
            });
            return mergeOutputs({
                task,
                state,
                output
            });
        } catch (err) {
            logger.warn(`  Fallback parsing after max iterations: ${err.message}`);
            const fallbackOutput = Object.fromEntries(
                task.expectedOutput.map(k => [k, []])
            );
            return mergeOutputs({
                task,
                state,
                output: fallbackOutput
            });
        }
    };
};