import { PageIntro } from "@/components/PageIntro";
import { Panel } from "@/components/Panel";
import { ExternalLink } from "lucide-react";

export const metadata = { title: "Competitive Programming" };

const COMPETITIVE_PROGRAMMING_DATA = {
  summary: {
    totalSolved: "--",
    totalContests: "--",
    platformsConnected: "LeetCode, Codeforces, CodeChef",
    lastSynced: "Loading...",
  },
  leetcode: {
    username: "Loading...",
    totalSolved: "--",
    easySolved: "--",
    mediumSolved: "--",
    hardSolved: "--",
    contestRating: "--",
    profileUrl: "https://leetcode.com/",
  },
  codeforces: {
    username: "Loading...",
    currentRating: "--",
    maxRating: "--",
    currentRank: "--",
    highestRank: "--",
    totalSolved: "--",
    profileUrl: "https://codeforces.com/",
  },
  codechef: {
    username: "Loading...",
    currentRating: "--",
    highestRating: "--",
    stars: "--",
    globalRank: "--",
    profileUrl: "https://codechef.com/",
  },
};

export default function CompetitiveProgrammingPage() {
  const data = COMPETITIVE_PROGRAMMING_DATA;

  return (
    <>
      <PageIntro
        description="Live coding profiles, ratings, and problem-solving progress."
        eyebrow="Coding metrics · 04"
        title="Competitive Programming"
      />

      {/* Summary Card Dashboard */}
      <Panel className="cp-summary-panel" title="Competitive Programming Summary">
        <div className="cp-summary-dashboard">
          <div className="cp-summary-stat">
            <div className="cp-summary-label">Total Solved</div>
            <div className="cp-summary-value">{data.summary.totalSolved}</div>
          </div>
          <div className="cp-summary-stat contests">
            <div className="cp-summary-label">Total Contests</div>
            <div className="cp-summary-value">{data.summary.totalContests}</div>
          </div>
          <div className="cp-summary-stat platforms">
            <div className="cp-summary-label">Platforms Connected</div>
            <div className="cp-summary-value" style={{ fontSize: "14px", marginTop: "4px", fontFamily: "var(--font-mono)", color: "var(--green)" }}>
              {data.summary.platformsConnected}
            </div>
          </div>
          <div className="cp-summary-stat synced">
            <div className="cp-summary-label">Last Synced</div>
            <div className="cp-summary-value" style={{ fontSize: "14px", marginTop: "4px", fontFamily: "var(--font-mono)" }}>
              {data.summary.lastSynced}
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
              {/* LeetCode SVG Logo */}
              <svg viewBox="0 0 24 24" width="26" height="26" fill="#ffa116" style={{ filter: "drop-shadow(0 0 6px rgba(255,161,22,0.6))" }}>
                <path d="M16.102 17.93l-2.69 2.607c-.466.452-1.111.987-2.03.987-.918 0-1.564-.535-2.03-.987l-2.69-2.607c-.466-.452-.904-1.398-.904-2.316 0-.918.438-1.864.904-2.316l2.69-2.607c.466-.452 1.111-.987 2.03-.987.918 0 1.564.535 2.03.987l2.69 2.607c.466.452.904 1.398.904 2.316 0 .918-.438 1.864-.904 2.316zm-5.412-5.412l-1.345 1.303c-.233.226-.452.699-.452 1.158 0 .459.219.932.452 1.158l1.345 1.303c.233.226.555.493.974.493.419 0 .741-.267.974-.493l1.345-1.303c.233-.226.452-.699.452-1.158 0-.459-.219-.932-.452-1.158l-1.345-1.303c-.233-.226-.555-.493-.974-.493-.419 0-.741.267-.974.493zm6.757-6.545l-1.345 1.303c-.233.226-.452.699-.452 1.158 0 .459.219.932.452 1.158l1.345 1.303c.233.226.555.493.974.493.419 0 .741-.267.974-.493l1.345-1.303c.233-.226.452-.699.452-1.158 0-.459-.219-.932-.452-1.158l-1.345-1.303c-.233-.226-.555-.493-.974-.493-.419 0-.741.267-.974.493z" />
              </svg>
            </div>
            <div className="cp-platform-info">
              <h3 className="cp-platform-name">LeetCode</h3>
              <span className="cp-username">{data.leetcode.username}</span>
            </div>
          </div>

          <div className="cp-card-body">
            <div className="cp-stats-list">
              <div className="cp-stat-row">
                <span className="cp-stat-label">Total Problems Solved</span>
                <span className="cp-stat-value">{data.leetcode.totalSolved}</span>
              </div>

              <div className="cp-difficulty-box">
                <div className="cp-difficulty-row">
                  <span className="cp-diff-label easy">Easy Solved</span>
                  <div className="cp-progress-bg">
                    <div className="cp-progress-bar easy" style={{ width: "0%" }}></div>
                  </div>
                  <span className="cp-diff-val">{data.leetcode.easySolved}</span>
                </div>
                <div className="cp-difficulty-row">
                  <span className="cp-diff-label medium">Medium Solved</span>
                  <div className="cp-progress-bg">
                    <div className="cp-progress-bar medium" style={{ width: "0%" }}></div>
                  </div>
                  <span className="cp-diff-val">{data.leetcode.mediumSolved}</span>
                </div>
                <div className="cp-difficulty-row">
                  <span className="cp-diff-label hard">Hard Solved</span>
                  <div className="cp-progress-bg">
                    <div className="cp-progress-bar hard" style={{ width: "0%" }}></div>
                  </div>
                  <span className="cp-diff-val">{data.leetcode.hardSolved}</span>
                </div>
              </div>

              <div className="cp-stat-row">
                <span className="cp-stat-label">Contest Rating</span>
                <span className="cp-stat-value">{data.leetcode.contestRating}</span>
              </div>
            </div>

            <a className="primary-link cp-action-btn-active" href={data.leetcode.profileUrl} target="_blank" rel="noreferrer">
              View Profile <ExternalLink size={13} />
            </a>
          </div>
        </Panel>

        {/* Codeforces Card */}
        <Panel className="cp-card">
          <div className="cp-card-header">
            <div className="cp-logo-container">
              {/* Codeforces Logo */}
              <svg viewBox="0 0 24 24" width="26" height="26" style={{ filter: "drop-shadow(0 0 6px rgba(234,32,39,0.4))" }}>
                <rect x="2" y="9" width="4.5" height="12" rx="1" fill="#3b5998" />
                <rect x="9.5" y="3" width="4.5" height="18" rx="1" fill="#ea2027" />
                <rect x="17" y="6" width="4.5" height="15" rx="1" fill="#fec310" />
              </svg>
            </div>
            <div className="cp-platform-info">
              <h3 className="cp-platform-name">Codeforces</h3>
              <span className="cp-username">{data.codeforces.username}</span>
            </div>
          </div>

          <div className="cp-card-body">
            <div className="cp-stats-list">
              <div className="cp-stat-row">
                <span className="cp-stat-label">Current Rating</span>
                <span className="cp-stat-value">{data.codeforces.currentRating}</span>
              </div>
              <div className="cp-stat-row">
                <span className="cp-stat-label">Maximum Rating</span>
                <span className="cp-stat-value">{data.codeforces.maxRating}</span>
              </div>
              <div className="cp-stat-row">
                <span className="cp-stat-label">Current Rank</span>
                <span className="cp-stat-value">{data.codeforces.currentRank}</span>
              </div>
              <div className="cp-stat-row">
                <span className="cp-stat-label">Highest Rank</span>
                <span className="cp-stat-value">{data.codeforces.highestRank}</span>
              </div>
              <div className="cp-stat-row">
                <span className="cp-stat-label">Total Problems Solved</span>
                <span className="cp-stat-value">{data.codeforces.totalSolved}</span>
              </div>
            </div>

            <a className="primary-link cp-action-btn-active" href={data.codeforces.profileUrl} target="_blank" rel="noreferrer">
              View Profile <ExternalLink size={13} />
            </a>
          </div>
        </Panel>

        {/* CodeChef Card */}
        <Panel className="cp-card">
          <div className="cp-card-header">
            <div className="cp-logo-container">
              {/* CodeChef Chef Hat SVG */}
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#b97a57" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 6px rgba(185,122,87,0.5))" }}>
                <path d="M6 18V9a6 6 0 0 1 12 0v9" />
                <path d="M3 18h18a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z" />
                <path d="M9 11l-2 2 2 2" />
                <path d="M15 11l2 2-2 2" />
                <path d="M13 10l-2 6" />
              </svg>
            </div>
            <div className="cp-platform-info">
              <h3 className="cp-platform-name">CodeChef</h3>
              <span className="cp-username">{data.codechef.username}</span>
            </div>
          </div>

          <div className="cp-card-body">
            <div className="cp-stats-list">
              <div className="cp-stat-row">
                <span className="cp-stat-label">Current Rating</span>
                <span className="cp-stat-value">{data.codechef.currentRating}</span>
              </div>
              <div className="cp-stat-row">
                <span className="cp-stat-label">Highest Rating</span>
                <span className="cp-stat-value">{data.codechef.highestRating}</span>
              </div>
              <div className="cp-stat-row">
                <span className="cp-stat-label">Stars</span>
                <span className="cp-stat-value">{data.codechef.stars}</span>
              </div>
              <div className="cp-stat-row">
                <span className="cp-stat-label">Global Rank</span>
                <span className="cp-stat-value">{data.codechef.globalRank}</span>
              </div>
            </div>

            <a className="primary-link cp-action-btn-active" href={data.codechef.profileUrl} target="_blank" rel="noreferrer">
              View Profile <ExternalLink size={13} />
            </a>
          </div>
        </Panel>
      </div>
    </>
  );
}
