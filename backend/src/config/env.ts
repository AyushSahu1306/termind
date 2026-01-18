import 'dotenv/config';

function getEnv(name:string):string {
    const value = process.env[name];
    if (!value) {
    throw new Error(`Missing required env variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(getEnv("PORT")),
  nodeEnv: getEnv("NODE_ENV"),
  jwtSecret:getEnv("JWT_SECRET"),
  jwtTtlMinutes:Number(getEnv("JWT_TTL_MINUTES")),

  githubClientId: getEnv("GITHUB_CLIENT_ID"),
  githubClientSecret: getEnv("GITHUB_CLIENT_SECRET"),
  githubCallbackUrl: getEnv("GITHUB_CALLBACK_URL"),

  openRouterApiKey: getEnv("OPENROUTER_API_KEY"),
  llmModel: process.env.LLM_MODEL || "google/gemini-2.0-flash-exp:free",
};