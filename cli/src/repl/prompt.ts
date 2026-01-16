import { loadAuthStore } from "../auth/token-store.js";


export function getPrompt(): string {
    try {
        const store = loadAuthStore();

        if(!store.activeAccountId){
            return "termind (logged out) > ";
        }

        const account = store.accounts[store.activeAccountId];

        if(!account){
            return "termind (?) > ";
        }

        return "termind (logged in) > "
    } catch (error) {
        return "termind (?) > ";
    }
}