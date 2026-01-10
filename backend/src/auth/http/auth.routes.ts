import { Router } from "express";
import { revokeSession, rotateRefreshToken } from "../session.service.js";
import { issueAccessToken } from "../token.service.js";
import { requireAuth } from "./auth.middleware.js";

export const authRouter = Router();

authRouter.post("/refresh",async(req,res)=>{
    const { sessionId, refreshToken } = req.body;

    if (!sessionId || !refreshToken) {
        return res.status(400).json({ error: "Missing sessionId or refreshToken" });
    }

    try {
        const rotated = await rotateRefreshToken({
            sessionId,
            refreshToken
        });

        const accessToken = issueAccessToken({
            sub:"unknown",
            sid:sessionId,
        });

        return res.json({
            accessToken,
            refreshToken: rotated.refreshToken,
            expiresAt: rotated.expiresAt,
        });

    } catch (error) {
        return res.status(401).json({ error: "Invalid refresh token" });
    }
});

authRouter.post("/logout",requireAuth,async(req,res)=>{

    if (!req.auth) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const {sessionId} = req.auth;

    await revokeSession({sessionId});

    return res.status(200).json({message:"Logout successfully"});
})

authRouter.get("/me", requireAuth, async (req, res) => {
  return res.json({
    auth: req.auth,
  });
});