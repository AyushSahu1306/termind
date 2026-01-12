#!/usr/bin/env node

import { Command } from "commander";
import { login } from "./auth/login.js";

const program = new Command();

program
  .name("termind")
  .description("Termind AI CLI")
  .version("0.1.0");

program
  .command("login")
  .description("Log in to Termind")
  .action(()=>{
    login().catch((err)=>{
      console.error("Unexpected error : ",err);
      process.exit(1);
    })
  })

program.parse();






