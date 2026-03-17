"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearToken, getToken } from "../lib/auth";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services/vps", label: "VPS Hosting" },
  { href: "/services/games", label: "Game Servers" },
  { href: "/services/web-hosting", label: "Web Hosting" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/admin", label: "Admin" }
];

export default function Navbar() {
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(Boolean(getToken()));
  }, []);

  const handleLogout = () => {
    clearToken();
    setHasToken(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-secondary/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-xl tracking-tight text-white">
          Hostnay
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-slate-200 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="link-underline hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {hasToken ? (
            <button
              onClick={handleLogout}
              className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/60 hover:text-white"
            >
              Sign Out
            </button>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/60 hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/60 hover:text-white"
              >
                Register
              </Link>
            </>
          )}
          <Link
            href={hasToken ? "/dashboard" : "/auth/register"}
            className="glow-button rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white transition hover:scale-105"
          >
            {hasToken ? "Dashboard" : "Get Started"}
          </Link>
        </div>
      </div>
    </header>
  );
}
