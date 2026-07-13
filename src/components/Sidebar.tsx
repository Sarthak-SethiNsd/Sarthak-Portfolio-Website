"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/about", label: "About", short: "01" },
  { href: "/education-certifications", label: "Education & Certifications", short: "02" },
  { href: "/projects", label: "Projects", short: "03" },
  { href: "/competitive-programming", label: "Competitive Programming", short: "04" },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav aria-label="Primary navigation" className="nav-list">
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link className={`nav-link ${active ? "nav-link-active" : ""}`} href={link.href} key={link.href} onClick={() => setOpen(false)}>
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
      <button aria-expanded={open} aria-label={open ? "Close navigation" : "Open navigation"} className="menu-button" onClick={() => setOpen((value) => !value)} type="button">
        {open ? <X /> : <Menu />}
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div animate={{ opacity: 1, x: 0 }} className="mobile-menu" exit={{ opacity: 0, x: -24 }} initial={{ opacity: 0, x: -24 }}>
            {nav}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
