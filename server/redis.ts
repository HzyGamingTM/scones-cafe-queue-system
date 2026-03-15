import { Redis } from "@upstash/redis";

console.log("Redis imported, env dump:");
console.log(JSON.stringify(process.env, undefined, 4))
export const redis = Redis.fromEnv();
