import { ChatGroq } from "@langchain/groq";
import { env } from "../../config/env.js";

export const qwen27b = new ChatGroq({
    model: "qwen/qwen3.8-27b",
    temperature: 0,
    maxTokens: 4096,
    apiKey: env.GROQ_API_KEY
});