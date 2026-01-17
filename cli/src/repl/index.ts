import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { replCommands } from "./command.js";
import { getPrompt } from "./prompt.js";
import { ChatSession } from "./chat-session.js";

export async function startRepl(): Promise<void> {

    const rl = readline.createInterface({
        input,
        output,
        terminal: true
    });

    const chatSession = new ChatSession();

    console.log("Welcome to Termind");
    console.log("Type 'help' to see available commands.\n");

    let interruptedOnce = false;

    rl.on('SIGINT', () => {
        if (interruptedOnce) {
            rl.close();
        } else {
            console.log("\n(Press Ctrl+C again to exit)");
            interruptedOnce = true;
        }
    });

    rl.on('close', () => {
        console.log("\nGoodbye!");
        process.exit(0);
    })

    try {
        while (true) {
            let line: string;

            try {
                line = await rl.question(getPrompt());
                interruptedOnce = false;
            } catch (error) {
                continue;
            }

            const trimmed = line.trim();

            if (trimmed === "") {
                continue;
            }

            if (trimmed === "exit") {
                break;
            }

            const [command, ...args] = trimmed.split(/\s+/);

            const handler = replCommands[command];

            if (!handler) {
                console.log(`Unknown command: ${command}`);
                console.log("Type 'help' to see available commands");
                continue
            }

            try {
                await handler(args,{chatSession});
            } catch (error: any) {
                console.error(error?.message ?? "command failed")
            }
        }
    } finally {
        rl.close();
    }
}