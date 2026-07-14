/* ------------------------------------------------------------------ */
/*  Competitive Programming – Data Orchestrator                       */
/*  Reads the config, calls enabled platform services, and returns    */
/*  one aggregated CompetitiveProgrammingData object to the page.     */
/* ------------------------------------------------------------------ */

import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";

import type {
  CompetitiveProgrammingConfig,
  CompetitiveProgrammingData,
  PlatformId,
} from "@/lib/cp/types";
import { fetchCodeforcesProfile } from "@/lib/cp/services/codeforces";
import { fetchLeetCodeProfile } from "@/lib/cp/services/leetcode";
import { fetchCodeChefProfile } from "@/lib/cp/services/codechef";

/* ---------- Config reader ---------- */

const configPath = path.join(
  process.cwd(),
  "data",
  "details",
  "competitive-programming.json",
);

async function readConfig(): Promise<CompetitiveProgrammingConfig | null> {
  try {
    const raw = await fs.readFile(configPath, "utf8");
    return JSON.parse(raw) as CompetitiveProgrammingConfig;
  } catch (error) {
    console.warn("Unable to load competitive-programming.json", error);
    return null;
  }
}

/* ---------- Public API ---------- */

/**
 * Fetch competitive programming data for all enabled platforms.
 *
 * This is the single entry point the server component calls.
 * It returns a fully resolved object – the client component
 * never needs to make its own network requests.
 */
export async function getCompetitiveProgrammingData(): Promise<CompetitiveProgrammingData> {
  const config = await readConfig();

  const empty: CompetitiveProgrammingData = {
    codeforces: null,
    leetcode: null,
    codechef: null,
    enabledPlatforms: [],
    errors: {},
    fetchedAt: new Date().toISOString(),
  };

  if (!config) return empty;

  const { platforms } = config;

  const enabledPlatforms: PlatformId[] = (
    Object.keys(platforms) as PlatformId[]
  ).filter((id) => platforms[id].enabled && platforms[id].username);

  const result: CompetitiveProgrammingData = {
    ...empty,
    enabledPlatforms,
  };

  /* Fetch all enabled platforms in parallel */
  const tasks: Promise<void>[] = [];

  if (platforms.codeforces.enabled && platforms.codeforces.username) {
    tasks.push(
      fetchCodeforcesProfile(platforms.codeforces.username)
        .then((profile) => {
          result.codeforces = profile;
        })
        .catch((error: unknown) => {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          console.warn(`Codeforces fetch failed: ${message}`);
          result.errors.codeforces = message;
        }),
    );
  }

  if (platforms.leetcode.enabled && platforms.leetcode.username) {
    tasks.push(
      fetchLeetCodeProfile(platforms.leetcode.username)
        .then((profile) => {
          result.leetcode = profile;
        })
        .catch((error: unknown) => {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          console.warn(`LeetCode fetch failed: ${message}`);
          result.errors.leetcode = message;
        }),
    );
  }

  if (platforms.codechef.enabled && platforms.codechef.username) {
    tasks.push(
      fetchCodeChefProfile(platforms.codechef.username)
        .then((profile) => {
          result.codechef = profile;
        })
        .catch((error: unknown) => {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          console.warn(`CodeChef fetch failed: ${message}`);
          result.errors.codechef = message;
        }),
    );
  }

  await Promise.all(tasks);

  result.fetchedAt = new Date().toISOString();

  return result;
}
