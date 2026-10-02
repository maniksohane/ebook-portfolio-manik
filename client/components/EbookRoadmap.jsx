"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Blocks,
  BookOpenCheck,
  BrainCircuit,
  ChartNoAxesCombined,
  Database,
  Headphones,
  MapPinned,
  Network,
  Sparkles,
} from "lucide-react";

const roadmap = [
  {
    number: "01",
    title: "Beginner Foundations",
    description:
      "Learn business processes, environments, data concepts and the Microsoft business applications ecosystem.",
    topics: ["D365 basics", "Cloud concepts", "Business processes"],
    icon: Sparkles,
  },
  {
    number: "02",
    title: "Power Apps Essentials",
    description:
      "Build confidence with model-driven apps, canvas apps, Dataverse, forms, views and basic automation.",
    topics: ["Power Apps", "Dataverse", "Power Automate"],
    icon: Blocks,
  },
  {
    number: "03",
    title: "Customisation",
    description:
      "Shape the platform with tables, relationships, business rules, JavaScript, plugins and PCF controls.",
    topics: ["JavaScript", "Plugins", "PCF"],
    icon: BrainCircuit,
  },
  {
    number: "04",
    title: "CE Core Platform",
    description:
      "Master security roles, solution management, ALM, integrations and reusable platform architecture.",
    topics: ["Security", "Solutions", "ALM"],
    icon: Database,
  },
  {
    number: "05",
    title: "Customer Insights",
    description:
      "Understand customer data, segments, journeys, event triggers, orchestration and personalisation.",
    topics: ["Data", "Journeys", "Segments"],
    icon: ChartNoAxesCombined,
  },
  {
    number: "06",
    title: "Dynamics 365 Sales",
    description:
      "Work with leads, opportunities, forecasting, sequences, relationship selling and sales automation.",
    topics: ["Leads", "Opportunities", "Forecasting"],
    icon: BookOpenCheck,
  },
  {
    number: "07",
    title: "Dynamics 365 Field Service",
    description:
      "Manage work orders, assets, resources, scheduling, inspections and the mobile technician experience.",
    topics: ["Work orders", "Scheduling", "Assets"],
    icon: MapPinned,
  },
  {
    number: "08",
    title: "Dynamics 365 Customer Service",
    description:
      "Design case management, queues, SLAs, knowledge, routing and omnichannel service experiences.",
    topics: ["Cases", "SLAs", "Omnichannel"],
    icon: Headphones,
  },
  {
    number: "09",
    title: "Solution Architect",
    description:
      "Bring everything together through discovery, architecture, governance, security and delivery strategy.",
    topics: ["Architecture", "Governance", "Delivery"],
    icon: Network,
  },
];

const desktopPositions = [
  "md:col-start-1 md:row-start-1",
  "md:col-start-2 md:row-start-1",
  "md:col-start-3 md:row-start-1",
  "md:col-start-3 md:row-start-2",
  "md:col-start-2 md:row-start-2",
  "md:col-start-1 md:row-start-2",
  "md:col-start-1 md:row-start-3",
  "md:col-start-2 md:row-start-3",
  "md:col-start-3 md:row-start-3",
];

const mobileMarkerPositions = [
  "left-0",
  "left-3",
  "left-1",
  "left-4",
  "left-1",
  "left-3",
  "left-0",
  "left-3",
  "left-1",
];

export default function EbookRoadmap() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="roadmap-heading"
      className="relative overflow-hidden border-b border-white/[0.07] px-5 pb-20 pt-32 sm:px-6 sm:pb-24 sm:pt-40"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[520px] max-w-5xl bg-[radial-gradient(circle_at_50%_15%,rgba(59,130,246,0.14),transparent_65%)]" />

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-300">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.9)]" />
            Dynamics 365 learning roadmap
          </div>

          <h1
            id="roadmap-heading"
            className="mt-7 text-4xl font-black leading-[1.02] tracking-[-0.05em] sm:text-6xl lg:text-7xl"
          >
            From your first app to{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
              solution architect.
            </span>
          </h1>

          <p className="mt-6 max-w-3xl text-base leading-7 text-white/50 sm:text-lg sm:leading-8">
            Follow the complete Microsoft Dynamics 365 CE journey—starting with
            Power Apps fundamentals and progressing through customisation,
            business applications and enterprise solution architecture.
          </p>
        </motion.div>

        <div className="relative mt-14 hidden md:block">
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
            viewBox="0 0 900 1060"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="desktop-roadmap-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="52%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <path
              d="M 145 30 C 250 -10, 350 -10, 450 30 S 650 70, 755 30 C 875 20, 885 330, 755 365 C 650 405, 550 325, 450 365 S 250 405, 145 365 C 15 390, 20 700, 145 730 C 250 770, 350 690, 450 730 S 650 770, 755 730"
              fill="none"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="9"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
            />
            <motion.path
              d="M 145 30 C 250 -10, 350 -10, 450 30 S 650 70, 755 30 C 875 20, 885 330, 755 365 C 650 405, 550 325, 450 365 S 250 405, 145 365 C 15 390, 20 700, 145 730 C 250 770, 350 690, 450 730 S 650 770, 755 730"
              fill="none"
              stroke="url(#desktop-roadmap-gradient)"
              strokeWidth="4"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              initial={reduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, amount: 0.12 }}
              transition={{ duration: 2.1, ease: [0.22, 1, 0.36, 1] }}
              className="drop-shadow-[0_0_10px_rgba(99,102,241,0.7)]"
            />
          </svg>

          <div className="relative grid grid-cols-3 gap-x-10 gap-y-20 pb-10 pt-2">
            {roadmap.map((stage, index) => {
              const Icon = stage.icon;

              return (
                <motion.article
                  key={stage.number}
                  initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.5,
                    delay: reduceMotion ? 0 : index * 0.07,
                    ease: "easeOut",
                  }}
                  className={`group relative pt-8 ${desktopPositions[index]}`}
                >
                  <motion.div
                    whileHover={reduceMotion ? undefined : { scale: 1.08, rotate: 3 }}
                    className="absolute left-1/2 top-0 z-20 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-2xl border border-blue-400/45 bg-[#07101c] text-blue-300 shadow-[0_0_24px_rgba(59,130,246,0.22)]"
                  >
                    <Icon size={23} aria-hidden="true" />
                  </motion.div>

                  <div className="relative min-h-[285px] overflow-hidden rounded-3xl border border-white/[0.09] bg-[#090c10]/95 px-7 pb-7 pt-12 transition-colors group-hover:border-blue-400/35">
                    <div className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-blue-500/[0.04] blur-3xl transition-colors group-hover:bg-blue-500/[0.10]" />
                    <div className="relative">
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-400/75">
                        Stage {stage.number}
                      </p>
                      <h2 className="mt-3 text-2xl font-bold tracking-tight text-white">
                        {stage.title}
                      </h2>
                      <p className="mt-3 text-sm leading-6 text-white/45">
                        {stage.description}
                      </p>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {stage.topics.map((topic) => (
                          <span
                            key={topic}
                            className="rounded-lg border border-white/[0.08] bg-white/[0.025] px-2.5 py-1.5 text-[11px] font-medium text-white/45"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>

        <div className="relative mt-10 md:hidden">
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute bottom-6 left-0 top-6 h-[calc(100%_-_3rem)] w-14 overflow-visible"
            viewBox="0 0 56 900"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="mobile-roadmap-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="55%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <path
              d="M 18 0 C 52 70, 2 140, 32 220 S 54 360, 22 440 S 0 590, 34 670 S 52 820, 22 900"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="8"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
            />
            <motion.path
              d="M 18 0 C 52 70, 2 140, 32 220 S 54 360, 22 440 S 0 590, 34 670 S 52 820, 22 900"
              fill="none"
              stroke="url(#mobile-roadmap-gradient)"
              strokeWidth="3"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              initial={reduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, amount: 0.08 }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>

          <div className="space-y-6 pl-16">
            {roadmap.map((stage, index) => {
              const Icon = stage.icon;

              return (
                <motion.article
                  key={stage.number}
                  initial={reduceMotion ? false : { opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.22 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="group relative rounded-3xl border border-white/[0.09] bg-[#090c10]/95 p-6"
                >
                  <div className={`absolute top-7 flex h-10 w-10 -translate-x-[64px] items-center justify-center rounded-full border border-blue-400/45 bg-[#07101c] text-blue-300 shadow-[0_0_18px_rgba(59,130,246,0.2)] ${mobileMarkerPositions[index]}`}>
                    <Icon size={18} aria-hidden="true" />
                  </div>

                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400/75">
                    Stage {stage.number}
                  </p>
                  <h2 className="mt-2 text-xl font-bold tracking-tight text-white">
                    {stage.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-white/45">
                    {stage.description}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {stage.topics.map((topic) => (
                      <span
                        key={topic}
                        className="rounded-lg border border-white/[0.08] bg-white/[0.025] px-2.5 py-1.5 text-[11px] font-medium text-white/45"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: reduceMotion ? 0 : 0.2, duration: 0.5 }}
          className="mt-7 flex flex-col gap-3 rounded-2xl border border-purple-400/15 bg-purple-500/[0.06] px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="font-semibold text-white/75">
            One connected path. Every stage builds on the one before it.
          </p>
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-purple-300/75">
            Beginner → Architect
          </span>
        </motion.div>
      </div>
    </section>
  );
}
