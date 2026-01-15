import { loadAuthStore, saveAuthStore } from "./token-store.js";

export async function authenticatedFetch(
    input:RequestInfo,
    init:RequestInit={}
):Promise<Response> {

    const buildHeaders = () => {
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
        return headers;
    }
    


    let response = await fetch(input,{
        ...init,
        headers:buildHeaders()
    })


    if(response.status !== 401 && response.status !== 404){
        return response;
    }


    const refreshed = await attemptRefresh();

    
    
    if(refreshed){
        response = await fetch(input,{
            ...init,
            headers:buildHeaders(),
        });

        if(response.status!==401){
            return response;
        }
    }

    await logoutLocally();
    throw new Error("Authentication expired. Please log in again. ");
}


async function attemptRefresh(): Promise<boolean> {
    const store = loadAuthStore();
    const accountId = store.activeAccountId;
    if(!accountId) return false;

    const account = store.accounts[accountId];
    if(!account) return false;

    try {
        const res = await fetch("http://localhost:3000/auth/refresh",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({
                sessionId:account.sessionId,
                refreshToken:account.refreshToken,
                userId:account.userId
            })
        });


        if(!res.ok){
            return false;
        }

        const data = await res.json();
        store.accounts[accountId] = {
            ...account,
            accessToken:data.accessToken,
            refreshToken:data.refreshToken,
        };

        saveAuthStore(store);
        return true;
    } catch (error) {
        return false;
    }
}

async function logoutLocally() {
  const store = loadAuthStore();
  const accountId = store.activeAccountId;
  if (!accountId) return;

  delete store.accounts[accountId];
  store.activeAccountId = null;
  saveAuthStore(store);
}