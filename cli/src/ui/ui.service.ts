import chalk from "chalk";
import figlet from "figlet";
import gradient from "gradient-string";


export function printBanner() {
    console.clear();

    const banner = figlet.textSync("TERMIND", {
        font: "Standard",
        horizontalLayout: "default",
        verticalLayout: "default"
    });

    console.log(gradient.pastel.multiline(banner));


    console.log(`
        ${chalk.bold.cyan("Welcome to Termind AI CLI")}
        
        ${chalk.gray("Tips for getting started:")}
        1. Type ${chalk.magenta("chat")} to enter interactive mode.
        2. Ask me to ${chalk.green("run commands")} like 'npm install'.
        3. Ask me to ${chalk.green("search")} and edit your code.
        4. Type ${chalk.magenta("help")} to see available commands.
    `);
}