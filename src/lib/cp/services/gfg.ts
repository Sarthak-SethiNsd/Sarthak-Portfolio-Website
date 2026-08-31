/* ------------------------------------------------------------------ */
/*  GeeksforGeeks Stats Service                                       */
/*  Fetches the public solved count through the documented GFG Stats  */
/*  API. The request is server-side and contains no credentials.      */
/* ------------------------------------------------------------------ */

import type { GFGProfile } from "@/lib/cp/types";

const GFG_STATS_API_BASE_URL = "https://gfg-stats.tashif.codes";
const REQUEST_TIMEOUT_MS = 10_000;

interface GFGStatsResponse {
  status?: string;
  username?: string;
  data?: {
    totalSolved?: unknown;
  };
}

/**
 * Fetch a GFG user's current solved-problem count.
 *
 * The provider's canonical `/{username}/stats` endpoint returns the
 * statistic at `data.totalSolved`.
 */
export async function fetchGFGProfile(
  username: string,
  displayName: string,
  profileUrl: string,
  bypassCache = false,
): Promise<GFGProfile> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const fetchOptions = bypassCache
    ? { cache: "no-store" as const }
    : { next: { revalidate: 3600 } };

  try {
    const res = await fetch(
      `${GFG_STATS_API_BASE_URL}/${encodeURIComponent(username)}/stats`,
      {
        ...fetchOptions,
        signal: controller.signal,
      },
    );

    if (!res.ok) {
      throw new Error(`GFG stats request failed with status ${res.status}`);
    }

    const payload = (await res.json()) as GFGStatsResponse;
    const totalSolved = payload.data?.totalSolved;

    if (
      payload.status !== "success" ||
      typeof totalSolved !== "number" ||
      !Number.isInteger(totalSolved) ||
      totalSolved < 0
    ) {
      throw new Error("GFG stats response did not include a valid totalSolved value");
    }

    return { username, displayName, totalSolved, profileUrl };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("GFG stats request timed out");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
