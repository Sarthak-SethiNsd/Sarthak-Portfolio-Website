"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/about", label: "About", short: "01" },
  { href: "/education-certifications", label: "Education & Certifications", short: "02" },
  { href: "/competitive-programming", label: "Competitive Programming", short: "03" },
  { href: "/projects", label: "Projects", short: "04" },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const nav = (
    <nav aria-label="Primary navigation" className="nav-list">
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link className={`nav-link ${active ? "nav-link-active" : ""}`} href={link.href} key={link.href}>
            <span aria-hidden="true">{link.short}</span>
            <strong>{link.label}</strong>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <aside className="sidebar">{nav}</aside>
      <div className="mobile-navigation">{nav}</div>
    </>
  );
}
