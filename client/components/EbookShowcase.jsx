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
        {/* Header */}
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-500">
              E-BOOK STORE
            </p>

            <h2 className="mt-7 max-w-4xl text-4xl font-black leading-[1.02] tracking-[-0.045em] md:text-6xl">
              Practical knowledge,{" "}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
                written to be used.
              </span>
            </h2>

            <p className="mt-6 max-w-2xl text-base leading-7 text-white/45 md:text-lg">
              Practical technical guides based on real-world Microsoft
              Dynamics 365 CE, CRM and enterprise development experience.
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

        {/* Publishing statement */}
        <div className="mt-12 rounded-[26px] border border-white/[0.08] bg-[#0a0d10] p-7 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
                <BookOpen size={21} />
              </div>

              <div>
                <p className="font-bold text-white">
                  Technical guidance grounded in real-world experience.
                </p>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-white/40">
                  Explore technical resources created to help developers and
                  consultants understand Dynamics 365 CE beyond configuration
                  screens and documentation.
                </p>
              </div>
            </div>

            <span className="hidden text-xs font-bold uppercase tracking-[0.18em] text-white/20 md:block">
              MANIKYA · PUBLISHING
            </span>
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
