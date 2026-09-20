import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import EbookShowcase from "../components/EbookShowcase";

const expertise = [
  {
    code: "D365",
    title: "Microsoft Dynamics CRM",
    description:
      "Microsoft Dynamics 365 CE, Dynamics CRM Customer Service, case management, CRM customization, business rules, activities and user-focused solutions.",
  },
  {
    code: "P",
    title: "Power Platform",
    description:
      "Power Automate, Power Apps and Dataverse solutions for business process automation.",
  },
  {
    code: "AZ",
    title: "Azure & Integration",
    description:
      "Integration architecture, APIs, Logic Apps and system-to-system orchestration.",
  },
  {
    code: "JS",
    title: "CRM Development",
    description:
      "JavaScript, client-side customization and Dynamics 365 form behavior.",
  },
  {
    code: "DB",
    title: "Dataverse Optimization",
    description:
      "Storage analysis, attachment optimization, retention strategy and data architecture.",
  },
  {
    code: "SA",
    title: "Dynamics 365 CE Solution Architecture",
    description:
      "Turning CRM and business requirements into scalable Microsoft Dynamics 365 CE solutions.",
  },
];

const projects = [
  {
    category: "DYNAMICS 365 CUSTOMER SERVICE · UNIVERSITY OF NOTTINGHAM",
    title: "Enterprise case management and omnichannel service",
    description:
      "Built an enterprise-grade Dynamics 365 Customer Service case management solution with intelligent routing, SLA configuration, multi-tier queue management and omnichannel integration across email, chat and Teams. Azure API integrations connected D365 with student information systems for automated case creation and real-time status synchronization.",
    tags: [
      "Dynamics 365 CE",
      "Customer Service",
      "SLA",
      "Omnichannel",
      "Azure APIs",
      "Power BI",
    ],
  },
  {
    category: "DYNAMICS 365 SALES · E.ON",
    title: "Sales automation, lead scoring and security governance",
    description:
      "Implemented end-to-end sales automation using custom Dynamics 365 entities, business process flows and relationship hierarchies. Engineered Power Automate-driven lead scoring using external data signals and designed territory-based access control with field-level security.",
    tags: [
      "Dynamics 365 Sales",
      "Lead Scoring",
      "Power Automate",
      "Security",
      "Governance",
    ],
  },
  {
    category: "DATAVERSE · SHAREPOINT · DOCUMENT MANAGEMENT",
    title: "CRM data and document architecture",
    description:
      "Implemented deep SharePoint and OneDrive integrations for compliant, version-controlled document storage within Dynamics 365 case and opportunity processes. This work reflects a broader focus on using the right Microsoft service for the right data.",
    tags: [
      "Dynamics 365 CE",
      "Dataverse",
      "SharePoint",
      "OneDrive",
      "Governance",
    ],
  },
  {
    category: "ALM · AZURE DEVOPS",
    title: "Enterprise release engineering",
    description:
      "Defined solution layering, managed/unmanaged solution governance, publisher conventions and environment strategy across Dev, SIT, UAT and Production, supported by automated CI/CD pipelines.",
    tags: [
      "Azure DevOps",
      "CI/CD",
      "ALM",
      "Managed Solutions",
      "Environment Strategy",
    ],
  },
];

const capabilities = [
  {
    number: "01",
    title: "CRM Architecture",
    description:
      "Dynamics 365 CE, Dataverse-first design, security models, environment strategy, ALM and enterprise governance.",
  },
  {
    number: "02",
    title: "Engineering",
    description:
      "C# plugins, workflow assemblies, PCF, JavaScript/TypeScript, FetchXML, Dataverse Web API and REST APIs.",
  },
  {
    number: "03",
    title: "Cloud Integration",
    description:
      "Azure Functions, Logic Apps, Service Bus, Blob Storage, Azure SQL, Power Automate and Application Insights.",
  },
  {
    number: "04",
    title: "Delivery Leadership",
    description:
      "Agile/Scrum, SIT/UAT, RCA, production support, technical mentoring and cross-functional stakeholder collaboration.",
  },
  {
    number: "05",
    title: "Data & Reporting",
    description:
      "Data migration, SSIS, SQL Server, SSRS, Power BI and advanced Dataverse queries.",
  },
  {
    number: "06",
    title: "Certifications",
    description:
      "Microsoft Certified Power Platform Developer (PL-400) and Power Platform App Maker (PL-100).",
  },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-[#020304] text-white">
      <Navbar />

      <Hero />

      {/* ABOUT */}
        <section
          id="about"
          className="border-t border-white/[0.07] px-6 py-28 md:py-32"
        >
          <div className="mx-auto grid max-w-7xl gap-14 md:grid-cols-[0.9fr_1.1fr] md:gap-20">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-500">
                01 · ABOUT ME
              </p>

              <h2 className="mt-7 max-w-xl text-4xl font-black leading-[0.98] tracking-[-0.04em]        md:text-6xl">
                Business problem
                <br />
                first.
                <br />

                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500        bg-clip-text text-transparent">
                  Technology second.
                </span>
              </h2>
            </div>

            <div className="max-w-2xl md:pt-1">
              <p className="text-2xl leading-[1.35] tracking-tight text-white md:text-3xl">
                I enjoy solving problems where business processes, people and
                technology intersect.
              </p>

              <div className="mt-8 space-y-6 text-base leading-7 text-white/55 md:text-lg       md:leading-8">
                <p>
                  My focus is on understanding how organizations operate, identifying
                  friction and designing solutions that are scalable, maintainable and
                  practical for the people who use them.
                </p>

                <p>
                  My Microsoft ecosystem experience includes Microsoft Dynamics CRM,
                  Microsoft Dynamics 365 CE, Dynamics 365 Customer Service, Dataverse,
                  Power Automate, Power Apps, JavaScript customizations and
                  Azure-based integration concepts.
                </p>
              </div>
            </div>
          </div>
        </section>

      {/* EXPERTISE */}
        <section
          id="expertise"
          className="border-t border-white/[0.07] px-6 py-28 md:py-32"
        >
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-500">
              02 · MICROSOFT DYNAMICS CRM EXPERTISE
            </p>
        
            <h2 className="mt-7 text-4xl font-black tracking-[-0.04em] md:text-6xl">
              What I work with
            </h2>
        
            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {expertise.map((item, index) => (
                <div
                  key={item.title}
                  className={`
                    group
                    relative
                    min-h-[270px]
                    overflow-hidden
                    rounded-[26px]
                    border
                    bg-[#0b0e11]
                    p-7
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:bg-[#0d1115]
                    md:p-8
                    ${
                      index === 0
                        ? "border-blue-500/60 shadow-[0_0_35px_rgba(0,115,255,0.05)]"
                        : "border-white/[0.10] hover:border-blue-500/35"
                    }
                  `}
                >
                  {/* Subtle hover glow */}
                  <div
                    className="
                      pointer-events-none
                      absolute
                      -right-16
                      -top-16
                      h-40
                      w-40
                      rounded-full
                      bg-blue-500/[0.035]
                      blur-3xl
                      transition-opacity
                      duration-300
                      group-hover:bg-blue-500/[0.07]
                    "
                  />
        
                  {/* Icon */}
                  <div
                    className="
                      relative
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      border-blue-500/[0.08]
                      bg-[#091522]
                      text-sm
                      font-black
                      text-blue-500
                      transition-transform
                      duration-300
                      group-hover:scale-105
                    "
                  >
                    {item.code}
                  </div>
                
                  {/* Content */}
                  <div className="relative mt-8">
                    <h3 className="text-xl font-bold tracking-tight text-white md:text-2xl">
                      {item.title}
                    </h3>
                
                    <p className="mt-4 max-w-md text-sm leading-7 text-white/50 md:text-[15px]">
                      {item.description}
                    </p>
                  </div>
                
                  {/* Bottom accent */}
                  <div
                    className="
                      absolute
                      bottom-0
                      left-0
                      h-px
                      w-0
                      bg-gradient-to-r
                      from-blue-500
                      to-purple-500
                      transition-all
                      duration-500
                      group-hover:w-full
                    "
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

      {/* EXPERIENCE */}
        <section
        id="experience"
        className="border-t border-white/[0.07] bg-[#020304] px-6 py-28 md:py-36"
        >
        <div className="mx-auto max-w-7xl">
            {/* Section heading */}
            <div className="max-w-5xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-500">
                03 · PROFESSIONAL EXPERIENCE
            </p>

            <h2 className="mt-7 text-4xl font-black leading-[1.02] tracking-[-0.045em] md:text-6xl lg:text-7xl">
                Enterprise delivery across{" "}
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
                Microsoft Dynamics.
                </span>
            </h2>
            </div>

            {/* Experience timeline */}
            <div className="mt-20 md:mt-24">
            {/* Deloitte */}
            <article className="group relative grid gap-8 border-b border-white/[0.08] pb-16 md:grid-cols-[220px_1fr] md:gap-14">
                {/* Timeline line */}
                <div className="absolute left-[-24px] top-1 hidden h-full w-px bg-gradient-to-b from-blue-500/70 via-blue-500/20 to-transparent md:block" />

                {/* Timeline dot */}
                <div className="absolute left-[-29px] top-1 hidden h-2.5 w-2.5 rounded-full bg-blue-500 shadow-[0_0_16px_rgba(59,130,246,0.8)] md:block" />

                {/* Date */}
                <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-500">
                    JUN 2025
                </p>

                <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-white/30">
                    PRESENT
                </p>

                <div className="mt-5 hidden h-px w-10 bg-white/15 md:block" />
                </div>

                {/* Details */}
                <div className="max-w-5xl">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">
                    DELOITTE
                </p>

                <h3 className="mt-3 text-2xl font-bold tracking-tight text-white md:text-3xl">
                    Technical Consultant
                </h3>

                <p className="mt-2 text-sm font-medium text-blue-400">
                    Microsoft Dynamics 365 & Power Platform
                </p>

                <p className="mt-6 max-w-4xl text-base leading-7 text-white/55 md:text-lg md:leading-8">
                    Architecting and delivering enterprise Dynamics 365 CE solutions
                    across complex entity customizations, business process flows,
                    security models, Azure integrations, data migration and ALM
                    governance.
                </p>

                <p className="mt-4 max-w-4xl text-base leading-7 text-white/55 md:text-lg md:leading-8">
                    Designed Azure DevOps CI/CD pipelines that reduced deployment cycle
                    time by approximately 40%, and engineered event-driven
                    integrations using Azure Functions, Logic Apps, Azure Service Bus,
                    REST APIs and Power Automate.
                </p>

                {/* Technology tags */}
                <div className="mt-7 flex flex-wrap gap-2">
                    {[
                    "Dynamics 365 CE",
                    "Power Platform",
                    "Azure",
                    "Azure DevOps",
                    "CI/CD",
                    "REST APIs",
                    "Power Automate",
                    ].map((tag) => (
                    <span
                        key={tag}
                        className="rounded-lg border border-white/[0.10] bg-white/[0.02] px-3 py-1.5 text-xs text-white/50 transition-colors group-hover:border-blue-500/20 group-hover:text-white/65"
                    >
                        {tag}
                    </span>
                    ))}
                </div>
                </div>
            </article>

            {/* Infosys */}
            <article className="group relative grid gap-8 border-b border-white/[0.08] py-16 md:grid-cols-[220px_1fr] md:gap-14">
                {/* Timeline line */}
                <div className="absolute left-[-24px] top-0 hidden h-full w-px bg-gradient-to-b from-blue-500/20 via-blue-500/30 to-blue-500/20 md:block" />

                {/* Timeline dot */}
                <div className="absolute left-[-29px] top-[68px] hidden h-2.5 w-2.5 rounded-full bg-blue-500 md:block" />

                {/* Date */}
                <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-500">
                    JAN 2022
                </p>

                <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-white/30">
                    FEB 2025
                </p>

                <div className="mt-5 hidden h-px w-10 bg-white/15 md:block" />
                </div>

                {/* Details */}
                <div className="max-w-5xl">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">
                    INFOSYS
                </p>

                <h3 className="mt-3 text-2xl font-bold tracking-tight text-white md:text-3xl">
                    Senior Systems Engineer
                </h3>

                <p className="mt-2 text-sm font-medium text-blue-400">
                    Dynamics 365 CE & Power Platform
                </p>

                <p className="mt-6 max-w-4xl text-base leading-7 text-white/55 md:text-lg md:leading-8">
                    Led the design, development and delivery of Model-Driven Apps and
                    Dynamics 365 CE customizations for enterprise clients across
                    Education, Energy and Technology.
                </p>

                <p className="mt-4 max-w-4xl text-base leading-7 text-white/55 md:text-lg md:leading-8">
                    Delivered 20+ Power Automate cloud flows that reduced manual effort
                    by 65%, implemented C# plugins and custom workflow activities, and
                    delivered SharePoint/OneDrive document management integrations
                    within D365 case and opportunity processes.
                </p>

                {/* Technology tags */}
                <div className="mt-7 flex flex-wrap gap-2">
                    {[
                    "Dynamics 365 CE",
                    "Model-Driven Apps",
                    "C# Plugins",
                    "Power Automate",
                    "Dataverse",
                    "SharePoint",
                    "OneDrive",
                    ].map((tag) => (
                    <span
                        key={tag}
                        className="rounded-lg border border-white/[0.10] bg-white/[0.02] px-3 py-1.5 text-xs text-white/50 transition-colors group-hover:border-blue-500/20 group-hover:text-white/65"
                    >
                        {tag}
                    </span>
                    ))}
                </div>
                </div>
            </article>

            {/* Support experience */}
            <article className="group relative grid gap-8 pt-16 md:grid-cols-[220px_1fr] md:gap-14">
                {/* Timeline line */}
                <div className="absolute left-[-24px] top-0 hidden h-full w-px bg-gradient-to-b from-blue-500/20 to-transparent md:block" />

                {/* Timeline dot */}
                <div className="absolute left-[-29px] top-[68px] hidden h-2.5 w-2.5 rounded-full bg-blue-500/80 md:block" />

                {/* Label */}
                <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-500">
                    ENTERPRISE
                </p>

                <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-white/30">
                    SUPPORT
                </p>

                <div className="mt-5 hidden h-px w-10 bg-white/15 md:block" />
                </div>

                {/* Details */}
                <div className="max-w-5xl">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">
                    MICROSOFT PRACTICE
                </p>

                <h3 className="mt-3 text-2xl font-bold tracking-tight text-white md:text-3xl">
                    Tier 2/3 Dynamics 365 Technical Support
                </h3>

                <p className="mt-6 max-w-4xl text-base leading-7 text-white/55 md:text-lg md:leading-8">
                    Diagnosed complex configuration, plugin and integration issues,
                    collaborated on product defect identification and workaround
                    design, and developed knowledge articles and runbooks used across
                    the support practice.
                </p>

                <div className="mt-7 flex flex-wrap gap-2">
                    {[
                    "Dynamics 365",
                    "Technical Support",
                    "Troubleshooting",
                    "Integrations",
                    "Runbooks",
                    "Knowledge Management",
                    ].map((tag) => (
                    <span
                        key={tag}
                        className="rounded-lg border border-white/[0.10] bg-white/[0.02] px-3 py-1.5 text-xs text-white/50 transition-colors group-hover:border-blue-500/20 group-hover:text-white/65"
                    >
                        {tag}
                    </span>
                    ))}
                </div>
                </div>
            </article>
            </div>
        </div>
</section>

      {/* PROJECTS */}
        <section
        id="projects"
        className="border-t border-white/[0.07] bg-[#030405] px-6 py-28 md:py-36"
        >
        <div className="mx-auto max-w-7xl">
            {/* Heading */}
            <div className="max-w-6xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-500">
                04 · SELECTED ENTERPRISE WORK
            </p>

            <h2 className="mt-7 text-4xl font-black leading-[1.02] tracking-[-0.045em] md:text-6xl lg:text-7xl">
                Evidence of{" "}
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
                technical depth.
                </span>
            </h2>

            <p className="mt-6 max-w-2xl text-base leading-7 text-white/40 md:text-lg">
                Enterprise Dynamics 365 and Microsoft ecosystem solutions designed
                around real business processes, integrations, governance and
                measurable outcomes.
            </p>
            </div>

            {/* Case studies */}
            <div className="mt-16 space-y-6 md:mt-20">
            {/* =====================================================
                PROJECT 01 — UNIVERSITY OF NOTTINGHAM
            ====================================================== */}

            <article
                className="
                group
                relative
                overflow-hidden
                rounded-[28px]
                border
                border-blue-500/35
                bg-[#0a0d10]
                p-7
                transition-all
                duration-500
                hover:border-blue-500/60
                md:p-10
                lg:p-12
                "
            >
                {/* Background glow */}
                <div
                className="
                    pointer-events-none
                    absolute
                    -right-32
                    -top-32
                    h-80
                    w-80
                    rounded-full
                    bg-blue-500/[0.035]
                    blur-3xl
                    transition-all
                    duration-500
                    group-hover:bg-blue-500/[0.07]
                "
                />

                <div className="relative">
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
                    <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-500">
                        01 · DYNAMICS 365 CUSTOMER SERVICE
                    </p>

                    <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-white/30">
                        UNIVERSITY OF NOTTINGHAM
                    </p>
                    </div>

                    <span className="hidden text-5xl font-black tracking-[-0.05em] text-white/[0.04] md:block">
                    01
                    </span>
                </div>

                <h3 className="mt-10 max-w-5xl text-2xl font-bold tracking-tight text-white md:text-4xl">
                    Enterprise case management and omnichannel service
                </h3>

                <p className="mt-6 max-w-5xl text-base leading-7 text-white/55 md:text-lg md:leading-8">
                    Built an enterprise-grade Dynamics 365 Customer Service case
                    management solution with intelligent routing, SLA configuration,
                    multi-tier queue management and omnichannel integration across
                    email, chat and Teams.
                </p>

                <p className="mt-4 max-w-5xl text-base leading-7 text-white/55 md:text-lg md:leading-8">
                    Azure API integrations connected D365 with student information
                    systems for automated case creation and real-time status
                    synchronization.
                </p>

                <div className="mt-8 flex flex-wrap gap-2">
                    {[
                    "Dynamics 365 CE",
                    "Customer Service",
                    "SLA",
                    "Omnichannel",
                    "Azure APIs",
                    "Power BI",
                    ].map((tag) => (
                    <span
                        key={tag}
                        className="
                        rounded-lg
                        border
                        border-white/[0.10]
                        bg-white/[0.02]
                        px-3
                        py-2
                        text-xs
                        text-white/55
                        transition-colors
                        group-hover:border-blue-500/20
                        group-hover:text-white/70
                        "
                    >
                        {tag}
                    </span>
                    ))}
                </div>
                </div>
            </article>

            {/* =====================================================
                PROJECT 02 — E.ON
            ====================================================== */}

            <article
                className="
                group
                relative
                overflow-hidden
                rounded-[28px]
                border
                border-white/[0.10]
                bg-[#0a0d10]
                p-7
                transition-all
                duration-500
                hover:border-blue-500/40
                md:p-10
                lg:p-12
                "
            >
                <div
                className="
                    pointer-events-none
                    absolute
                    -right-32
                    -top-32
                    h-80
                    w-80
                    rounded-full
                    bg-indigo-500/[0.025]
                    blur-3xl
                    transition-all
                    duration-500
                    group-hover:bg-indigo-500/[0.06]
                "
                />

                <div className="relative">
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
                    <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-500">
                        02 · DYNAMICS 365 SALES
                    </p>

                    <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-white/30">
                        E.ON
                    </p>
                    </div>

                    <span className="hidden text-5xl font-black tracking-[-0.05em] text-white/[0.04] md:block">
                    02
                    </span>
                </div>

                <h3 className="mt-10 max-w-5xl text-2xl font-bold tracking-tight text-white md:text-4xl">
                    Sales automation, lead scoring and security governance
                </h3>

                <p className="mt-6 max-w-5xl text-base leading-7 text-white/55 md:text-lg md:leading-8">
                    Implemented end-to-end sales automation using custom Dynamics 365
                    entities, business process flows and relationship hierarchies.
                </p>

                <p className="mt-4 max-w-5xl text-base leading-7 text-white/55 md:text-lg md:leading-8">
                    Engineered Power Automate-driven lead scoring using external data
                    signals and designed territory-based access control with
                    field-level security.
                </p>

                <div className="mt-8 flex flex-wrap gap-2">
                    {[
                    "Dynamics 365 Sales",
                    "Lead Scoring",
                    "Power Automate",
                    "Security",
                    "Governance",
                    ].map((tag) => (
                    <span
                        key={tag}
                        className="
                        rounded-lg
                        border
                        border-white/[0.10]
                        bg-white/[0.02]
                        px-3
                        py-2
                        text-xs
                        text-white/55
                        transition-colors
                        group-hover:border-blue-500/20
                        group-hover:text-white/70
                        "
                    >
                        {tag}
                    </span>
                    ))}
                </div>
                </div>
            </article>

            {/* =====================================================
                PROJECT 03 — DATAVERSE / SHAREPOINT
            ====================================================== */}

            <article
                className="
                group
                relative
                overflow-hidden
                rounded-[28px]
                border
                border-white/[0.10]
                bg-[#0a0d10]
                p-7
                transition-all
                duration-500
                hover:border-blue-500/40
                md:p-10
                lg:p-12
                "
            >
                <div
                className="
                    pointer-events-none
                    absolute
                    -right-32
                    -top-32
                    h-80
                    w-80
                    rounded-full
                    bg-purple-500/[0.025]
                    blur-3xl
                    transition-all
                    duration-500
                    group-hover:bg-purple-500/[0.06]
                "
                />

                <div className="relative">
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
                    <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-500">
                        03 · DATAVERSE · SHAREPOINT
                    </p>

                    <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-white/30">
                        DOCUMENT MANAGEMENT
                    </p>
                    </div>

                    <span className="hidden text-5xl font-black tracking-[-0.05em] text-white/[0.04] md:block">
                    03
                    </span>
                </div>

                <h3 className="mt-10 max-w-5xl text-2xl font-bold tracking-tight text-white md:text-4xl">
                    CRM data and document architecture
                </h3>

                <p className="mt-6 max-w-5xl text-base leading-7 text-white/55 md:text-lg md:leading-8">
                    Implemented deep SharePoint and OneDrive integrations for compliant,
                    version-controlled document storage within Dynamics 365 case and
                    opportunity processes.
                </p>

                <p className="mt-4 max-w-5xl text-base leading-7 text-white/55 md:text-lg md:leading-8">
                    This work reflects a broader focus on using the right Microsoft
                    service for the right data.
                </p>

                <div className="mt-8 flex flex-wrap gap-2">
                    {[
                    "Dynamics 365 CE",
                    "Dataverse",
                    "SharePoint",
                    "OneDrive",
                    "Governance",
                    ].map((tag) => (
                    <span
                        key={tag}
                        className="
                        rounded-lg
                        border
                        border-white/[0.10]
                        bg-white/[0.02]
                        px-3
                        py-2
                        text-xs
                        text-white/55
                        transition-colors
                        group-hover:border-blue-500/20
                        group-hover:text-white/70
                        "
                    >
                        {tag}
                    </span>
                    ))}
                </div>
                </div>
            </article>

            {/* =====================================================
                PROJECT 04 — AZURE DEVOPS / ALM
            ====================================================== */}

            <article
                className="
                group
                relative
                overflow-hidden
                rounded-[28px]
                border
                border-white/[0.10]
                bg-[#0a0d10]
                p-7
                transition-all
                duration-500
                hover:border-blue-500/40
                md:p-10
                lg:p-12
                "
            >
                <div
                className="
                    pointer-events-none
                    absolute
                    -right-32
                    -top-32
                    h-80
                    w-80
                    rounded-full
                    bg-blue-500/[0.025]
                    blur-3xl
                    transition-all
                    duration-500
                    group-hover:bg-blue-500/[0.06]
                "
                />

                <div className="relative">
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
                    <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-500">
                        04 · ALM · AZURE DEVOPS
                    </p>

                    <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-white/30">
                        ENTERPRISE RELEASE ENGINEERING
                    </p>
                    </div>

                    <span className="hidden text-5xl font-black tracking-[-0.05em] text-white/[0.04] md:block">
                    04
                    </span>
                </div>

                <h3 className="mt-10 max-w-5xl text-2xl font-bold tracking-tight text-white md:text-4xl">
                    Enterprise release engineering
                </h3>

                <p className="mt-6 max-w-5xl text-base leading-7 text-white/55 md:text-lg md:leading-8">
                    Defined solution layering, managed/unmanaged solution governance,
                    publisher conventions and environment strategy across Dev, SIT,
                    UAT and Production.
                </p>

                <p className="mt-4 max-w-5xl text-base leading-7 text-white/55 md:text-lg md:leading-8">
                    Supported enterprise delivery through automated CI/CD pipelines,
                    improving deployment consistency and release governance.
                </p>

                <div className="mt-8 flex flex-wrap gap-2">
                    {[
                    "Azure DevOps",
                    "CI/CD",
                    "ALM",
                    "Managed Solutions",
                    "Environment Strategy",
                    ].map((tag) => (
                    <span
                        key={tag}
                        className="
                        rounded-lg
                        border
                        border-white/[0.10]
                        bg-white/[0.02]
                        px-3
                        py-2
                        text-xs
                        text-white/55
                        transition-colors
                        group-hover:border-blue-500/20
                        group-hover:text-white/70
                        "
                    >
                        {tag}
                    </span>
                    ))}
                </div>
                </div>
            </article>
            </div>
        </div>
</section>

      {/* WHAT I ADMIRE */}
      {/* WHAT I ADMIRE */}
            <section
              className="border-t border-white/[0.07] bg-[#020304] px-6 py-28 md:py-36"
            >
              <div className="mx-auto max-w-7xl">
                <div className="grid gap-12 md:grid-cols-[0.85fr_1.15fr] md:gap-20">
                  {/* Heading */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-500">
                      05 · WHAT I ADMIRE
                    </p>
                            
                    <h2 className="mt-7 max-w-xl text-4xl font-black leading-[1] tracking-[-0.045em]            md:text-6xl">
                      I like solving problems that don't have{" "}
                      <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500          bg-clip-text text-transparent">
                        simple answers.
                      </span>
                    </h2>
                  </div>
                            
                  {/* Principles */}
                  <div className="grid gap-4">
                    {[
                      {
                        number: "01",
                        title: "Simplify complexity.",
                        description:
                          "Make complicated systems understandable — for both the people using them             and the teams maintaining them.",
                      },
                      {
                        number: "02",
                        title: "Automate the repetitive.",
                        description:
                          "Give teams time back by removing unnecessary manual work and turning             repeatable processes into reliable automation.",
                      },
                      {
                        number: "03",
                        title: "Optimize what already exists.",
                        description:
                          "Improve the architecture, process or configuration before reaching for           another technology.",
                      },
                    ].map((item) => (
                      <div
                        key={item.number}
                        className="
                          group
                          relative
                          overflow-hidden
                          rounded-2xl
                          border
                          border-white/[0.09]
                          bg-[#0a0d10]
                          p-6
                          transition-all
                          duration-300
                          hover:border-blue-500/35
                          hover:bg-[#0c1014]
                          md:p-7
                        "
                      >
                        <div className="flex gap-6">
                          <span className="pt-1 text-xs font-bold tracking-[0.15em] text-blue-500/70">
                            {item.number}
                          </span>
                    
                          <div>
                            <h3 className="text-xl font-bold tracking-tight text-white md:text-2xl">
                              {item.title}
                            </h3>
                    
                            <p className="mt-3 max-w-xl text-sm leading-7 text-white/45 md:text-[15px]          ">
                              {item.description}
                            </p>
                          </div>
                        </div>
                    
                        <div
                          className="
                            absolute
                            bottom-0
                            left-0
                            h-px
                            w-0
                            bg-gradient-to-r
                            from-blue-500
                            to-purple-500
                            transition-all
                            duration-500
                            group-hover:w-full
                          "
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

      {/* TECHNICAL & DELIVERY CAPABILITIES */}
            <section
              id="capabilities"
              className="border-t border-white/[0.07] px-6 py-28 md:py-36"
            >
              <div className="mx-auto max-w-7xl">
                {/* Heading */}
                <div className="max-w-6xl">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-500">
                    06 · TECHNICAL & DELIVERY CAPABILITIES
                  </p>

                  <h2 className="mt-7 text-4xl font-black leading-[1.02] tracking-[-0.045em]            md:text-6xl lg:text-7xl">
        Built for{" "}
        <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
          high-stakes conversations.
        </span>
                  </h2>

                  <p className="mt-6 max-w-2xl text-base leading-7 text-white/40 md:text-lg">
                    The technical areas I bring together when designing, building and
                    delivering enterprise Microsoft solutions.
                  </p>
                </div>

                {/* Capabilities */}
                <div className="mt-14 grid gap-x-10 gap-y-0 md:grid-cols-2">
                  {capabilities.map((item) => (
                    <div
                      key={item.number}
                      className="
                        group
                        border-t
            border-white/[0.09]
                        py-8
                        transition-colors
                        hover:border-blue-500/40
                      "
                    >
                      <div className="flex gap-6">
                        <span
                          className="
                            pt-1
                            text-xs
                            font-bold
                            tracking-[0.15em]
                            text-blue-500
                            transition-colors
                            group-hover:text-blue-400
                          "
                        >
                          {item.number}
                        </span>
                
                        <div>
                          <h3 className="text-xl font-bold tracking-tight text-white md:text-2xl">
                            {item.title}
                          </h3>
                
                          <p className="mt-3 max-w-xl text-sm leading-7 text-white/45 md:text-[15px]">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              
                {/* Bottom statement */}
                <div className="mt-12 border-t border-white/[0.09] pt-8">
                  <p className="max-w-4xl text-sm leading-7 text-white/30 md:text-base">
                    From CRM architecture and Dataverse engineering to Azure integration,
                    ALM, data migration and production delivery — the focus remains on
                    building solutions that work reliably beyond the development
                    environment.
                  </p>
                </div>
              </div>
            </section>

      {/* EBOOKS */}
      <section
        id="ebooks"
         className="border-t border-white/[0.07] bg-[#030405] px-6 py-28 md:py-36"
        >
         <EbookShowcase />
        </section>

      {/* CONTACT */}
      <section
        id="contact"
        className="border-t border-white/10 px-6 py-32 md:py-40"
      >
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-500">
            06 · CONNECT
          </p>

          <h2 className="mt-8 text-5xl font-bold tracking-tight md:text-7xl">
            Let's talk about technology and outcomes.
          </h2>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-white/55">
            If you work with Microsoft Dynamics CRM, Dynamics 365 CE or the
            Power Platform and have an interesting challenge, I'd be glad to
            exchange ideas.
          </p>

          <a
            href="mailto:maniksohane@gmail.com"
            className="mt-10 inline-flex rounded-xl bg-blue-500 px-7 py-4 font-bold text-white transition hover:bg-blue-400"
          >
            Start a Conversation ↗
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 text-sm text-white/50 md:flex-row">
          <div>
            <p className="font-bold text-white">MANIKYA SOHANE</p>
            <p className="mt-1">Microsoft Consultant</p>
          </div>

          <p>
            Microsoft Dynamics CRM · Dynamics 365 CE · Power Platform · Azure
          </p>

          <p>Designing Solutions. Driving Impact.</p>
        </div>
      </footer>
    </main>
  );
}