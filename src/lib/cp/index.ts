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
import { fetchGFGProfile } from "@/lib/cp/services/gfg";
import { cpStore } from "@/lib/cp/store";

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

function getEnabledPlatforms(
  config: CompetitiveProgrammingConfig,
): PlatformId[] {
  return (Object.keys(config.platforms) as PlatformId[]).filter(
    (id) => config.platforms[id].enabled && config.platforms[id].username,
  );
}

/* ---------- Public API ---------- */

/**
 * Fetch competitive programming data for all enabled platforms.
 *
 * This is the single entry point the server component calls.
 * It returns a fully resolved object – the client component
 * never needs to make its own network requests.
 */
export async function getCompetitiveProgrammingData(
  bypassCache = false,
): Promise<CompetitiveProgrammingData> {
  const config = await readConfig();

  // 1. If not bypassing, check if we have cached data in the store
  if (!bypassCache) {
    const cached = await cpStore.get();
    if (cached && cached.data) {
      // Check if cache is fresh enough (5 minutes)
      const age = Date.now() - cached.lastSuccessTimestamp;
      if (age < 5 * 60 * 1000) {
        return cached.data;
      }
      // If cache is stale, fall through to fetch fresh data
    }
  }

  const empty: CompetitiveProgrammingData = {
    codeforces: null,
    leetcode: null,
    codechef: null,
    gfg: null,
    enabledPlatforms: [],
    errors: {},
    fetchedAt: new Date().toISOString(),
  };

  if (!config) return empty;

  const { platforms } = config;

  const enabledPlatforms = getEnabledPlatforms(config);

  const result: CompetitiveProgrammingData = {
    ...empty,
    enabledPlatforms,
  };

  /* Fetch all enabled platforms in parallel */
  const tasks: Promise<void>[] = [];

  if (platforms.codeforces.enabled && platforms.codeforces.username) {
    tasks.push(
      fetchCodeforcesProfile(platforms.codeforces.username, bypassCache)
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
      fetchLeetCodeProfile(platforms.leetcode.username, bypassCache)
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
      fetchCodeChefProfile(platforms.codechef.username, bypassCache)
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

  if (platforms.gfg.enabled && platforms.gfg.username) {
    tasks.push(
      fetchGFGProfile(
        platforms.gfg.username,
        platforms.gfg.displayName,
        platforms.gfg.profileUrl,
        bypassCache,
      )
        .then((profile) => {
          result.gfg = profile;
        })
        .catch((error: unknown) => {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          console.warn(`GFG fetch failed: ${message}`);
          result.errors.gfg = message;
        }),
    );
  }

  await Promise.all(tasks);

  result.fetchedAt = new Date().toISOString();

  // If we loaded data on initial load (no cache existed yet), seed the cache
  if (!bypassCache) {
    const hasErrors = Object.keys(result.errors).length > 0;
    await cpStore.set({
      // Only set cooldown timestamp if there were no errors
      lastSuccessTimestamp: hasErrors ? 0 : Date.now(),
      data: result,
    });
  }

  return result;
}
