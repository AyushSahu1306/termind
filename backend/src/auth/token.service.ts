import jwt from "jsonwebtoken"
import { env } from "../config/env.js"

const JWT_TTL_SECONDS = env.jwtTtlMinutes*60;

type AccessTokenPayload = {
    sub: string; //userId
    sid: string; //sessionId
}

export function issueAccessToken(payload:AccessTokenPayload){
    return jwt.sign(payload,env.jwtSecret,{
        expiresIn:JWT_TTL_SECONDS
    });
}

export function verifyAccessToken(token:string){
    try {
        return jwt.verify(token,env.jwtSecret) as AccessTokenPayload;
    } catch (error) {
        throw new Error("Invalid or expired access token");
    }
}