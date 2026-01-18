import { env } from "../../config/env.js";
import { OpenRouterProvider } from "./openrouter.provider.js";
import type { LLMProvider } from "./llm.types.js";

export function createLLMProvider(): LLMProvider {
  console.log(`[LLM Factory] Initializing OpenRouter with model: ${env.llmModel}`);
  return new OpenRouterProvider();
}