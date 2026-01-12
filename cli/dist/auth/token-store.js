import fs from "fs";
import path from "path";
import os from "os";
const CONFIG_DIR_NAME = "termind";
const AUTH_FILE_NAME = "auth.json";
function getConfigDir() {
    if (process.env.APPDATA) {
        return path.join(process.env.APPDATA, CONFIG_DIR_NAME);
    }
    const home = os.homedir();
    if (process.env.XDG_CONFIG_HOME) {
        return path.join(process.env.XDG_CONFIG_HOME, CONFIG_DIR_NAME);
    }
    return path.join(home, ".config", CONFIG_DIR_NAME);
}
function getAuthFilePath() {
    return path.join(getConfigDir(), AUTH_FILE_NAME);
}
function emptyStore() {
    return {
        version: 1,
        activeAccountId: null,
        accounts: {},
    };
}
export function loadAuthStore() {
    const filePath = getAuthFilePath();
    try {
        if (!fs.existsSync(filePath)) {
            return emptyStore();
        }
        const raw = fs.readFileSync(filePath, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed.version !== 1 || typeof parsed.accounts !== "object" || !("activeAccountId" in parsed)) {
            throw new Error("Invalid auth store shape");
        }
        return parsed;
    }
    catch (error) {
        console.error("⚠️  Termind auth state was corrupted. Resetting local auth");
        const store = emptyStore();
        saveAuthStore(store);
        return store;
    }
}
export function saveAuthStore(store) {
    const dir = getConfigDir();
    const filePath = getAuthFilePath();
    fs.mkdirSync(dir, { recursive: true });
    const tmpPath = `${filePath}.tmp`;
    const data = JSON.stringify(store, null, 2);
    fs.writeFileSync(tmpPath, data, { mode: 0o600 });
    fs.renameSync(tmpPath, filePath);
}
