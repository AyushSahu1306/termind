import { loadAuthStore } from "./token-store.js";

export async function authenticatedFetch(
    input:RequestInfo,
    init:RequestInit={}
):Promise<Response> {
    
    const store = loadAuthStore();

    const accountId = store.activeAccountId;
    if(!accountId){
        throw new Error("Not logged in");
    }

    const account = store.accounts[accountId];
    if(!account){
        throw new Error("Active account not found");
    }

    const headers = new Headers(init.headers);
    headers.set("Authorization",`Bearer ${account.accessToken}`);

    const response = await fetch(input,{
        ...init,
        headers
    })

    return response;

}