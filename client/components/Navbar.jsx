"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="flex items-center gap-3 text-sm font-black tracking-[0.16em]"
        >
          <span className="grid grid-cols-2 gap-[2px]">
            <span className="h-2.5 w-2.5 bg-[#f25022]" />
            <span className="h-2.5 w-2.5 bg-[#7fba00]" />
            <span className="h-2.5 w-2.5 bg-[#00a4ef]" />
            <span className="h-2.5 w-2.5 bg-[#ffb900]" />
          </span>

          MANIKYA SOHANE
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="#about"
            className="text-sm text-white/55 transition hover:text-white"
          >
            About
          </Link>

          <Link
            href="#expertise"
            className="text-sm text-white/55 transition hover:text-white"
          >
            Expertise
          </Link>

          <Link
            href="#experience"
            className="text-sm text-white/55 transition hover:text-white"
          >
            Experience
          </Link>

          <Link
            href="#projects"
            className="text-sm text-white/55 transition hover:text-white"
          >
            Projects
          </Link>

          <Link
            href="#contact"
            className="text-sm text-white/55 transition hover:text-white"
          >
            Contact
          </Link>

          <Link
            href="/ebooks"
            className="flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold transition hover:border-blue-500 hover:bg-blue-500 hover:text-white"
          >
            <BookOpen size={16} />
            E-Books
          </Link>
        </div>
      </div>
    </nav>
  );
}
