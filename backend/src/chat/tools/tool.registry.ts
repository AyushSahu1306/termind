import * as path from "path";
import * as fs from "fs/promises";

function getSafepath(targetPath:string):string {
    const baseDir = process.cwd();
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

    list_dir:async({path:inputPath}:{path:string})=>{
        try {
            const p = getSafepath(inputPath);
            const items = await fs.readdir(p,{withFileTypes:true});
            return items.map(item=>{
                return item.isDirectory()? `${item.name}/`:item.name;
            }).join("\n");
        } catch (error:any) {
             return `Error listing directory: ${error.message}`;
        }
    },

    read_file:async({path:inputPath}:{path:string}) => {
        try {
            const p = getSafepath(inputPath);
            const content = await fs.readFile(p,"utf-8");
            return content;
        } catch (error:any) {
            return `Error reading file: ${error.message}`;
        }
    }
} 