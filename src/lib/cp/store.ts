import { promises as fs } from "node:fs";
import path from "node:path";
import type { CompetitiveProgrammingData } from "./types";

export interface CPCache {
  lastSuccessTimestamp: number;
  data: CompetitiveProgrammingData;
}

export interface CPStore {
  get(): Promise<CPCache | null>;
  set(cache: CPCache): Promise<void>;
}

/**
 * Filesystem-based CP store implementation.
 * Perfect for development and standard Node.js server environments.
 */
class FileCPStore implements CPStore {
  private cachePath = path.join(
    process.cwd(),
    "data",
    "details",
    "cp-cache.json",
  );

  async get(): Promise<CPCache | null> {
    try {
      const raw = await fs.readFile(this.cachePath, "utf8");
      return JSON.parse(raw) as CPCache;
    } catch {
      return null;
    }
  }

  async set(cache: CPCache): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.cachePath), { recursive: true });
      await fs.writeFile(
        this.cachePath,
        JSON.stringify(cache, null, 2),
        "utf8",
      );
    } catch (error) {
      console.error("Failed to write CP cache file:", error);
    }
  }
}

/**
 * Global store instance.
 * To use Vercel KV or Redis in production, swap this instance out with a RedisCPStore.
 */
export const cpStore: CPStore = new FileCPStore();
