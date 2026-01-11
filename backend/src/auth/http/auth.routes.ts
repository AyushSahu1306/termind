import { Router } from "express";
import { createSessions, revokeSession, rotateRefreshToken } from "../session.service.js";
import { issueAccessToken } from "../token.service.js";
import { requireAuth } from "./auth.middleware.js";
import { prisma } from "../../config/prisma.js";
import { exchangeCodeForToken, fetchGitHubUser } from "../github.service.js";
import { env } from "../../config/env.js";

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

authRouter.post("/cli/login-request",async(_req,res)=>{
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const loginRequest = await prisma.loginRequest.create({
        data:{
            expiresAt
        }
    });

    const githubAuthUrl = `http://localhost:3000/auth/github?state=${loginRequest.id}`;

    return res.json({
        loginRequestId: loginRequest.id,
        expiresAt,
        githubAuthUrl,
  });
})

authRouter.get("/cli/login-status",async(req,res)=>{
    const loginRequestId = req.query.id as string;

    if(!loginRequestId){
        return res.status(400).json({error:"Missing login reuqest id"});
    }

    const loginRequest = await prisma.loginRequest.findUnique({
        where: { id: loginRequestId },
        include: {
            session: true,
        },
    });

    if(!loginRequest){
        return res.status(404).json({error:"Login Request not found"});
    }

    if(loginRequest.expiresAt < new Date()){
        return res.status(410).json({status:"expired"});
    }

    if(!loginRequest.sessionId){
        return res.json({ status: "pending" });
    }

    const accessToken = issueAccessToken({
        sub:loginRequest.session!.userId,
        sid: loginRequest.sessionId,
    });

    return res.json({
        status: "completed",
        accessToken,
        sessionId: loginRequest.sessionId,
  });
})

authRouter.get("/github", (req, res) => {
  const state = req.query.state as string;

  if (!state) {
    return res.status(400).send("Missing state");
  }

  const url =
    "https://github.com/login/oauth/authorize" +
    `?client_id=${env.githubClientId}` +
    `&redirect_uri=${env.githubCallbackUrl}` +
    `&state=${state}`;

  res.redirect(url);
});

authRouter.get("/github/callback",async(req,res)=>{
    const {code,state} = req.query as {
        code?:string,
        state?:string
    };

    if (!code || !state) {
        return res.status(400).send("Invalid OAuth callback");
    }

    const loginRequest = await prisma.loginRequest.findUnique({
        where: { id: state },
    });

    if (!loginRequest) {
        return res.status(400).send("Invalid login request");
    }

    if (loginRequest.expiresAt < new Date()) {
        return res.status(400).send("Login request expired");
    }

    if (loginRequest.completedAt) {
        return res.status(400).send("Login request already completed");
    }

    const githubAccessToken = await exchangeCodeForToken(code);

    const githubUser = await fetchGitHubUser(githubAccessToken);

    const user = await prisma.user.upsert({
        where: { githubId: githubUser.id.toString() },
        update: {
            username: githubUser.login,
            email: githubUser.email,
        },
        create: {
            githubId: githubUser.id.toString(),
            username: githubUser.login,
            email: githubUser.email,
        },
    });

    const session = await createSessions({
        userId: user.id,
        userAgent: "cli",
    });

    await prisma.loginRequest.update({
        where: { id: state },
        data: {
            sessionId: session.sessionId,
            completedAt: new Date(),
        },
    });

    return res.status(200).json({message:"Login successful. You can return to the terminal."})
})


