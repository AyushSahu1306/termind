import OpenAI from "openai";
import { ChatMessage, LLMProvider } from "./llm.types.js";
import { env } from "../../config/env.js";

export class OpenRouterProvider implements LLMProvider {
    private client: OpenAI;

    constructor(){
        this.client = new OpenAI({
            baseURL:"https://openrouter.ai/api/v1",
            apiKey:env.openRouterApiKey,
        })
    }

    async sendMessage(messages:ChatMessage[]):Promise<string>{
        try {
            const completion = await this.client.chat.completions.create({
                model:env.llmModel,
                messages:messages
            });
            return completion.choices[0]?.message?.content || "(No response)";
        } catch (error:any) {
            console.error("OpenRouter Error:", error);
            throw new Error(`AI Request Failed: ${error.message}`);
        }
    }
}

