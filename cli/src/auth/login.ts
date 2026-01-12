import { loadAuthStore } from "./token-store.js";

export async function login() : Promise<void> {
    const store = loadAuthStore();

    if(store.activeAccountId){
        console.log("You are already logged in.");
        console.log(`Active account: ${store.activeAccountId}`);
        console.log("Use `termind logout` to log out.");
        return;
    }

    const response = await fetch("http://localhost:3000/auth/cli/login-request",{
        method:"POST"
    });

    if(!response.ok){
        console.error("failed to initiate login. ");
        process.exit(1);
    }

    const data = await response.json();

    console.log("\nTo log in, open this URL in your browser:\n");
    console.log(data.githubAuthUrl);
    console.log("\nAfter completing login, return to the terminal.\n");
}