/* ------------------------------------------------------------------ */
/*  Codeforces API Service                                            */
/*  Uses the official Codeforces API – no scraping, no hardcoding.    */
/* ------------------------------------------------------------------ */

import type { CodeforcesProfile } from "@/lib/cp/types";

/* ---------- Raw API response types (internal only) ---------- */

interface CFUser {
  handle: string;
  rating?: number;
  maxRating?: number;
  rank?: string;
  maxRank?: string;
}

interface CFUserInfoResponse {
  status: "OK" | "FAILED";
  result?: CFUser[];
  comment?: string;
}

interface CFSubmission {
  id: number;
  problem: { contestId?: number; index: string; name: string };
  verdict?: string;
}

interface CFUserStatusResponse {
  status: "OK" | "FAILED";
  result?: CFSubmission[];
  comment?: string;
}

interface CFRatingChange {
  contestId: number;
  contestName: string;
  handle: string;
  rank: number;
  ratingUpdateTimeSeconds: number;
  oldRating: number;
  newRating: number;
}

interface CFRatingResponse {
  status: "OK" | "FAILED";
  result?: CFRatingChange[];
  comment?: string;
}

/* ---------- Public API ---------- */

const CF_API_BASE = "https://codeforces.com/api";

/**
 * Fetch a Codeforces user profile using the official API.
 *
 * Makes two parallel requests:
 * 1. `user.info`   – rating, rank, maxRating, maxRank
 * 2. `user.status` – all submissions → count unique accepted problems
 *
 * @throws Error when the API returns FAILED or the network request fails.
 */
export async function fetchCodeforcesProfile(
  username: string,
  bypassCache = false,
): Promise<CodeforcesProfile> {
  const fetchOptions = bypassCache
    ? { cache: "no-store" as const }
    : { next: { revalidate: 3600 } };

  const [infoRes, statusRes, ratingRes] = await Promise.all([
    fetch(`${CF_API_BASE}/user.info?handles=${encodeURIComponent(username)}`, fetchOptions),
    fetch(
      `${CF_API_BASE}/user.status?handle=${encodeURIComponent(username)}&from=1&count=10000`,
      fetchOptions,
    ),
    fetch(
      `${CF_API_BASE}/user.rating?handle=${encodeURIComponent(username)}`,
      fetchOptions,
    ),
  ]);

  if (!infoRes.ok) {
    throw new Error(
      `Codeforces user.info request failed with status ${infoRes.status}`,
    );
  }
  if (!statusRes.ok) {
    throw new Error(
      `Codeforces user.status request failed with status ${statusRes.status}`,
    );
  }
  if (!ratingRes.ok) {
    throw new Error(
      `Codeforces user.rating request failed with status ${ratingRes.status}`,
    );
  }

  const infoData: CFUserInfoResponse = await infoRes.json();
  const statusData: CFUserStatusResponse = await statusRes.json();
  const ratingData: CFRatingResponse = await ratingRes.json();

  if (infoData.status !== "OK" || !infoData.result?.length) {
    throw new Error(
      infoData.comment ?? "Codeforces API returned an unexpected response.",
    );
  }

  const user = infoData.result[0];

  /* Count unique accepted problems from submissions */
  const solvedSet = new Set<string>();
  if (statusData.status === "OK" && statusData.result) {
    for (const submission of statusData.result) {
      if (submission.verdict === "OK") {
        const key = `${submission.problem.contestId ?? "gym"}-${submission.problem.index}`;
        solvedSet.add(key);
      }
    }
  }

  const contestsAttended =
    ratingData.status === "OK" && ratingData.result
      ? ratingData.result.length
      : 0;

  return {
    username: user.handle,
    currentRating: user.rating ?? 0,
    maxRating: user.maxRating ?? 0,
    currentRank: user.rank ?? "unrated",
    highestRank: user.maxRank ?? "unrated",
    totalSolved: solvedSet.size,
    profileUrl: `https://codeforces.com/profile/${encodeURIComponent(user.handle)}`,
    lastUpdated: new Date().toISOString(),
    contestsAttended,
  };
}
