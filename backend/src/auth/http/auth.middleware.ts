import { NextFunction, Request,Response } from "express";
import { authenticateAccessToken } from "../auth.service.js";

export async function requireAuth(req:Request,res:Response,next:NextFunction){
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({erro:"Missing or Invalid Authorization header"});
    }

    const token = authHeader.split(" ")[1];

    try {
        const context = await authenticateAccessToken(token);

        req.auth = context;

        next();
    } catch (error) {
        return res.status(401).json({ error: "Unauthorized" });
    }
}