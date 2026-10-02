"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { getEbooks } from "../lib/api";
import EbookCard from "./EbookCard";

export default function EbookShowcase({ showAll = false }) {
  const [ebooks, setEbooks] = useState([]);
  const [status, setStatus] = useState("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    setStatus("loading");
    getEbooks({ signal: controller.signal })
      .then((response) => {
        if (!active) return;
        setEbooks(response.ebooks);
        setStatus("ready");
      })
      .catch(() => { if (active) setStatus("error"); })
      .finally(() => clearTimeout(timer));
    return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, [attempt]);

  return (
    <section className="w-full">
      <div className="mx-auto max-w-7xl">
        {/* Personal introduction */}
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-500">
              FROM ONE LEARNER TO ANOTHER
            </p>

            <h2 className="mt-7 max-w-4xl text-4xl font-black leading-[1.02] tracking-[-0.045em] md:text-6xl">
              I wrote the guides I{" "}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
                wish I had
              </span>
              {" "}when I started.
            </h2>

            <p className="mt-6 max-w-2xl text-base leading-7 text-white/45 md:text-lg">
              Less time wondering where to begin. More time understanding why
              things work, how they connect and what to learn next in Dynamics
              365 and Power Platform.
            </p>
          </div>

          {!showAll && <a
            href="/ebooks"
            className="
              group
              inline-flex
              w-fit
              items-center
              gap-2
              rounded-xl
              border
              border-white/[0.12]
              px-5
              py-3
              text-sm
              font-bold
              text-white/70
              transition-all
              duration-300
              hover:border-blue-500/40
              hover:bg-white/[0.04]
              hover:text-white
            "
          >
            View All E-Books

            <ArrowUpRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>}
        </div>

        {/* A note from the author */}
        <div className="relative mt-12 overflow-hidden rounded-[28px] border border-blue-500/15 bg-[#080c12] p-7 md:p-9">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
          <span aria-hidden="true" className="pointer-events-none absolute right-7 top-1 text-8xl font-black leading-none text-white/[0.035] md:right-10 md:text-9xl">
            “
          </span>

          <div className="relative grid gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-center lg:gap-12">
            <div className="flex items-start gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                <BookOpen size={21} aria-hidden="true" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
                  A note from Manik
                </p>
                <p className="mt-3 max-w-3xl text-base leading-7 text-white/70 md:text-lg md:leading-8">
                  Every book begins with a problem I once struggled with—or one
                  I later solved for a client. I turn those lessons into a clear
                  path, so you can spend less time connecting scattered dots and
                  more time building with confidence.
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/30">
                The journey inside
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold text-white/65">
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">Start with why</span>
                <span aria-hidden="true" className="text-blue-400/60">→</span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">Connect the dots</span>
                <span aria-hidden="true" className="text-blue-400/60">→</span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">Build</span>
                <span aria-hidden="true" className="text-blue-400/60">→</span>
                <span className="rounded-full border border-blue-500/25 bg-blue-500/10 px-3 py-2 text-blue-300">Solve</span>
              </div>
              <p className="mt-5 text-xs leading-5 text-white/30">
                Written from experience. Shared in the hope that it helps.
              </p>
            </div>
          </div>

          <div className="relative mt-8 flex flex-col gap-5 border-t border-white/[0.07] pt-7 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-3xl text-sm leading-6 text-white/50">
              <span className="font-bold text-white/80">Working on something interesting?</span>{" "}
              Feel free to reach out if you are exploring an exciting development,
              untangling a challenging solution, or simply looking for guidance.
              I am always happy to exchange ideas and help where I can.
            </p>
            <a
              href="mailto:maniksohane@gmail.com?subject=Let%27s%20talk%20about%20a%20Dynamics%20365%20challenge"
              className="group inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border border-blue-500/25 bg-blue-500/10 px-5 py-3 text-sm font-bold text-blue-300 transition hover:border-blue-400/50 hover:bg-blue-500/15 hover:text-white"
            >
              Start a conversation
              <ArrowUpRight
                size={16}
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
          </div>
        </div>

        {/* Ebook cards */}
        {status === "loading" ? (
          <p role="status" className="mt-8 rounded-3xl border border-white/10 p-10 text-center text-white/60">Loading ebooks...</p>
        ) : status === "error" ? (
          <div role="alert" className="mt-8 rounded-3xl border border-amber-400/20 p-10 text-center">
            <p className="text-white/80">We couldn't load the ebooks right now.</p>
            <p className="mt-2 text-sm text-white/50">Please check your connection and try again.</p>
            <button type="button" onClick={() => setAttempt((value) => value + 1)} className="mt-5 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black">Try again</button>
          </div>
        ) : ebooks.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(showAll ? ebooks : ebooks.slice(0, 3)).map((ebook) => (
              <EbookCard key={ebook.id} ebook={ebook} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-[26px] border border-dashed border-white/[0.10] bg-white/[0.015] px-6 py-16 text-center">
            <BookOpen
              size={28}
              className="mx-auto text-white/20"
            />

            <p className="mt-5 text-lg font-bold text-white/70">
              New technical publications are coming soon.
            </p>

            <p className="mt-2 text-sm text-white/35">
              New releases will appear here as soon as they are published.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
