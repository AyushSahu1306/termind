import { login } from "../auth/login.js";
import { logout } from "../auth/logout.js";
import { status } from "../auth/status.js";
import { chat } from "../commands/chat.js";
import { whoami } from "../commands/whoami.js";

export type ReplCommands = (args:string[]) => Promise<void>;

export const replCommands:Record<string,ReplCommands> = {
    login:async(args)=>{
        const wait = args.includes("--wait");
        await login(wait);
    },

    logout:async ()=>{
        await logout();
    },

    status:async()=>{
        status();
    },

    whoami:async()=>{
        await whoami();
    },

    chat:async(args)=>{
        const message = args.join(" ");
        await chat(message);
    },

    help:async()=>{
        console.log(`Available commands:
                login[--wait]
                logout
                status
                whoami
                help
                exit
            `.trim());
    }
}