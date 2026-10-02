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

const curvePath =
  "M 85 170 C 125 170, 150 95, 195 95 S 280 155, 330 155 S 415 65, 465 65 S 550 140, 600 140 S 685 80, 735 80 S 820 165, 870 165 S 955 90, 1005 90 S 1080 145, 1115 145";

const roadmap = [
  {
    number: "01",
    title: "Beginner Foundations",
    summary: "D365 basics · Cloud concepts",
    icon: Sparkles,
    x: 85,
    y: 170,
    label: "top",
  },
  {
    number: "02",
    title: "Power Apps",
    summary: "Apps · Dataverse · Automate",
    icon: Blocks,
    x: 195,
    y: 95,
    label: "bottom",
  },
  {
    number: "03",
    title: "Customisation",
    summary: "JavaScript · Plugins · PCF",
    icon: BrainCircuit,
    x: 330,
    y: 155,
    label: "top",
  },
  {
    number: "04",
    title: "CE Core Platform",
    summary: "Security · Solutions · ALM",
    icon: Database,
    x: 465,
    y: 65,
    label: "bottom",
  },
  {
    number: "05",
    title: "Customer Insights",
    summary: "Data · Journeys · Segments",
    icon: ChartNoAxesCombined,
    x: 600,
    y: 140,
    label: "bottom",
  },
  {
    number: "06",
    title: "Dynamics 365 Sales",
    summary: "Leads · Opportunities · Forecasting",
    icon: BookOpenCheck,
    x: 735,
    y: 80,
    label: "bottom",
  },
  {
    number: "07",
    title: "Field Service",
    summary: "Work orders · Scheduling · Assets",
    icon: MapPinned,
    x: 870,
    y: 165,
    label: "top",
  },
  {
    number: "08",
    title: "Customer Service",
    summary: "Cases · SLAs · Omnichannel",
    icon: Headphones,
    x: 1005,
    y: 90,
    label: "bottom",
  },
  {
    number: "09",
    title: "Solution Architect",
    summary: "Architecture · Governance · Delivery",
    icon: Network,
    x: 1115,
    y: 145,
    label: "top",
  },
];

export default function EbookRoadmap() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="roadmap-heading"
      className="relative overflow-hidden border-b border-white/[0.07] px-5 pb-12 pt-28 sm:px-6 sm:pb-14 sm:pt-32"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-80 max-w-5xl bg-[radial-gradient(circle_at_50%_10%,rgba(59,130,246,0.14),transparent_68%)]" />

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"
        >
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.9)]" />
              Dynamics 365 learning roadmap
            </div>

            <h1
              id="roadmap-heading"
              className="mt-5 text-4xl font-black leading-[1.02] tracking-[-0.05em] sm:text-5xl lg:text-6xl"
            >
              Beginner to{" "}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
                solution architect.
              </span>
            </h1>
          </div>

          <p className="max-w-md text-sm leading-6 text-white/45 lg:text-right">
            Follow the complete CE lifecycle—from Power Apps fundamentals to
            enterprise architecture and delivery.
          </p>
        </motion.div>

        <div className="relative mt-8 overflow-hidden rounded-[28px] border border-white/[0.09] bg-[#070a0e]/90 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
          <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-blue-500/[0.09] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 right-0 h-64 w-64 rounded-full bg-purple-500/[0.09] blur-3xl" />

          <div className="relative overflow-x-auto overscroll-x-contain [scrollbar-width:thin] [scrollbar-color:rgba(99,102,241,0.45)_transparent]">
            <div className="relative h-[310px] min-w-[1180px] px-5 sm:h-[330px]">
              <svg
                aria-hidden="true"
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 1200 300"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="banner-roadmap-gradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                  <filter id="roadmap-glow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <path
                  d={curvePath}
                  fill="none"
                  stroke="rgba(255,255,255,0.07)"
                  strokeWidth="12"
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                />
                <motion.path
                  d={curvePath}
                  fill="none"
                  stroke="url(#banner-roadmap-gradient)"
                  strokeWidth="4"
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                  initial={reduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true, amount: 0.45 }}
                  transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
                  filter="url(#roadmap-glow)"
                />
                <motion.path
                  d={curvePath}
                  fill="none"
                  stroke="rgba(255,255,255,0.6)"
                  strokeWidth="1.5"
                  strokeDasharray="4 18"
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                  animate={reduceMotion ? undefined : { strokeDashoffset: [0, -110] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                />

                {!reduceMotion && (
                  <circle r="6" fill="#ffffff" filter="url(#roadmap-glow)">
                    <animateMotion
                      dur="8s"
                      repeatCount="indefinite"
                      path={curvePath}
                    />
                  </circle>
                )}
              </svg>

              {roadmap.map((stage, index) => {
                const Icon = stage.icon;
                const labelAbove = stage.label === "top";

                return (
                  <motion.div
                    key={stage.number}
                    initial={reduceMotion ? false : { opacity: 0, scale: 0.6 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.4,
                      delay: reduceMotion ? 0 : 0.18 + index * 0.09,
                      type: "spring",
                      stiffness: 180,
                      damping: 16,
                    }}
                    className="absolute z-10"
                    style={{
                      left: `${(stage.x / 1200) * 100}%`,
                      top: `${(stage.y / 300) * 100}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <motion.div
                      animate={
                        reduceMotion
                          ? undefined
                          : {
                              boxShadow: [
                                "0 0 0 0 rgba(96,165,250,0.28)",
                                "0 0 0 12px rgba(96,165,250,0)",
                              ],
                            }
                      }
                      transition={{
                        duration: 2.4,
                        delay: index * 0.2,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                      className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-300/55 bg-[#07111f] text-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.24)]"
                    >
                      <Icon size={19} aria-hidden="true" />
                      <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full border border-white/15 bg-[#111827] px-1 text-[8px] font-black text-white/75">
                        {stage.number}
                      </span>
                    </motion.div>

                    <div
                      className={`absolute left-1/2 w-36 -translate-x-1/2 text-center ${
                        labelAbove ? "bottom-full mb-3" : "top-full mt-3"
                      }`}
                    >
                      <p className="text-xs font-bold leading-4 text-white">
                        {stage.title}
                      </p>
                      <p className="mt-1 text-[9px] leading-3 text-white/35">
                        {stage.summary}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/[0.07] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">
            <span>Start your journey</span>
            <span className="text-indigo-300/60 sm:hidden">Swipe to explore →</span>
            <span className="hidden text-purple-300/60 sm:inline">One connected learning path</span>
            <span>Become an architect</span>
          </div>
        </div>
      </div>
    </section>
  );
}
