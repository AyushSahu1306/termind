import readline from "node:readline/promises"
import { ChatSession } from "./chat-session.js";
import chalk from "chalk";
import { chat } from "../commands/chat.js";

export async function startChatMode(rl:readline.Interface,session: ChatSession){
    console.log(chalk.green("Entered Chat Mode. Type 'exit' to return to menu."));

    while(true){
        try {
            const input = await rl.question(chalk.blue("termind (chat) > "));
            const trimmed = input.trim();

            if(!trimmed) continue;

            if(trimmed.toLowerCase() === "exit" || trimmed.toLowerCase() === "quit"){
               console.log(chalk.yellow("Exiting Chat Mode..."));
                break; 
            }

            await chat(trimmed,session);
        } catch (error) {
            console.error("Error in chat mode: ",error);
        }
    }
}

