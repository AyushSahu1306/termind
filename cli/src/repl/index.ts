import readline from "node:readline/promises";
import { stdin as input,stdout as output } from "node:process";
import { replCommands } from "./command.js";

export async function startRepl():Promise<void> {

    const rl = readline.createInterface({
        input,
        output
    });

    console.log("Welcome to Termind");
    console.log("Type 'help' to see available commands.\n");

    try {
        while(true){
            const line = await rl.question("> ");

            const trimmed = line.trim();

            if(trimmed === ""){
                continue;
            }

            if(trimmed === "exit"){
                break;
            }

            const [command,...args] = trimmed.split(/\s+/);

            const handler = replCommands[command];

            if(!handler){
                console.log(`Unknown command: ${command}`);
                console.log("Type 'help' to see available commands");
                continue
            }

            try {
                await handler(args);
            } catch (error:any) {
                console.error(error?.message ?? "command failed")
            }
        }
    } catch (error) {
        
    } finally {
        rl.close();
        console.log("\nGoodbye!")
    }
}