import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { Sidebar } from "@/components/Sidebar";
import "./globals.css";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: { default: "Neon Portfolio", template: "%s · Neon Portfolio" },
  description: "A content-driven portfolio and project archive.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html className={`${geistSans.variable} ${geistMono.variable}`} lang="en">
      <body>
        <div className="ambient-grid" aria-hidden="true" />
        <header className="site-header">
          <div>
            <span className="signal-dot" aria-hidden="true" />
            <strong>Sarthak Sethi</strong>
          </div>
          <p>PORTFOLIO / BUILD LOG</p>
        </header>
        <div className="app-shell">
          <Sidebar />
          <main className="main-content">{children}</main>
        </div>
      </body>
    </html>
  );
}
