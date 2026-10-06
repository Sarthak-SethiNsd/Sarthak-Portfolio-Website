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

/** Returned by `userContestRanking` – contains the authoritative current rating. */
interface LCContestRanking {
  attendedContestsCount: number;
  rating: number;
}

interface LCGraphQLResponse {
  data?: {
    matchedUser?: LCMatchedUser;
    userContestRanking?: LCContestRanking | null;
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
 * - `userContestRanking` — the authoritative current contest rating
 * - `userContestRankingHistory` — used only to derive the attended count
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
      userContestRanking(username: $username) {
        attendedContestsCount
        rating
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

  /* Derive contest stats.
   *
   * `userContestRanking` returns the authoritative current rating when the
   * user has attended at least one rated contest whose results have been
   * processed.  We round to the nearest integer to match the number shown
   * on the LeetCode profile page.
   *
   * `userContestRanking` may be null if the account has never participated in
   * a rated contest; in that case we fall back to null and the UI renders "N/A".
   *
   * `userContestRankingHistory[].rating` is deliberately NOT used here because
   * it is the PRE-contest baseline entry (always 1500 for new participants),
   * not the final post-contest adjusted rating.
   */
  const history = payload.data?.userContestRankingHistory ?? [];
  const contestsAttended = history.filter((entry) => entry.attended).length;

  const rawRating = payload.data?.userContestRanking?.rating;
  const contestRating: number | null =
    typeof rawRating === "number" && isFinite(rawRating)
      ? Math.round(rawRating)
      : null;

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
