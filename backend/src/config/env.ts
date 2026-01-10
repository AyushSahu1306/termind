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
  jwtTtlMinutes:Number(getEnv("JWT_TTL_MINUTES"))
};