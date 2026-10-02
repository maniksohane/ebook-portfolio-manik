import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Code2, Lightbulb } from "lucide-react";
import Navbar from "../../components/Navbar";

export const metadata = {
  title: "About the Author | Ebooks by Manik!",
  description:
    "Meet Manikya Sohane, author of practical Microsoft Dynamics 365 CE and Power Platform guides.",
};

const authorFocus = [
  {
    icon: Lightbulb,
    title: "Practical learning",
    description:
      "Clear explanations built around real implementation challenges, not abstract theory.",
  },
  {
    icon: Code2,
    title: "Technical depth",
    description:
      "Guidance covering Dynamics 365 CE, Dataverse, Power Platform, integrations and development.",
  },
  {
    icon: BookOpen,
    title: "Useful references",
    description:
      "Books designed to remain useful during projects, troubleshooting and interview preparation.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#020304] text-white">
      <Navbar />

      <section className="px-5 pb-20 pt-32 sm:px-6 sm:pt-40">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-20">
          <div className="relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden rounded-[2.25rem] border border-white/10 bg-[#0a0d10] shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
            <Image
              src="/manikya-sohane-author.png"
              alt="Portrait of Manikya Sohane, author and Microsoft Dynamics 365 consultant"
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 420px"
              className="object-cover object-center"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
            <p className="absolute inset-x-5 bottom-6 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 sm:bottom-8 sm:text-xs sm:tracking-[0.24em]">
              Author · Technologist · Educator
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-500">
              About the Author
            </p>
            <h1 className="mt-6 text-5xl font-black leading-[0.98] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
              Manikya Sohane
            </h1>
            <p className="mt-7 max-w-2xl text-xl leading-8 text-white/70 sm:text-2xl sm:leading-9">
              Microsoft Dynamics 365 CE consultant and author focused on turning complex technical topics into practical, approachable learning.
            </p>
            <div className="mt-7 max-w-2xl space-y-5 text-base leading-7 text-white/50 sm:text-lg sm:leading-8">
              <p>
                My work spans Dynamics 365 CE, Dataverse, Power Platform, JavaScript customisation and Azure-based integrations. The books published here draw from that real-world experience.
              </p>
              <p>
                Each guide is written to help developers and consultants build confidence, understand the reasoning behind a solution and apply the learning in their own projects.
              </p>
            </div>

            <Link
              href="/ebooks"
              className="mt-9 inline-flex items-center gap-3 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-blue-500"
            >
              Explore the e-books
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-white/[0.07] px-5 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-500">
              Why I write
            </p>
            <h2 className="mt-5 text-3xl font-black tracking-[-0.035em] sm:text-5xl">
              Knowledge becomes valuable when it can be applied.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {authorFocus.map(({ icon: Icon, title, description }) => (
              <article key={title} className="rounded-3xl border border-white/10 bg-white/[0.025] p-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <Icon size={21} aria-hidden="true" />
                </div>
                <h3 className="mt-6 text-xl font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/45">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.07] px-5 py-8 text-center text-sm text-white/35 sm:px-6">
        © {new Date().getFullYear()} Ebooks by Manik! All rights reserved.
      </footer>
    </main>
  );
}
