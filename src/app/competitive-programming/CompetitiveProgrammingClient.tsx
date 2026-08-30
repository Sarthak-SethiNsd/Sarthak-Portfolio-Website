"use client";

import { Panel } from "@/components/Panel";
import { ExternalLink } from "lucide-react";
import type { CompetitiveProgrammingData } from "@/lib/cp/types";
import { refreshCPData } from "@/lib/cp/actions";
import { useState, useEffect } from "react";

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
  data: initialData,
}: CompetitiveProgrammingClientProps) {
  const [cpData, setCpData] = useState<CompetitiveProgrammingData>(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize cooldown dynamically from the initial fetchedAt timestamp
  const [cooldownRemainingMs, setCooldownRemainingMs] = useState<number>(() => {
    const hasErrors = Object.keys(initialData.errors).length > 0;
    if (!hasErrors && initialData.fetchedAt) {
      const fetchedTime = new Date(initialData.fetchedAt).getTime();
      const elapsed = Date.now() - fetchedTime;
      const COOLDOWN_DURATION = 5 * 60 * 1000;
      return elapsed < COOLDOWN_DURATION ? COOLDOWN_DURATION - elapsed : 0;
    }
    return 0;
  });

  // Set up timer for cooldown tick
  useEffect(() => {
    if (cooldownRemainingMs <= 0) return;

    const timer = setInterval(() => {
      setCooldownRemainingMs((prev) => {
        if (prev <= 1000) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownRemainingMs]);

  const handleRefresh = async () => {
    if (isRefreshing || cooldownRemainingMs > 0) return;

    setIsRefreshing(true);
    setErrorMsg(null);

    try {
      const res = await refreshCPData();
      if (res.cooldownActive && res.remainingMs) {
        setCooldownRemainingMs(res.remainingMs);
        if (res.data) {
          setCpData(res.data);
        }
      } else if (res.success && res.data) {
        setCpData(res.data);
        setCooldownRemainingMs(5 * 60 * 1000); // 5 minutes cooldown
        setErrorMsg(null);
      } else {
        if (res.data) {
          setCpData(res.data);
        }
        setErrorMsg(res.error || "An error occurred during refresh.");
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to refresh data.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatCooldown = (ms: number): string => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes > 0) {
      return `${minutes} minute${minutes !== 1 ? "s" : ""} ${seconds} second${seconds !== 1 ? "s" : ""}`;
    }
    return `${seconds} second${seconds !== 1 ? "s" : ""}`;
  };

  // Map state to the existing code's expected variable name
  const data = cpData;

  /* Derive summary stats from available platform data */
  const totalSolved =
    (data.codeforces?.totalSolved ?? 0) +
    (data.leetcode?.totalSolved ?? 0) +
    (data.codechef?.totalSolved ?? 0) +
    (data.gfg?.totalSolved ?? 0);
  const hasSolvedData = Boolean(
    data.codeforces || data.leetcode || data.codechef || data.gfg,
  );


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
        gfg: "GeeksforGeeks",
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
          <div className="cp-summary-stat synced" style={{ position: "relative" }}>
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
            <div style={{ marginTop: "12px" }}>
              <button
                className="primary-link"
                style={{
                  padding: "6px 12px",
                  fontSize: "12px",
                  border: "1px solid rgba(69,225,216,.3)",
                  borderRadius: "6px",
                  background: "rgba(69,225,216,.04)",
                  cursor: isRefreshing || cooldownRemainingMs > 0 ? "not-allowed" : "pointer",
                  opacity: isRefreshing || cooldownRemainingMs > 0 ? 0.6 : 1,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "var(--cyan)",
                  fontFamily: "var(--font-mono)",
                }}
                disabled={isRefreshing || cooldownRemainingMs > 0}
                onClick={handleRefresh}
              >
                {isRefreshing ? (
                  <>
                    <svg
                      style={{
                        animation: "spin 1s linear infinite",
                        width: "12px",
                        height: "12px",
                      }}
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        style={{ opacity: 0.25 }}
                      ></circle>
                      <path
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        style={{ opacity: 0.75 }}
                      ></path>
                    </svg>
                    Refreshing...
                  </>
                ) : (
                  "Refresh Data"
                )}
              </button>
            </div>
            {cooldownRemainingMs > 0 && (
              <div
                style={{
                  fontSize: "11px",
                  color: "#888",
                  marginTop: "8px",
                  fontFamily: "var(--font-mono)",
                  lineHeight: "1.4",
                }}
              >
                Data recently refreshed. Retry in{" "}
                <span style={{ color: "var(--cyan)" }}>
                  {formatCooldown(cooldownRemainingMs)}
                </span>
                .
              </div>
            )}
            {errorMsg && (
              <div
                style={{
                  fontSize: "11px",
                  color: "#ff375f",
                  marginTop: "8px",
                  fontFamily: "var(--font-mono)",
                  lineHeight: "1.4",
                }}
              >
                ⚠ {errorMsg}
              </div>
            )}
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
                <span className="cp-stat-label">Total Problems Solved</span>
                <span className="cp-stat-value">
                  {data.codechef?.totalSolved ?? "--"}
                </span>
              </div>
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

        {/* GeeksforGeeks Card */}
        <Panel className="cp-card">
          <div className="cp-card-header">
            <div className="cp-logo-container" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                width="30"
                height="30"
                fill="none"
                stroke="#2f8d46"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  filter: "drop-shadow(0 0 6px rgba(47,141,70,0.5))",
                }}
              >
                <path d="M3 8h8a4 4 0 1 1-4 4H3" />
                <path d="M21 8h-8a4 4 0 1 0 4 4h4" />
              </svg>
            </div>
            <div className="cp-platform-info">
              <h3 className="cp-platform-name">GeeksforGeeks</h3>
              <span className="cp-username">
                {data.gfg?.username ?? "Loading..."}
              </span>
            </div>
          </div>

          <div className="cp-card-body">
            <div className="cp-stats-list">
              <div className="cp-stat-row">
                <span className="cp-stat-label">Total Problems Solved</span>
                <span className="cp-stat-value">
                  {data.gfg?.totalSolved ?? "--"}
                </span>
              </div>
            </div>

            <a
              className="primary-link cp-action-btn-active"
              href={data.gfg?.profileUrl ?? "https://www.geeksforgeeks.org/"}
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
