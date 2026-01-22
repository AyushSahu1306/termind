import { login } from "../auth/login.js";
import { logout } from "../auth/logout.js";
import { status } from "../auth/status.js";
import { chat } from "../commands/chat.js";
import { whoami } from "../commands/whoami.js";
import { ChatSession } from "./chat-session.js";
import readline from "node:readline/promises";
import { startChatMode } from "./chat-mode.js";

export type ReplCommands = (args: string[]) => Promise<void>;

export type ReplContext = {
    chatSession:ChatSession;
    rl: readline.Interface;
}

export type ReplHandler = (args:string[],context:ReplContext) => Promise<void>;

export const replCommands: Record<string, ReplHandler> = {
    login: async (args) => {
        const wait = !args.includes("--no-wait");
        await login(true);
    },

    logout: async () => {
        await logout();
    },

    status: async () => {
        status();
    },

    whoami: async () => {
        await whoami();
    },

    chat: async (args,context) => {
        if (args.length === 0) {
            await startChatMode(context.rl, context.chatSession);
        } else {
            const message = args.join(" ");
            await chat(message, context.chatSession);
        }
    },

    help: async () => {
        console.log(`Available commands:
                login
                logout
                status
                whoami
                chat <message>
                help
                exit
            `.trim());
    }
}