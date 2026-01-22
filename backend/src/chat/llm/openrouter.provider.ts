import OpenAI from "openai";
import { ChatMessage, LLMProvider, LLMResponse, ToolCall } from "./llm.types.js";
import { env } from "../../config/env.js";

const SYSTEM_PROMPT = `
You are Termind, a highly capable AI Assistant running in a CLI.
You are helpful, intelligent, and versatile.

CORE BEHAVIORS:
1.  **General Chat**: You can answer questions, brainstorm ideas, and engage in casual conversation. You are not limited to coding.
2.  **Coding Expert**: When asked to write code or modify files, you act as a Senior Software Engineer.
    - Use 'list_dir' and 'read_file' to understand context.
    - Use 'write_file' to create/edit files.
    - CRITICAL: Always provide COMPLETE file content when writing. No placeholders.

STYLE GUIDE:
- **Concise**: Output should be readable in a terminal. detailed when explaining concepts, brief when confirming actions.
- **Friendly**: Be helpful and encouraging.
- **Transparent**: If you take an action (file system), explain what you are doing.

Your current working directory is provided in the context.
`.trim();


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

    {
        type: "function" as const,
        function: {
            name: "write_file",
            description: "Create or overwrite a file with new content. Automatically creates directories if needed.",
            parameters: {
                type: "object",
                properties: {
                    path: { 
                        type: "string", 
                        description: "The relative path to the file (e.g. './src/components/Button.tsx')" 
                    },
                    content: { 
                        type: "string", 
                        description: "The full content to write to the file." 
                    }
                },
                required: ["path", "content"],
            },
        },
    },

    {
        type: "function" as const,
        function: {
            name: "delete_file",
            description: "Delete a file permanently. Use with caution.",
            parameters: {
                type: "object",
                properties: {
                    path: { 
                        type: "string", 
                        description: "The relative path to the file to delete" 
                    }
                },
                required: ["path"],
            },
        },
    },

    {
        type: "function" as const,
        function: {
            name: "delete_folder",
            description: "Delete a FOLDER and all its contents. EXTREMELY DANGEROUS.",
            parameters: {
                type: "object",
                properties: {
                    path: { 
                        type: "string", 
                        description: "The relative path to the folder to delete" 
                    }
                },
                required: ["path"],
            },
        },
    },

        {
        type: "function" as const,
        function: {
            name: "run_command",
            description: "Execute a shell command. Use this for git, npm, or complex file operations. Chain commands with && if needed.",
            parameters: {
                type: "object",
                properties: {
                    command: { 
                        type: "string", 
                        description: "The command to run (e.g. 'npm install', 'git status', 'cd client && npm test')" 
                    }
                },
                required: ["command"],
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
                    content: SYSTEM_PROMPT
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
                        const toolCalls: ToolCall[] = choice.tool_calls?.reduce((acc: ToolCall[], tc: any) => {
                try {
                    const args = JSON.parse(tc.function.arguments);
                    acc.push({
                        id: tc.id,
                        name: tc.function.name,
                        arguments: args
                    });
                } catch (e) {
                    console.warn(`Failed to parse arguments for tool ${tc.function.name}. skipping.`);
                }
                return acc;
            }, []) || [];
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

