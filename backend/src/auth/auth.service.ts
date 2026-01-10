import { validateSession } from "./session.service.js";
import { verifyAccessToken } from "./token.service.js";

export async function authenticateAccessToken(accessToken:string){
    const payload = verifyAccessToken(accessToken);

    const session = await validateSession({sessionId:payload.sid});

    return {
        userId:payload.sub,
        sessionId:session.id
    }
}