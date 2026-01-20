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
    1. Ask questions naturally: "How do I deploy this?"
    2. Explore your code: "List files in src"
    3. Type ${chalk.magenta("exit")} to quit.
    4. Type ${chalk.magenta("help")} to see available commands.
    `);
}