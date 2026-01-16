#!/usr/bin/env node

import { Command } from "commander";
import { login } from "./auth/login.js";
import { logout } from "./auth/logout.js";
import { status } from "./auth/status.js";
import { authenticatedFetch } from "./auth/authenticated-fetch.js";
import { whoami } from "./commands/whoami.js";
import { startRepl } from "./repl/index.js";

const program = new Command();

program
  .name("termind")
  .description("Termind AI CLI")
  .version("0.1.0")

program
  .command("login")
  .description("Log in to Termind")
  .option("--wait","Wait for login to complete")
  .action((options)=>{
    login(Boolean(options.wait)).catch((err)=>{
      console.error("Unexpected error : ",err);
      process.exit(1);  
    })
  })

program
  .command("logout")
  .description("Log out of Termind")
  .action(()=>{
    logout().catch((err)=>{
      console.error("Unexpected error: ",err);
      process.exit(1);
    })
  })

program 
  .command("status")
  .description("Show authentication status")
  .action(()=>{
    try {
      status();
    } catch (error) {
      console.error("Unexpected error:",error);
      process.exit(1);
    }
  })

program
  .command("whoami")
  .description("Show the currently authenticated user")
  .action(()=>{
    whoami().catch((err)=>{
      console.error(err.message);
      process.exit(1);
    })
  })

program.action(()=>{
  startRepl().catch((err)=>{
    console.error("Fatal error:",err);
    process.exit(1);
  })
})

program.parse(process.argv);





