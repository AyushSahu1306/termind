#!/usr/bin/env node
import { Command } from "commander";
const program = new Command();
program
    .name("termind")
    .description("Termind AI CLI")
    .version("0.1.0");
program.parse();
import { loadAuthStore } from "./auth/token-store.js";
console.log(loadAuthStore());
