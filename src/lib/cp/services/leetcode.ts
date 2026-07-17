/* ------------------------------------------------------------------ */
/*  LeetCode API Service                                              */
/*  Fetches user public stats and contest history from LeetCode       */
/*  using the official website GraphQL endpoint.                      */
/* ------------------------------------------------------------------ */

import type { LeetCodeProfile } from "@/lib/cp/types";

/* ---------- Raw GraphQL response types (internal only) ---------- */

interface LCSubmissionNum {
  difficulty: "All" | "Easy" | "Medium" | "Hard";
  count: number;
}

interface LCMatchedUser {
  username: string;
  submitStats: {
    acSubmissionNum: LCSubmissionNum[];
  };
}

interface LCContestHistory {
  attended: boolean;
  rating: number;
  ranking: number;
}

interface LCGraphQLResponse {
  data?: {
    matchedUser?: LCMatchedUser;
    userContestRankingHistory?: LCContestHistory[] | null;
  };
  errors?: Array<{ message: string }>;
}

/* ---------- Public API ---------- */

const LEETCODE_API_URL = "https://leetcode.com/graphql";

/**
 * Fetch a LeetCode user profile.
 *
 * Uses the official GraphQL endpoint with a combined query for:
 * - Submission statistics (total, easy, medium, hard solved)
 * - Contest ranking history (rating, attended count)
 *
 * NOTE: `userContestRanking` returns null when globalRanking is locked
 * (fewer than 6 contests attended). We use `userContestRankingHistory`
 * instead, which always returns per-contest data, and derive rating and
 * attendedContestsCount from it directly.
 *
 * @throws Error when the GraphQL endpoint returns errors or the username is not found.
 */
export async function fetchLeetCodeProfile(
  username: string,
  bypassCache = false,
): Promise<LeetCodeProfile> {
  const query = `
    query leetCodeProfile($username: String!) {
      matchedUser(username: $username) {
        username
        submitStats: submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
      userContestRankingHistory(username: $username) {
        attended
        rating
        ranking
      }
    }
  `;

  const fetchOptions = bypassCache
    ? { cache: "no-store" as const }
    : { next: { revalidate: 3600 } };

  const res = await fetch(LEETCODE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    body: JSON.stringify({
      query,
      variables: { username },
    }),
    ...fetchOptions,
  });

  if (!res.ok) {
    throw new Error(
      `LeetCode GraphQL request failed with status ${res.status}`,
    );
  }

  const payload: LCGraphQLResponse = await res.json();

  if (payload.errors && payload.errors.length > 0) {
    throw new Error(payload.errors[0].message);
  }

  const matchedUser = payload.data?.matchedUser;
  if (!matchedUser) {
    throw new Error(`LeetCode profile not found for user: ${username}`);
  }

  /* Parse submission counts by difficulty */
  let totalSolved = 0;
  let easySolved = 0;
  let mediumSolved = 0;
  let hardSolved = 0;

  matchedUser.submitStats.acSubmissionNum.forEach((item) => {
    if (item.difficulty === "All") totalSolved = item.count;
    if (item.difficulty === "Easy") easySolved = item.count;
    if (item.difficulty === "Medium") mediumSolved = item.count;
    if (item.difficulty === "Hard") hardSolved = item.count;
  });

  /* Derive contest stats from per-contest history.
   *
   * `userContestRanking` is null for users with < 6 contests (LeetCode
   * deliberately locks both the global ranking AND the rating field in that
   * response).  `userContestRankingHistory[].rating` is the PRE-CONTEST
   * baseline rating (always 1500 for new users), NOT the post-contest
   * updated rating — so using it would display a wrong value.
   *
   * We therefore:
   *  - Derive contestsAttended from the count of `attended === true` entries
   *    in the history (this is always accurate regardless of ranking status).
   *  - Set contestRating to null, which the UI renders as "N/A" with a lock
   *    indicator, until the user attends 6+ contests and globalRanking unlocks.
   */
  const history = payload.data?.userContestRankingHistory ?? [];
  const contestsAttended = history.filter((entry) => entry.attended).length;
  const contestRating: number | null = null;

  return {
    username: matchedUser.username,
    totalSolved,
    easySolved,
    mediumSolved,
    hardSolved,
    contestRating,
    profileUrl: `https://leetcode.com/u/${encodeURIComponent(matchedUser.username)}`,
    lastUpdated: new Date().toISOString(),
    contestsAttended,
  };
}
