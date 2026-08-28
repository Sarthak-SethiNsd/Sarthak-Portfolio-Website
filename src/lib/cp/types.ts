/* ------------------------------------------------------------------ */
/*  Competitive Programming – Shared Types                            */
/*  Every platform service maps its raw API response into these       */
/*  UI-facing interfaces. The UI never touches raw API shapes.        */
/* ------------------------------------------------------------------ */

/** Per-platform configuration entry read from the JSON config file. */
export interface PlatformConfig {
  username: string;
  enabled: boolean;
}

/** Root shape of the `data/details/competitive-programming.json` file. */
export interface CompetitiveProgrammingConfig {
  platforms: {
    codeforces: PlatformConfig;
    leetcode: PlatformConfig;
    codechef: PlatformConfig;
  };
}

/** The platform identifier union – used as key everywhere. */
export type PlatformId = "codeforces" | "leetcode" | "codechef";

/* ------------------------------------------------------------------ */
/*  UI-Facing Profile Shapes (per platform)                           */
/* ------------------------------------------------------------------ */

export interface CodeforcesProfile {
  username: string;
  currentRating: number;
  maxRating: number;
  currentRank: string;
  highestRank: string;
  totalSolved: number;
  profileUrl: string;
  lastUpdated: string;
  contestsAttended: number;
}

export interface LeetCodeProfile {
  username: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  /** Null when LeetCode's API does not expose it (Global Ranking locked, < 6 contests). */
  contestRating: number | null;
  profileUrl: string;
  lastUpdated: string;
  contestsAttended: number;
}

export interface CodeChefProfile {
  username: string;
  currentRating: number;
  highestRating: number;
  stars: string;
  globalRank: string;
  /** Total number of problems solved on CodeChef (scraped from profile page). */
  totalSolved: number;
  profileUrl: string;
  lastUpdated: string;
  contestsAttended: number;
}

/* ------------------------------------------------------------------ */
/*  Aggregated result passed from server → client component           */
/* ------------------------------------------------------------------ */

export interface CompetitiveProgrammingData {
  codeforces: CodeforcesProfile | null;
  leetcode: LeetCodeProfile | null;
  codechef: CodeChefProfile | null;
  /** Platforms whose config is enabled. */
  enabledPlatforms: PlatformId[];
  /** Errors keyed by platform id (null when no error). */
  errors: Partial<Record<PlatformId, string>>;
  /** ISO timestamp of when the data was fetched on the server. */
  fetchedAt: string;
}
