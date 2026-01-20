import chalk from "chalk";
import { loadAuthStore } from "../auth/token-store.js";


export function getPrompt(): string {
    const brand = chalk.bold.cyan("termind");
    const arrow = chalk.gray(">");
    try {
        const store = loadAuthStore();

        if(!store.activeAccountId){
            return `${brand} ${chalk.red("(logged out)")} ${arrow}`
        }

        const account = store.accounts[store.activeAccountId];

        if(!account){
            return `${brand} ${chalk.gray("(?)")} ${arrow} `;
        }

        return `${brand} ${chalk.green("(logged in)")} ${arrow} `;
    } catch (error) {
        return `${brand} ${chalk.gray("(?)")} ${arrow} `;
    }
}