import { Router } from "express";
import { requireAuth } from "../auth/http/auth.middleware.js";

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

    const lastMessage = messages[messages.length-1];

    const reply = `[Mock Backend] You said : ${lastMessage.content}`;

    res.status(200).json({ reply });
})
