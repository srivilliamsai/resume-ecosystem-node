import { Lru } from "@common/index.js";
export const verifyCache = new Lru<string, any>(1000);
