import OpenAI from "openai";
import { ChatMessage, LLMProvider, LLMResponse, ToolCall } from "./llm.types.js";
import { env } from "../../config/env.js";

const TOOLS = [
    {
        type:"function" as const,
        function : {
            name:"get_current_time",
            description:"Get the current server time",
            parameters:{
                type:"object",
                properties:{},
                required:[]
            },
        },
    },

    {
        type:"function" as const,
        function:{
            name:"list_dir",
            description:"List files and directories in a given path. Use './' for root.",
            parameters:{
                type:"object",
                properties:{
                    path:
                    {
                        type:"string",
                        description:"Path to list files from"
                    }
                },
                required:["path"]
            }
        }
    },

    {
        type:"function" as const,
        function: {
            name: "read_file",
            description: "Read the pure text content of a file.",
            parameters: {
                type: "object",
                properties: {
                    path: { type: "string", description: "The relative path to the file" }
                },
                required: ["path"],
            },
        },
    },
]

export class OpenRouterProvider implements LLMProvider {
    private client: OpenAI;

    constructor(){
        this.client = new OpenAI({
            baseURL:"https://openrouter.ai/api/v1",
            apiKey:env.openRouterApiKey,
        })
    }

    async sendMessage(messages:ChatMessage[]):Promise<LLMResponse>{
        try {
            const openAIMessages = [
                {
                    role: "system" as const,
                    content: "You are Termind, an advanced AI CLI assistant. You have access to the file system. Always summarize your findings. If a tool returns an error, explain it to the user. Do not return empty content."
                },
                ...messages.map(m => {
                    if (m.role === "tool") {
                        return {
                            role: "tool",
                            content: m.content || "",
                            tool_call_id: m.tool_call_id
                        };
                    }
                    if (m.role === "assistant" && m.toolCalls) {
                        return {
                            role: "assistant",
                            content: m.content || null,
                            tool_calls: m.toolCalls.map(tc => ({
                                id: tc.id,
                                type: "function",
                                function: {
                                    name: tc.name,
                                    arguments: JSON.stringify(tc.arguments)
                                }
                            }))
                        };
                    }

                    return {
                        role: m.role as any,
                        content: m.content
                    };
                }) as any[]
            ]
            const completion = await this.client.chat.completions.create({
                model:env.llmModel,
                messages:openAIMessages,
                tools:TOOLS,
                tool_choice:"auto",
            });
            const choice = completion.choices[0]?.message;
            if (!choice) throw new Error("No response from AI");
              const toolCalls: ToolCall[] = choice.tool_calls?.map((tc:any) => ({
                id: tc.id,
                name: tc.function.name,
                arguments: JSON.parse(tc.function.arguments)
            })) || [];
            return {
                content: choice.content,
                toolCalls: toolCalls.length > 0 ? toolCalls : undefined
            };
        } catch (error:any) {
            console.error("OpenRouter Error:", error);
            throw new Error(`AI Request Failed: ${error.message}`);
        }
    }
}

