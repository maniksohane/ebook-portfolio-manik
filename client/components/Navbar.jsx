"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

const navigation = [
  { label: "About the Author", href: "/about" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 md:py-5">
        <Link
          href="/"
          onClick={() => setMenuOpen(false)}
          className="flex min-w-0 items-center gap-2.5 whitespace-nowrap text-xs font-black tracking-[0.12em] sm:gap-3 sm:text-sm sm:tracking-[0.16em]"
        >
          <span className="grid grid-cols-2 gap-[2px]">
            <span className="h-2 w-2 bg-[#f25022] sm:h-2.5 sm:w-2.5" />
            <span className="h-2 w-2 bg-[#7fba00] sm:h-2.5 sm:w-2.5" />
            <span className="h-2 w-2 bg-[#00a4ef] sm:h-2.5 sm:w-2.5" />
            <span className="h-2 w-2 bg-[#ffb900] sm:h-2.5 sm:w-2.5" />
          </span>

          <span className="sm:hidden">MANIKYA</span>
          <span className="hidden sm:inline">MANIKYA PUBLISHING</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className={`text-sm transition hover:text-white ${
                pathname === item.href ? "text-white" : "text-white/55"
              }`}
            >
              {item.label}
            </Link>
          ))}

          <Link
            href="/ebooks"
            aria-current={pathname === "/ebooks" ? "page" : undefined}
            className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition hover:border-blue-500 hover:bg-blue-500 hover:text-white ${
              pathname === "/ebooks"
                ? "border-blue-500 bg-blue-500 text-white"
                : "border-white/15"
            }`}
          >
            <BookOpen size={16} />
            E-Books
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2 md:hidden">
          <Link
            href="/ebooks"
            onClick={() => setMenuOpen(false)}
            aria-current={pathname === "/ebooks" ? "page" : undefined}
            className={`flex h-10 items-center gap-2 rounded-full border px-3 text-xs font-bold transition active:scale-[0.98] min-[400px]:px-4 ${
              pathname === "/ebooks"
                ? "border-blue-500 bg-blue-500 text-white"
                : "border-blue-500/45 bg-blue-500/10 text-blue-300"
            }`}
            aria-label="Browse E-Books"
          >
            <BookOpen size={16} aria-hidden="true" />
            <span className="hidden min-[400px]:inline">E-Books</span>
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white transition hover:border-white/30 hover:bg-white/[0.08]"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div
        id="mobile-navigation"
        className={`overflow-hidden border-t bg-[#050607]/95 transition-[max-height,opacity] duration-300 md:hidden ${
          menuOpen
            ? "max-h-[420px] border-white/10 opacity-100"
            : "max-h-0 border-transparent opacity-0"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          {navigation.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              aria-current={pathname === item.href ? "page" : undefined}
              className="group flex min-h-12 items-center justify-between border-b border-white/[0.07] py-3 text-sm font-semibold text-white/75 transition last:border-b-0 hover:text-white"
            >
              <span>{item.label}</span>
              <span className="text-[10px] font-bold tracking-[0.18em] text-blue-500/65 transition group-hover:text-blue-400">
                {String(index + 1).padStart(2, "0")}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
