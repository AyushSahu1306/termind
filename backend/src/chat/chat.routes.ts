import { Router } from "express";
import { requireAuth } from "../auth/http/auth.middleware.js";
import { createLLMProvider } from "./llm/llm.factory.js";
import { ChatMessage } from "./llm/llm.types.js";
import { toolRegistry } from "./tools/tool.registry.js";

export const chatRouter = Router();

chatRouter.post("/", requireAuth, async (req, res) => {
    const { messages,cwd } = req.body;

    if(!Array.isArray(messages)){
        return res.status(400).json({error:"messages must be an array"});
    }

    const isValid = messages.every((m)=> m && typeof m === "object" && (m.role === "user" || m.role === "assistant") && typeof m.content === "string"
    )

    if(!isValid){
        return res.status(400).json({error:"Invalid message format"});
    }

    const history = req.body.messages as ChatMessage[];


    try {
        const llm = createLLMProvider();
        let loops =0;
        const MAX_LOOPS = 5;


        while(loops < MAX_LOOPS){
            loops++;
            console.log(`--- Loop ${loops} ---`);

            const response = await llm.sendMessage(history);
            console.log("AI Response:", { content: response.content, toolCalls: response.toolCalls?.length });

            if(response.toolCalls && response.toolCalls.length > 0){
                console.log(`🛠️ Executing ${response.toolCalls.length} tools...`);
                history.push({
                    role: "assistant",
                    content: response.content || "",
                    toolCalls: response.toolCalls,
                });
                const results = await Promise.all(response.toolCalls.map(async (call) => {
                    const toolFunc = toolRegistry[call.name];
                    let result = "Error: Tool not found";

                    if (toolFunc) {
                        try {
                            console.log(`Running ${call.name} with`, call.arguments);
                            result = await toolFunc(call.arguments,{cwd});
                        } catch (err: any) {
                            result = `Error executing tool: ${err.message}`;
                        }
                    }
                    console.log(`Tool Result for ${call.name}:`, result);

                    return {
                        role: "tool" as const,
                        tool_call_id: call.id,
                        content: String(result)
                    };
                }));

                history.push(...results);
                continue;
            }
            const finalReply = response.content || "(Error: AI response was empty or incomplete. Try asking for smaller tasks.)";
            console.log("Loop finished. Returning:", finalReply);
            return res.status(200).json({ reply: finalReply });
        }

        // return res.status(500).json({ error: "Too many tool loops" });
        // Graceful exit: Ask LLM to summarize and pause
        console.log("Max loops reached. Asking for summary...");
        history.push({
            role: "system",
            content: "You have reached the maximum number of tool steps for one turn. Please stop now. Summarize what you have done so far and tell the user you are pausing to let them review. Ask if they want you to continue."
        });

        const summaryResponse = await llm.sendMessage(history);
        const finalReply = summaryResponse.content || "(Paused due to step limit. Type 'continue' to proceed.)";
        return res.status(200).json({ reply: finalReply });
    } catch (error: any) {
        console.error("Chat Error:", error);
        res.status(500).json({ error: "Failed to generate response" });
    }
});