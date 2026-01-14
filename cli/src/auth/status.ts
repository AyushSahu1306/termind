import { loadAuthStore } from "./token-store.js";

export function status() : void {
    const store = loadAuthStore();

    const hasActiveAccount = Boolean(store.activeAccountId);
    const hasPendingLogin = Boolean(store.pendingLoginRequestId);
    const accountIds = Object.keys(store.accounts);

    if(!hasActiveAccount && !hasPendingLogin){
        console.log("Status: Logged out");
        console.log("No active account\n");
        console.log("Next step:");
        console.log("  Run `termind login` to authenticate");
        return;
    }

    if (!hasActiveAccount && hasPendingLogin) {
        console.log("Status: Login in progress");
        console.log("A login request is pending\n");
        console.log("Next step:");
        console.log("  Complete login in your browser");
        console.log("  Then run `termind login --wait`");
        return;
    }

    console.log("Status: Logged in");

    console.log(`Active account: ${store.activeAccountId}`);

    console.log(`Accounts on this machine : ${accountIds.length}`);

    if(accountIds.length > 1){
        console.log("\nAvailable accounts: ");
        for(const id of accountIds) {
            const marker = id === store.activeAccountId ? " (active) ":"";
            console.log(`- ${id}${marker}`);
        }
    }

    console.log("\nYou are ready to use termind");

}