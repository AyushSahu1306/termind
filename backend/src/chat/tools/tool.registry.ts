import * as path from "path";
import * as fs from "fs/promises";
import { exec } from "child_process";
import { promisify } from "util";


const execAsync = promisify(exec);

function getSafepath(targetPath:string,customCwd?:string):string {
    const baseDir =  customCwd || process.cwd();
    const resolvedPath = path.resolve(baseDir,targetPath);

    if(!resolvedPath.startsWith(baseDir)){
        throw new Error("Access Denied: Path is outside project directory");
    }
    return resolvedPath;
}



export const toolRegistry:Record<string,Function> = {
    get_current_time:async ()=>{
        return new Date().toLocaleString();
    },

    list_dir: async ({ path: inputPath }: { path: string }, context?: { cwd: string }) => {
        try {
            const p = getSafepath(inputPath, context?.cwd);
            const items = await fs.readdir(p, { withFileTypes: true });
            return items.map(item => {
                return item.isDirectory() ? `${item.name}/` : item.name;
            }).join("\n");
        } catch (error: any) {
            return `Error listing directory: ${error.message}`;
        }
    },

    read_file: async ({ path: inputPath }: { path: string }, context?: { cwd: string }) => {
        try {
            const p = getSafepath(inputPath, context?.cwd);
            const content = await fs.readFile(p, "utf-8");
            return content;
        } catch (error: any) {
            return `Error reading file: ${error.message}`;
        }
    },

    write_file: async ({ path: inputPath, content }: { path: string, content: string }, context?: { cwd: string }) => {
        try {
            const p = getSafepath(inputPath, context?.cwd);
            const dir = path.dirname(p);
            await fs.mkdir(dir, { recursive: true });
            await fs.writeFile(p, content, "utf-8");
            return `Successfully wrote to ${inputPath}`;
        } catch (error: any) {
            return `Error writing file: ${error.message}`;
        }
    },

    delete_file:async({path:inputPath}:{path:string}, context?: { cwd: string })=>{
        try {
            const p = getSafepath(inputPath,context?.cwd);
            await fs.unlink(p);
            return `Successfully deleted ${inputPath}`;
        } catch (error:any) {
            return `Error deleting file: ${error.message}`;
        }
    },

    delete_folder:async({path:inputPath}:{path:string}, context?: { cwd: string }) => {
        try {
            const p = getSafepath(inputPath,context?.cwd);
            await fs.rm(p,{recursive:true,force:true});
            return `Successfully deleted folder ${inputPath}`;
        } catch (error: any) {
            return `Error deleting folder: ${error.message}`;
        }
    },

    run_command:async({command}:{command:string},context?:{cwd:string}) => {
        try {
            console.log(`Executing: ${command} in ${context?.cwd}`);
            const {stdout,stderr} = await execAsync(command,{
                cwd:context?.cwd || process.cwd()
            })
            const output = stdout || stderr;
            return output ? output.trim() : "Command executed successfully (no output).";
        } catch (error:any) {
            return `Command failed: ${error.message}\nStderr: ${error.stderr}`;
        }
    }
} 