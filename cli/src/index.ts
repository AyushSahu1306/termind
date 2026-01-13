#!/usr/bin/env node

import { Command } from "commander";
import { login } from "./auth/login.js";
import { logout } from "./auth/logout.js";

const program = new Command();

program
  .name("termind")
  .description("Termind AI CLI")
  .version("0.1.0");

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

program.parse();






