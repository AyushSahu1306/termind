import { Router } from "express";
import { requireAuth } from "../auth/http/auth.middleware.js";

export const chatRouter = Router();

chatRouter.post("/",requireAuth,async(req,res)=>{
    const {message} = req.body;

    if(!message || typeof message !== "string"){
        return res.status(400).json({error:"Invalid message"});
    }

    const reply = `You said ${message}`;

    res.status(200).json({reply});
})
