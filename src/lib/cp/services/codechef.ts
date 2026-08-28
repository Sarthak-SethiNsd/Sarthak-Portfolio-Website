/* ------------------------------------------------------------------ */
/*  CodeChef API Service                                              */
/*  Fetches user public stats from CodeChef by parsing the profile    */
/*  HTML server-side. This avoids relying on unstable proxies.       */
/* ------------------------------------------------------------------ */

import type { CodeChefProfile } from "@/lib/cp/types";

const CODECHEF_BASE_URL = "https://www.codechef.com/users";

/**
 * Fetch a CodeChef user profile by fetching and parsing the profile page.
 *
 * @throws Error when CodeChef returns a non-200 status code.
 */
export async function fetchCodeChefProfile(
  username: string,
  bypassCache = false,
): Promise<CodeChefProfile> {
  const url = `${CODECHEF_BASE_URL}/${encodeURIComponent(username)}`;

  const fetchOptions = bypassCache
    ? { cache: "no-store" as const }
    : { next: { revalidate: 3600 } };

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    ...fetchOptions,
  });

  if (!res.ok) {
    throw new Error(
      `CodeChef profile request failed with status ${res.status}`,
    );
  }

  const html = await res.text();

  /* 1. Extract Current Rating */
  const ratingRegex = /<div class="rating-number">\s*(\d+)\s*<\/div>/;
  const ratingMatch = html.match(ratingRegex);
  const currentRating = ratingMatch ? parseInt(ratingMatch[1], 10) : 0;

  /* 2. Extract Highest Rating */
  const highestRatingRegex = /<small>\(Highest Rating\s*(\d+)\s*\)<\/small>/;
  const highestRatingMatch = html.match(highestRatingRegex);
  const highestRating = highestRatingMatch ? parseInt(highestRatingMatch[1], 10) : 0;

  /* 3. Extract Stars */
  const starRegex = /<div class="rating-star">([\s\S]*?)<\/div>/;
  const starMatch = html.match(starRegex);
  let stars = "--";
  if (starMatch) {
    const spanCount = (starMatch[1].match(/<span/g) || []).length;
    stars = spanCount > 0 ? `${spanCount}★` : "--";
  }

  /* 4. Extract Global Rank */
  const globalRankRegex = /<a href=["']\/ratings\/all["']>\s*<strong>\s*([\s\S]*?)\s*<\/strong>\s*<\/a>\s*Global Rank/i;
  const globalRankMatch = html.match(globalRankRegex);
  const globalRank = globalRankMatch ? globalRankMatch[1].trim() : "--";

  /* 5. Extract Contests Attended from date_versus_rating JSON */
  let contestsAttended = 0;
  const dvrIndex = html.indexOf('"date_versus_rating"');
  if (dvrIndex !== -1) {
    const startIndex = html.indexOf('[', dvrIndex);
    if (startIndex !== -1) {
      let bracketCount = 1;
      let endIndex = startIndex + 1;
      while (bracketCount > 0 && endIndex < html.length) {
        if (html[endIndex] === '[') bracketCount++;
        if (html[endIndex] === ']') bracketCount--;
        endIndex++;
      }
      const arrayStr = html.substring(startIndex, endIndex);
      try {
        const allContests = JSON.parse(arrayStr);
        contestsAttended = Array.isArray(allContests) ? allContests.length : 0;
      } catch (err) {
        console.warn("Failed to parse CodeChef contest history JSON", err);
      }
    }
  }

  /* 6. Extract Total Problems Solved */
  const totalSolvedRegex =
    /<h3>\s*Total Problems Solved:\s*(\d+)\s*<\/h3>/i;
  const totalSolvedMatch =
    html.match(totalSolvedRegex) ??
    html.match(/Total Problems Solved:\s*(\d+)/i);
  const totalSolved = totalSolvedMatch ? parseInt(totalSolvedMatch[1], 10) : 0;

  return {
    username,
    currentRating,
    highestRating,
    stars,
    globalRank,
    totalSolved,
    profileUrl: url,
    lastUpdated: new Date().toISOString(),
    contestsAttended,
  };
}
