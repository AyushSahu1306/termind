import { loadAuthStore, saveAuthStore } from "./token-store.js";


export async function logout() : Promise<void> {
    const store = loadAuthStore();
    const accountId = store.activeAccountId;

    if(!accountId){
        console.log("You are not logged in. ");
        return;
    }

    const account = store.accounts[accountId];

    if(!account){
        console.warn("Active acccount not found. Cleaning up local state.");
    }
    else {
        try {
            await fetch("http://localhost:3000/auth/logout",{
                method:"POST",
                headers: {
                    Authorization: `Bearer ${account.accessToken}`
                }
            })
        } catch (error) {
            console.warn("Warning: failed to revoke session on server.");
        }
    }

    delete store.accounts[accountId];
    store.activeAccountId = null;

    saveAuthStore(store);

    console.log("Logged Out successfully");
}