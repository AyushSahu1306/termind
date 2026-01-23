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
    },

    search: async({query}:{query:string},context?:{cwd:string}) => {
        try {
            const startPath = context?.cwd || process.cwd();
            console.log(`Searching for "${query}" in ${startPath}`);

            const results: string[] = [];
            const MAX_RESULTS = 50;

            async function walk(currentPath:string) {
                if (results.length >= MAX_RESULTS) return;
                const items = await fs.readdir(currentPath, { withFileTypes: true });

                for(const item of items){
                    if(results.length >= MAX_RESULTS) break;

                    const fullPath = path.join(currentPath,item.name);

                    if (item.name.startsWith(".") || item.name === "node_modules" || item.name === "dist") {
                         continue;
                     }

                    if(item.isDirectory()){
                        await walk(fullPath);
                    }

                    else {
                        try {
                            const content = await fs.readFile(fullPath, "utf-8");
                            if (content.includes(query)) {
                                const lines = content.split("\n");
                                lines.forEach((line,index)=>{
                                    if (line.includes(query) && results.length < MAX_RESULTS) {
                                        const relativePath = path.relative(startPath, fullPath);
                                        results.push(`${relativePath}:${index + 1}: ${line.trim()}`);
                                    }
                                })
                            }
                        } catch (error) {
                            
                        }
                    }
                }
            }

            await walk(startPath);

            if(results.length === 0){
                return "No matches found.";
            }
            return `Found ${results.length} matches:\n` + results.join("\n");

        } catch (error:any) {
            return `Search failed: ${error.message}`;
        }
    }
} 