"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen overflow-hidden bg-[#02080d]"
    >
      {/* =========================================================
          BACKGROUND
      ========================================================== */}

      <div className="pointer-events-none absolute inset-0">
        {/* Large circular ring */}
        <div
          className="
            absolute
            right-[-120px]
            top-[135px]
            h-[620px]
            w-[620px]
            rounded-full
            border
            border-blue-500/[0.10]
          "
        />

        {/* Inner circular ring */}
        <div
          className="
            absolute
            right-[-20px]
            top-[235px]
            h-[420px]
            w-[420px]
            rounded-full
            border
            border-blue-400/[0.06]
          "
        />

        {/* Soft blue glow */}
        <div
          className="
            absolute
            right-[5%]
            top-[22%]
            h-[420px]
            w-[420px]
            rounded-full
            bg-blue-500/[0.035]
            blur-[100px]
          "
        />

        {/* Bottom atmospheric glow */}
        <div
          className="
            absolute
            bottom-[-180px]
            left-[20%]
            h-[420px]
            w-[700px]
            rounded-full
            bg-indigo-500/[0.025]
            blur-[120px]
          "
        />
      </div>

      {/* =========================================================
          CONTENT
      ========================================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          flex
          min-h-screen
          max-w-7xl
          items-center
          px-6
          pb-24
          pt-36
          md:pt-32
        "
      >
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="w-full max-w-6xl"
        >
          {/* =====================================================
              EYEBROW
          ====================================================== */}

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <span
              className="
                h-2
                w-2
                rounded-full
                bg-green-500
                shadow-[0_0_18px_rgba(34,197,94,0.8)]
              "
            />

            <p
              className="
                text-[11px]
                font-bold
                uppercase
                tracking-[0.28em]
                text-blue-500
                sm:text-xs
                md:text-sm
              "
            >
              Microsoft Dynamics CRM · Dynamics 365 CE · Power Platform
            </p>
          </motion.div>

          {/* =====================================================
              MAIN HEADLINE
          ====================================================== */}

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="
                mt-8
                max-w-none
                whitespace-nowrap
                text-[3rem]
                font-black
                leading-[0.94]
                tracking-[-0.055em]
                text-white
                sm:text-[3.8rem]
                md:text-[4.8rem]
                lg:text-[5.6rem]
                xl:text-[6.2rem]
            "
          >
            Microsoft Dynamics CRM,
            <br />

            <span
              className="
                bg-gradient-to-r
                from-blue-400
                via-indigo-400
                to-purple-500
                bg-clip-text
                text-transparent
              "
            >
              designed around real
              <br />
              business problems.
            </span>
          </motion.h1>

          {/* =====================================================
              DESCRIPTION
          ====================================================== */}

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            className="
              mt-9
              max-w-4xl
              text-base
              leading-7
              text-white/60
              sm:text-lg
              sm:leading-8
              md:text-xl
            "
          >
            I'm Manikya Sohane, a Microsoft Dynamics CRM Consultant focused on
            Microsoft Dynamics 365 CE, Dynamics CRM, Dataverse, Power
            Platform, Azure integration and enterprise CRM solutions.
          </motion.p>

          {/* =====================================================
              CTA BUTTONS
          ====================================================== */}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.7 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <a
              href="#projects"
              className="
                group
                inline-flex
                items-center
                gap-3
                rounded-xl
                bg-blue-500
                px-6
                py-4
                text-sm
                font-bold
                text-white
                shadow-[0_10px_40px_rgba(37,99,235,0.18)]
                transition-all
                duration-300
                hover:-translate-y-1
                hover:bg-blue-400
                hover:shadow-[0_15px_50px_rgba(37,99,235,0.28)]
              "
            >
              Explore My Work

              <ArrowDown
                size={17}
                className="
                  transition-transform
                  duration-300
                  group-hover:translate-y-1
                "
              />
            </a>

            <a
              href="mailto:maniksohane@gmail.com"
              className="
                group
                inline-flex
                items-center
                gap-3
                rounded-xl
                border
                border-white/15
                bg-white/[0.015]
                px-6
                py-4
                text-sm
                font-bold
                text-white
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-white/30
                hover:bg-white/[0.05]
              "
            >
              Let's Connect

              <ArrowUpRight
                size={17}
                className="
                  transition-transform
                  duration-300
                  group-hover:translate-x-0.5
                  group-hover:-translate-y-0.5
                "
              />
            </a>
          </motion.div>

          {/* =====================================================
              BOTTOM MICRO DETAILS
          ====================================================== */}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="
              mt-20
              flex
              flex-wrap
              items-center
              gap-x-6
              gap-y-2
              text-[11px]
              font-medium
              uppercase
              tracking-[0.18em]
              text-white/25
            "
          >
            <span>Dynamics 365 CE</span>

            <span className="h-1 w-1 rounded-full bg-white/20" />

            <span>Dataverse</span>

            <span className="h-1 w-1 rounded-full bg-white/20" />

            <span>Power Platform</span>

            <span className="h-1 w-1 rounded-full bg-white/20" />

            <span>Azure</span>
          </motion.div>
        </motion.div>
      </div>

      {/* =========================================================
          SCROLL INDICATOR
      ========================================================== */}

      <motion.a
        href="#about"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="
          absolute
          bottom-8
          left-1/2
          hidden
          -translate-x-1/2
          flex-col
          items-center
          gap-3
          text-[10px]
          font-bold
          uppercase
          tracking-[0.25em]
          text-white/25
          transition-colors
          hover:text-white/60
          md:flex
        "
      >
        <span>Scroll</span>

        <span className="h-8 w-px bg-gradient-to-b from-white/30 to-transparent" />
      </motion.a>
    </section>
  );
}