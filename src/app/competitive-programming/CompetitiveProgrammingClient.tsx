"use client";

import { Panel } from "@/components/Panel";
import { ExternalLink } from "lucide-react";
import type { CompetitiveProgrammingData } from "@/lib/cp/types";

/* ------------------------------------------------------------------ */
/*  Helper: format an ISO date string to a human-readable timestamp   */
/* ------------------------------------------------------------------ */

function formatTimestamp(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/* ------------------------------------------------------------------ */
/*  Component Props                                                   */
/* ------------------------------------------------------------------ */

interface CompetitiveProgrammingClientProps {
  data: CompetitiveProgrammingData;
}

/* ------------------------------------------------------------------ */
/*  Client Component                                                  */
/* ------------------------------------------------------------------ */

export function CompetitiveProgrammingClient({
  data,
}: CompetitiveProgrammingClientProps) {
  /* Derive summary stats from available platform data */
  const totalSolved =
    (data.codeforces?.totalSolved ?? 0) +
    (data.leetcode?.totalSolved ?? 0);
  const hasSolvedData = Boolean(data.codeforces || data.leetcode);

  const totalContests =
    (data.codeforces?.contestsAttended ?? 0) +
    (data.leetcode?.contestsAttended ?? 0) +
    (data.codechef?.contestsAttended ?? 0);
  const hasContestData = Boolean(data.codeforces || data.leetcode || data.codechef);

  const enabledNames = data.enabledPlatforms
    .map((id) => {
      const names: Record<string, string> = {
        codeforces: "Codeforces",
        leetcode: "LeetCode",
        codechef: "CodeChef",
      };
      return names[id] ?? id;
    })
    .join(", ");

  /* Compute LeetCode solved percentages for custom horizontal status bars */
  const lcTotal = data.leetcode?.totalSolved ?? 0;
  const easyPct = lcTotal > 0 ? ((data.leetcode?.easySolved ?? 0) / lcTotal) * 100 : 0;
  const mediumPct = lcTotal > 0 ? ((data.leetcode?.mediumSolved ?? 0) / lcTotal) * 100 : 0;
  const hardPct = lcTotal > 0 ? ((data.leetcode?.hardSolved ?? 0) / lcTotal) * 100 : 0;

  return (
    <>
      {/* Summary Card Dashboard */}
      <Panel
        className="cp-summary-panel"
        title="Competitive Programming Summary"
      >
        <div className="cp-summary-dashboard">
          <div className="cp-summary-stat">
            <div className="cp-summary-label">Total Solved</div>
            <div className="cp-summary-value">
              {hasSolvedData ? totalSolved : "--"}
            </div>
          </div>
          <div className="cp-summary-stat contests">
            <div className="cp-summary-label">Total Contests</div>
            <div className="cp-summary-value">
              {hasContestData ? totalContests : "--"}
            </div>
          </div>
          <div className="cp-summary-stat platforms">
            <div className="cp-summary-label">Platforms Connected</div>
            <div
              className="cp-summary-value"
              style={{
                fontSize: "14px",
                marginTop: "4px",
                fontFamily: "var(--font-mono)",
                color: "var(--green)",
              }}
            >
              {enabledNames || "None"}
            </div>
          </div>
          <div className="cp-summary-stat synced">
            <div className="cp-summary-label">Last Synced</div>
            <div
              className="cp-summary-value"
              style={{
                fontSize: "14px",
                marginTop: "4px",
                fontFamily: "var(--font-mono)",
              }}
            >
              {formatTimestamp(data.fetchedAt)}
            </div>
          </div>
        </div>
      </Panel>

      {/* Platform Cards Grid */}
      <div className="cp-grid">
        {/* LeetCode Card */}
        <Panel className="cp-card">
          <div className="cp-card-header">
            <div className="cp-logo-container">
              <svg
                viewBox="0 0 24 24"
                width="26"
                height="26"
                fill="#ffa116"
                style={{
                  filter: "drop-shadow(0 0 6px rgba(255,161,22,0.6))",
                }}
              >
                <path d="M16.102 17.93l-2.69 2.607c-.466.452-1.111.987-2.03.987-.918 0-1.564-.535-2.03-.987l-2.69-2.607c-.466-.452-.904-1.398-.904-2.316 0-.918.438-1.864.904-2.316l2.69-2.607c.466-.452 1.111-.987 2.03-.987.918 0 1.564.535 2.03.987l2.69 2.607c.466.452.904 1.398.904 2.316 0 .918-.438 1.864-.904 2.316zm-5.412-5.412l-1.345 1.303c-.233.226-.452.699-.452 1.158 0 .459.219.932.452 1.158l1.345 1.303c.233.226.555.493.974.493.419 0 .741-.267.974-.493l1.345-1.303c.233-.226.452-.699.452-1.158 0-.459-.219-.932-.452-1.158l-1.345-1.303c-.233-.226-.555-.493-.974-.493-.419 0-.741.267-.974.493zm6.757-6.545l-1.345 1.303c-.233.226-.452.699-.452 1.158 0 .459.219.932.452 1.158l1.345 1.303c.233.226.555.493.974.493.419 0 .741-.267.974-.493l1.345-1.303c.233-.226.452-.699.452-1.158 0-.459-.219-.932-.452-1.158l-1.345-1.303c-.233-.226-.555-.493-.974-.493-.419 0-.741.267-.974.493z" />
              </svg>
            </div>
            <div className="cp-platform-info">
              <h3 className="cp-platform-name">LeetCode</h3>
              <span className="cp-username">
                {data.leetcode?.username ?? "Loading..."}
              </span>
            </div>
          </div>

          <div className="cp-card-body">
            <div className="cp-stats-list">
              <div className="cp-stat-row">
                <span className="cp-stat-label">Total Problems Solved</span>
                <span className="cp-stat-value">
                  {data.leetcode?.totalSolved ?? "--"}
                </span>
              </div>

              <div className="cp-difficulty-box">
                <div className="cp-difficulty-row">
                  <span className="cp-diff-label easy">Easy Solved</span>
                  <div className="cp-progress-bg">
                    <div
                      className="cp-progress-bar easy"
                      style={{ width: `${easyPct}%` }}
                    ></div>
                  </div>
                  <span className="cp-diff-val">
                    {data.leetcode?.easySolved ?? "--"}
                  </span>
                </div>
                <div className="cp-difficulty-row">
                  <span className="cp-diff-label medium">Medium Solved</span>
                  <div className="cp-progress-bg">
                    <div
                      className="cp-progress-bar medium"
                      style={{ width: `${mediumPct}%` }}
                    ></div>
                  </div>
                  <span className="cp-diff-val">
                    {data.leetcode?.mediumSolved ?? "--"}
                  </span>
                </div>
                <div className="cp-difficulty-row">
                  <span className="cp-diff-label hard">Hard Solved</span>
                  <div className="cp-progress-bg">
                    <div
                      className="cp-progress-bar hard"
                      style={{ width: `${hardPct}%` }}
                    ></div>
                  </div>
                  <span className="cp-diff-val">
                    {data.leetcode?.hardSolved ?? "--"}
                  </span>
                </div>
              </div>

              <div className="cp-stat-row">
                <span className="cp-stat-label">Contests Attended</span>
                <span className="cp-stat-value">
                  {data.leetcode?.contestsAttended ?? "--"}
                </span>
              </div>

              <div className="cp-stat-row">
                <span className="cp-stat-label">Contest Rating</span>
                <span
                  className="cp-stat-value"
                  title={
                    data.leetcode?.contestRating == null
                      ? "Locked by LeetCode until 6 contests are attended"
                      : undefined
                  }
                >
                  {data.leetcode == null
                    ? "--"
                    : data.leetcode.contestRating != null
                      ? data.leetcode.contestRating
                      : "N/A 🔒"}
                </span>
              </div>
            </div>

            {data.errors.leetcode ? (
              <div className="fallback-note" style={{ marginBottom: "12px", fontSize: "12px", color: "#ff375f" }}>
                ⚠ {data.errors.leetcode}
              </div>
            ) : null}

            <a
              className="primary-link cp-action-btn-active"
              href={data.leetcode?.profileUrl ?? "https://leetcode.com/"}
              target="_blank"
              rel="noreferrer"
            >
              View Profile <ExternalLink size={13} />
            </a>
          </div>
        </Panel>

        {/* Codeforces Card */}
        <Panel className="cp-card">
          <div className="cp-card-header">
            <div className="cp-logo-container">
              <svg
                viewBox="0 0 24 24"
                width="26"
                height="26"
                style={{
                  filter: "drop-shadow(0 0 6px rgba(234,32,39,0.4))",
                }}
              >
                <rect
                  x="2"
                  y="9"
                  width="4.5"
                  height="12"
                  rx="1"
                  fill="#3b5998"
                />
                <rect
                  x="9.5"
                  y="3"
                  width="4.5"
                  height="18"
                  rx="1"
                  fill="#ea2027"
                />
                <rect
                  x="17"
                  y="6"
                  width="4.5"
                  height="15"
                  rx="1"
                  fill="#fec310"
                />
              </svg>
            </div>
            <div className="cp-platform-info">
              <h3 className="cp-platform-name">Codeforces</h3>
              <span className="cp-username">
                {data.codeforces?.username ?? "Loading..."}
              </span>
            </div>
          </div>

          <div className="cp-card-body">
            <div className="cp-stats-list">
              <div className="cp-stat-row">
                <span className="cp-stat-label">Current Rating</span>
                <span className="cp-stat-value">
                  {data.codeforces?.currentRating ?? "--"}
                </span>
              </div>
              <div className="cp-stat-row">
                <span className="cp-stat-label">Maximum Rating</span>
                <span className="cp-stat-value">
                  {data.codeforces?.maxRating ?? "--"}
                </span>
              </div>
              <div className="cp-stat-row">
                <span className="cp-stat-label">Current Rank</span>
                <span className="cp-stat-value">
                  {data.codeforces?.currentRank ?? "--"}
                </span>
              </div>
              <div className="cp-stat-row">
                <span className="cp-stat-label">Highest Rank</span>
                <span className="cp-stat-value">
                  {data.codeforces?.highestRank ?? "--"}
                </span>
              </div>
              <div className="cp-stat-row">
                <span className="cp-stat-label">Total Problems Solved</span>
                <span className="cp-stat-value">
                  {data.codeforces?.totalSolved ?? "--"}
                </span>
              </div>
              <div className="cp-stat-row">
                <span className="cp-stat-label">Contests Participated</span>
                <span className="cp-stat-value">
                  {data.codeforces?.contestsAttended ?? "--"}
                </span>
              </div>
            </div>

            {data.errors.codeforces ? (
              <div className="fallback-note" style={{ marginBottom: "12px", fontSize: "12px", color: "#ff375f" }}>
                ⚠ {data.errors.codeforces}
              </div>
            ) : null}

            <a
              className="primary-link cp-action-btn-active"
              href={
                data.codeforces?.profileUrl ?? "https://codeforces.com/"
              }
              target="_blank"
              rel="noreferrer"
            >
              View Profile <ExternalLink size={13} />
            </a>
          </div>
        </Panel>

        {/* CodeChef Card */}
        <Panel className="cp-card">
          <div className="cp-card-header">
            <div className="cp-logo-container">
              <svg
                viewBox="0 0 24 24"
                width="26"
                height="26"
                fill="none"
                stroke="#b97a57"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  filter: "drop-shadow(0 0 6px rgba(185,122,87,0.5))",
                }}
              >
                <path d="M6 18V9a6 6 0 0 1 12 0v9" />
                <path d="M3 18h18a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z" />
                <path d="M9 11l-2 2 2 2" />
                <path d="M15 11l2 2-2 2" />
                <path d="M13 10l-2 6" />
              </svg>
            </div>
            <div className="cp-platform-info">
              <h3 className="cp-platform-name">CodeChef</h3>
              <span className="cp-username">
                {data.codechef?.username ?? "Loading..."}
              </span>
            </div>
          </div>

          <div className="cp-card-body">
            <div className="cp-stats-list">
              <div className="cp-stat-row">
                <span className="cp-stat-label">Current Rating</span>
                <span className="cp-stat-value">
                  {data.codechef?.currentRating ?? "--"}
                </span>
              </div>
              <div className="cp-stat-row">
                <span className="cp-stat-label">Highest Rating</span>
                <span className="cp-stat-value">
                  {data.codechef?.highestRating ?? "--"}
                </span>
              </div>
              <div className="cp-stat-row">
                <span className="cp-stat-label">Stars</span>
                <span className="cp-stat-value">
                  {data.codechef?.stars ?? "--"}
                </span>
              </div>
              <div className="cp-stat-row">
                <span className="cp-stat-label">Global Rank</span>
                <span className="cp-stat-value">
                  {data.codechef?.globalRank ?? "--"}
                </span>
              </div>
              <div className="cp-stat-row">
                <span className="cp-stat-label">Contests Participated</span>
                <span className="cp-stat-value">
                  {data.codechef?.contestsAttended ?? "--"}
                </span>
              </div>
            </div>

            {data.errors.codechef ? (
              <div className="fallback-note" style={{ marginBottom: "12px", fontSize: "12px", color: "#ff375f" }}>
                ⚠ {data.errors.codechef}
              </div>
            ) : null}

            <a
              className="primary-link cp-action-btn-active"
              href={data.codechef?.profileUrl ?? "https://codechef.com/"}
              target="_blank"
              rel="noreferrer"
            >
              View Profile <ExternalLink size={13} />
            </a>
          </div>
        </Panel>
      </div>
    </>
  );
}
