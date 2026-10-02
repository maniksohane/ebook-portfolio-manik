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

        <div className="mt-12 overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            initial={reduceMotion ? { scaleX: 1 } : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="h-1 origin-left bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
          />
        </div>

        <div className="relative mt-8">
          <div className="absolute bottom-6 left-[23px] top-6 w-px bg-gradient-to-b from-blue-500/70 via-indigo-500/50 to-purple-500/70 md:hidden" />

          <div className="grid gap-4 md:grid-cols-3 md:gap-5">
            {roadmap.map((stage, index) => {
              const Icon = stage.icon;

              return (
                <motion.article
                  key={stage.number}
                  initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.98 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{
                    duration: 0.5,
                    delay: reduceMotion ? 0 : (index % 3) * 0.09,
                    ease: "easeOut",
                  }}
                  className="group relative ml-12 overflow-hidden rounded-3xl border border-white/[0.09] bg-[#090c10]/95 p-6 transition-colors hover:border-blue-400/35 md:ml-0 md:min-h-[300px] md:p-7"
                >
                  <div className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-blue-500/[0.04] blur-3xl transition-colors group-hover:bg-blue-500/[0.10]" />

                  <div className="absolute -left-[43px] top-7 flex h-9 w-9 items-center justify-center rounded-full border border-blue-400/40 bg-[#07101c] text-[10px] font-black text-blue-300 md:static md:h-12 md:w-12 md:rounded-2xl md:text-blue-400">
                    <Icon className="hidden md:block" size={21} aria-hidden="true" />
                    <span className="md:hidden">{stage.number}</span>
                  </div>

                  <div className="relative md:mt-8">
                    <p className="hidden text-[11px] font-bold uppercase tracking-[0.2em] text-blue-400/75 md:block">
                      Stage {stage.number}
                    </p>
                    <h2 className="mt-1 text-xl font-bold tracking-tight text-white md:mt-3 md:text-2xl">
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
