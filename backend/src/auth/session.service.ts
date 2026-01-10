import { prisma } from "../config/prisma.js";
import crypto from "crypto";

export const createSessions = async(params:{
    userId:string,
    userAgent?:string;
}) => {
    const {userId,userAgent} = params;

    const SESSION_TTL_DAYS = 30;

    const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS*24*60*60*1000);

    const session = await prisma.session.create({
        data:{
            userId,
            userAgent,
            expiresAt,
        }
    });

    const refreshTokenPlain = crypto.randomBytes(32).toString("hex");

    const resfreshTokenHash = crypto.createHash("sha256").update(refreshTokenPlain).digest("hex");

    await prisma.refreshToken.create({
        data:{
            sessionId:session.id,
            tokenHash:resfreshTokenHash,
            expiresAt,
        }
    })

    return {
        sessionId:session.id,
        refreshToken:refreshTokenPlain,
        expiresAt
    };
}

export const rotateRefreshToken = async(params:{
    sessionId:string,
    refreshToken:string
}) => {
    const { sessionId, refreshToken } = params;

    const existing = await prisma.refreshToken.findUnique({
        where:{sessionId}
    });

    if (!existing) {
        throw new Error("Refresh token not found");
    }

    if (existing.expiresAt < new Date()) {
        await revokeSession({ sessionId });
        throw new Error("Refresh token expired");
    }

    const presentedHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    if (presentedHash !== existing.tokenHash) {
        await revokeSession({ sessionId });
        throw new Error("Invalid refresh token");
    }

    const newRefreshToken = crypto.randomBytes(32).toString("hex");

    const newHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");

    const newExpiresAt = existing.expiresAt;

    await prisma.refreshToken.update({
        where:{sessionId},
        data:{
            tokenHash:newHash,
            createdAt:new Date(),
            expiresAt:newExpiresAt,
        }
    });

    return {
        refreshToken: newRefreshToken,
        expiresAt: newExpiresAt,
    };
}

export const revokeSession = async(params:{sessionId:string}) => {
    const { sessionId } = params;
    await prisma.session.update({
        where:{id:sessionId},
        data:{
           revokedAt:new Date() 
        }
    })
}

export async function validateSession(params: { sessionId: string }) {

    const { sessionId } = params;

    const session = await prisma.session.findUnique({
        where:{id:sessionId}
    });

    if (!session) {
        throw new Error("Session not found");
    }

    if (session.revokedAt) {
        throw new Error("Session revoked");
    }

    if (session.expiresAt < new Date()) {
        throw new Error("Session expired");
    }

    return session;

}