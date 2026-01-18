import { Router } from "express";
import { requireAuth } from "../auth/http/auth.middleware.js";
import { createLLMProvider } from "./llm/llm.factory.js";

export const chatRouter = Router();

chatRouter.post("/", requireAuth, async (req, res) => {
    const { messages } = req.body;

    if(!Array.isArray(messages)){
        return res.status(400).json({error:"messages must be an array"});
    }

    const isValid = messages.every((m)=> m && typeof m === "object" && (m.role === "user" || m.role === "assistant") && typeof m.content === "string"
    )

    if(!isValid){
        return res.status(400).json({error:"Invalid message format"});
    }

   try {
        const llm = createLLMProvider();
        const reply = await llm.sendMessage(messages);
        res.status(200).json({reply});
   } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({error:"Failed to generate response"});
   }
})
