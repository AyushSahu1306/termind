import { loadAuthStore, saveAuthStore } from "./token-store.js";

export async function login(wait=false) : Promise<void> {
    const store = loadAuthStore();

    if(store.activeAccountId){
        console.log("You are already logged in.");
        console.log(`Active account: ${store.activeAccountId}`);
        console.log("Use `termind logout` to log out.");
        return;
    }

    if (store.pendingLoginRequestId && !wait) {
        console.log("A login is already in progress.");
        console.log("Run `termind login --wait` to complete it.");
        return;
    }

    if(!store.pendingLoginRequestId){

        const response = await fetch("http://localhost:3000/auth/cli/login-request",{
            method:"POST"
        });

        if(!response.ok){
            console.error("failed to initiate login. ");
            process.exit(1);
        }

        const data = await response.json();

        store.pendingLoginRequestId = data.loginRequestId;
        saveAuthStore(store);

        console.log("\nTo log in, open this URL in your browser:\n");
        console.log(data.githubAuthUrl);
        console.log("\nAfter completing login, return to the terminal.\n");

    }

    if(wait){
        console.log("Waiting for login to complete");
        await waitForLoginCompletion();
    }
}

async function waitForLoginCompletion() : Promise<void> {
    const POLL_INTERVAL_MS = 2000;
    while (true) {
        const store = loadAuthStore();
        const loginRequestId = store.pendingLoginRequestId;

        if(!loginRequestId){
            console.error("No login in progress.");
            return;
        }

        const response = await fetch(
            `http://localhost:3000/auth/cli/login-status?id=${loginRequestId}`
        );

        if (!response.ok) {
            console.error("Failed to check login status.");
            process.exit(1);
        }

        const data = await response.json();

        if(data.status === "completed"){
            const accountId = `account_${Date.now()}`;

            store.accounts[accountId] = {
                userId:data.userId,
                sessionId:data.sessionId,
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                createdAt: new Date().toISOString(),
            };

            store.activeAccountId = accountId;

            delete store.pendingLoginRequestId;

            saveAuthStore(store);

            console.log("Login Successful");

            return;
        }

        if(data.status === "expired"){
            console.log("Login request expired. Please run `termind login` again.");

            delete store.pendingLoginRequestId;
            saveAuthStore(store);

            return;
        }

        await new Promise((res) => setTimeout(res, POLL_INTERVAL_MS));
    }
}