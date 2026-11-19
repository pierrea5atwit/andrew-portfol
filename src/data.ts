/**
 * Single source of truth for site content.
 *
 * Keep this file honest — everything here is public-facing. If a link is
 * `undefined` the card renders as private instead of dead-linking.
 *
 * Two layers, on purpose:
 *   PROJECTS — the curated rail. What I want someone to look at first.
 *   RESUME   — the complete record, filterable. Everything, including the
 *              work that is private, employer-owned, or finished.
 */

export type Project = {
  name: string;
  tag: string;
  blurb: string;
  stack: string[];
  repo?: string;
  live?: string;
  /** Shown instead of links when there is nothing public to click. */
  privateNote?: string;
  /** Featured projects lead the rail. */
  featured?: boolean;
};

export const PROJECTS: Project[] = [
  {
    name: "Apollo",
    tag: "Local-first agent",
    featured: true,
    blurb:
      "Local-first voice agent — audio, on-device STT, a planning loop over a local 8B model, tools, memory, speech, with no cloud inference in the request path. Layered kernel: perception, cognitive core, and four independent memory lanes behind a syscall-style boundary, governed per turn.",
    stack: ["Python", "Ollama", "whisper.cpp", "SQLite / FTS5", "FastAPI"],
    privateNote: "Private while in progress — happy to walk the architecture.",
  },
  {
    name: "EquiBirth AI",
    tag: "ML research",
    featured: true,
    blurb:
      "Who bears the preterm-birth disparity, and can it be predicted from U.S. birth records? ~25M CDC natality rows. The honest number is AUC-ROC 0.66 — the 0.91 baseline was data leakage. A fairness audit found ~2.7x over-flagging of Black mothers.",
    stack: ["Python", "scikit-learn", "Streamlit", "Colab"],
    repo: "https://github.com/ParshvCrafts/EquiBirth_AI",
  },
  {
    name: "Pokémon AI Agent",
    tag: "Hybrid AI",
    blurb:
      "Deterministic models handle the numeric side of a battle — damage, weather, win probability — and a mixture-of-experts layer picks the move. Lazy PokeAPI caching; 22% better predicted win accuracy over 1,000 simulations.",
    stack: ["Python", "scikit-learn", "pandas", "PokeAPI"],
    repo: "https://github.com/pierrea5atwit/nuzlockeSystem2",
  },
  {
    name: "InterviewAI Coach",
    tag: "Web app",
    blurb:
      "Record an interview answer in the browser, get it transcribed and scored. Auto-stops on silence; transcription runs server-side, not through a third-party API.",
    stack: ["JavaScript", "faster-whisper", "Docker"],
    repo: "https://github.com/pierrea5atwit/Interview_Web_App",
  },
  {
    name: "vGPU Under Load",
    tag: "Systems research",
    blurb:
      "Why do rented NVIDIA vGPU instances advertising identical capacity vary up to 30% in runtime? Simulated ML training over a vGPU connection, measured with NVML and CuPy.",
    stack: ["Python", "CuPy", "NVML", "pytest"],
    repo: "https://github.com/pierrea5atwit/CloudResearchProject",
  },
  {
    name: "Water Quality Classifier",
    tag: "ML",
    blurb:
      "Random-forest model scoring water quality, with a confidence score and recommendations targeting the most pressing problem areas.",
    stack: ["Python", "scikit-learn"],
    repo: "https://github.com/pierrea5atwit/waterQuality",
  },
  {
    name: "FSH",
    tag: "Systems",
    blurb:
      "A POSIX shell in C — process execution through fork() and execvp(), command tokenization, and status monitoring with waitpid().",
    stack: ["C"],
    repo: "https://github.com/pierrea5atwit/ShellPrgm",
  },
];

/* ---------- the filterable resume ---------- */

export type ResumeKind =
  | "experience"
  | "projects"
  | "leadership"
  | "education"
  | "skills";

export const RESUME_KINDS: { id: ResumeKind; label: string }[] = [
  { id: "experience", label: "experience" },
  { id: "projects", label: "projects" },
  { id: "leadership", label: "leadership" },
  { id: "education", label: "education" },
  { id: "skills", label: "skills" },
];

export type ResumeEntry = {
  kind: ResumeKind;
  title: string;
  org?: string;
  when?: string;
  where?: string;
  points?: string[];
  /** Skills rows and coursework render as a tag list instead of bullets. */
  tags?: string[];
  repo?: string;
  live?: string;
  note?: string;
};

export const RESUME: ResumeEntry[] = [
  /* ---- experience ---- */
  {
    kind: "experience",
    title: "Data Analytics & Engineering Intern",
    org: "Dynatrace",
    when: "Jun — Aug 2026",
    where: "Boston, MA",
    points: [
      "Automated data quality checks and testing for analytics output with custom code against Snowflake (~10s per query), cutting error-detection time from 72 hours to 8.",
      "Built a metadata view that queries Snowflake tables, runs quality tests on what it pulls, asserts compliance with team data standards, and surfaces every failure and warning.",
      "Onboarded a 24-person team to a shared Claude skill-design workflow during org-wide AI adoption, establishing reusable practices across teams.",
      "Delivered an end-of-summer presentation to executive leadership on technical growth and company culture.",
    ],
  },
  {
    kind: "experience",
    title: "Software Engineering Intern",
    org: "Liberty Mutual",
    when: "Jun — Aug 2025",
    where: "Portsmouth, NH",
    points: [
      "Technical lead on two full-stack internal tools (Python, TypeScript, SQL) that replaced manual lookup of IT engagement data for cross-functional managers.",
      "Designed an API-backed people-analytics chat interface translating natural language into SQL and dashboards; iterated system prompts for query quality and database-safety compliance.",
      "Trained a locally run scikit-learn linear regression to surface data-security trends.",
      "Led five interns through Agile sprints, Git and Python, delivering two weeks ahead of schedule.",
    ],
  },
  {
    kind: "experience",
    title: "Young Adult Leader, Youth Advisory Board",
    org: "Health Resources in Action · MA Dept. of Public Health",
    when: "Apr 2025 — present",
    where: "Massachusetts",
    points: [
      "Coordinate meetings with Comprehensive School Health Services staff on outreach and data-collection methods for schools under varying grant statuses statewide.",
      "Wrote Python scripts to clean and process school grant-status data held in RedCap.",
      "Manage 14 young adults working alongside healthcare professionals on statewide public-health focus groups.",
    ],
  },
  {
    kind: "experience",
    title: "Camp Coach — Python, LEGO SPIKE, Scratch, Minecraft",
    org: "CodeWiz Needham",
    when: "Apr — Aug 2024 · Apr — Jun 2025",
    where: "Needham, MA",
    points: [
      "Taught parallel one-hour classes for children aged 6–12 across Python, LEGO SPIKE engineering, and Minecraft modding, in sections of 2–5 students.",
      "Wrote the curricular projects and assignments; several students progressed and returned for later camps.",
    ],
  },

  /* ---- projects ---- */
  {
    kind: "projects",
    title: "Apollo — Local-First Voice Agent",
    when: "2026",
    tags: ["Python", "Ollama (Llama 3.1 8B)", "SQLite / FTS5", "FastAPI", "whisper.cpp"],
    note: "Private while in progress.",
    points: [
      "Designed a fully on-device voice agent — audio capture, local speech-to-text, a planning loop over a local 8B model, tool dispatch and memory — with no cloud inference in the request path.",
      "Refactored into a layered architecture (perception, cognitive core, memory) with a syscall-style boundary between layers, and split memory into four independent lanes.",
      "Added a per-turn governor and replay evaluation over a suite that now runs 845 tests.",
      "Migrated memory from flat Markdown to SQLite/FTS5 with BM25 retrieval, and shipped a consolidation 'janitor' cutting token usage ~83% (~60K → ~10K per session).",
    ],
  },
  {
    kind: "projects",
    title: "EquiBirth AI — Preterm Birth Disparity Analysis",
    org: "AI4ALL Research Cohort",
    when: "May — Oct 2026",
    tags: ["Python", "scikit-learn", "Streamlit", "Colab"],
    repo: "https://github.com/ParshvCrafts/EquiBirth_AI",
    points: [
      "Proposed the stack and system design to process ~25M CDC natality records on a team of 7.",
      "Reached AUC-ROC ≈ 0.66 against a false 0.91 baseline that was inflated by data leakage.",
      "Ran a fairness audit surfacing ~2.7x over-flagging of Black mothers, and framed the core fairness hypothesis.",
      "Built an interactive dashboard walking non-technical audiences through the findings, including a preterm-birth likelihood gap (12.3% vs 7.5%) that persists.",
    ],
  },
  {
    kind: "projects",
    title: "NSBE Region 1 Chapter Systems",
    org: "Region 1 Membership Chair",
    when: "2026",
    tags: ["TypeScript", "React", "Python", "Flask", "ChromaDB", "Ollama", "Docker"],
    note: "Private — handles member data.",
    points: [
      "Built a privacy-first operations dashboard covering 103 chapters and 2,800+ members.",
      "Developed a raw → filtered → clean ETL pipeline guaranteeing that only cleaned, protected data reaches the client; member PII never reaches the repo.",
      "Built a local RAG backend for meeting intelligence: ingest notes and documents, store semantic memory, answer with structured output. Runs entirely on-device, containerized.",
    ],
  },
  {
    kind: "projects",
    title: "Pokémon AI Agent",
    when: "Jul 2025 — Apr 2026",
    tags: ["Python", "scikit-learn", "pandas", "PokeAPI"],
    repo: "https://github.com/pierrea5atwit/nuzlockeSystem2",
    points: [
      "Engineered a multi-model system for data analysis, opponent prediction and risk-weighted decision-making, using a mixture-of-experts approach to predict battle outcomes.",
      "Built an end-to-end pipeline caching PokeAPI data on first encounter, simulating battles into pandas datasets, and training scikit-learn classifiers to pick the most effective move.",
      "Tested across 1,000+ simulations for a 22% improvement in predicted win accuracy.",
      "Built a playable 1-on-1 battle simulator producing transcripts for testing and logging.",
    ],
  },
  {
    kind: "projects",
    title: "NVIDIA vGPU Virtualization Research",
    org: "Cloud Computing, Wentworth",
    when: "Feb — Apr 2026",
    tags: ["Python", "CuPy", "NVML", "pytest"],
    repo: "https://github.com/pierrea5atwit/CloudResearchProject",
    points: [
      "Researched GPU virtualization, establishing grounds for a low-overhead framework for vGPU scheduling to optimize workloads.",
      "Simulated machine-learning training over a vGPU connection, measured with NVML and CuPy.",
      "Implemented a CuPy kNN inference model and matrix-multiplication routine to simulate heavy workloads requiring vGPU sharing from local machines.",
      "Composed a pytest and logging system validating init, runtime and experiment success to gather data.",
    ],
  },
  {
    kind: "projects",
    title: "InterviewAI Coach",
    when: "2026",
    tags: ["JavaScript", "faster-whisper", "Docker"],
    repo: "https://github.com/pierrea5atwit/Interview_Web_App",
    points: [
      "Record an interview answer in the browser and get it transcribed and scored; recording auto-stops after five seconds of silence.",
      "Transcription runs server-side rather than through a third-party audio API.",
    ],
  },
  {
    kind: "projects",
    title: "Water Quality Classifier",
    when: "2025",
    tags: ["Python", "scikit-learn"],
    repo: "https://github.com/pierrea5atwit/waterQuality",
    points: [
      "Trained a random-forest classifier scoring water quality, returning both a quality score and a model-confidence score.",
      "Surfaces recommendations targeting the most pressing problem areas in a sample.",
    ],
  },
  {
    kind: "projects",
    title: "FSH — POSIX Shell",
    org: "Operating Systems, Wentworth",
    when: "2026",
    tags: ["C"],
    repo: "https://github.com/pierrea5atwit/ShellPrgm",
    points: [
      "Process forking and execution via fork() and execvp(), command parsing and tokenization, and status monitoring with waitpid().",
    ],
  },
  {
    kind: "projects",
    title: "This Site",
    when: "2026",
    tags: ["TypeScript", "React", "Vite", "Canvas"],
    repo: "https://github.com/pierrea5atwit/andrew-portfol",
    live: "https://andrew-portfol.vercel.app",
    points: [
      "Hand-rolled wireframe globe on one canvas — no 3D library — with a gecko that walks its surface in spherical coordinates, chasing the cursor along great circles.",
      "Doubles as a sandbox for TSX experiments.",
    ],
  },
  {
    kind: "projects",
    title: "Weather App",
    org: "Java, Open-Meteo + geocoding APIs",
    when: "2025",
    tags: ["Java"],
    repo: "https://github.com/pierrea5atwit/weatherAPIConnect",
    points: [
      "Looks up any city by geolocation and reports temperature, time and wind speed, handling invalid response codes and ambiguous city names.",
    ],
  },
  {
    kind: "projects",
    title: "StudyTool",
    org: "Group hackathon project",
    when: "2025",
    tags: ["JavaScript"],
    repo: "https://github.com/pierrea5atwit/StudyToolRepo",
    points: ["Hackathon build with a four-person team."],
  },

  /* ---- leadership ---- */
  {
    kind: "leadership",
    title: "Region 1 Membership Chair",
    org: "National Society of Black Engineers",
    when: "Apr 2026 — present",
    where: "New England",
    points: [
      "Own membership data for 103 chapters and 2,800+ members across the Region 1 Membership Zone.",
      "Oversee an executive board of State Chairs, Pre-Collegiate, Professional and other committees.",
    ],
  },
  {
    kind: "leadership",
    title: "Vice President",
    org: "National Society of Black Engineers, Wentworth",
    when: "Apr 2025 — 2026",
    where: "Boston, MA",
    points: [
      "Led a 110+ member chapter and an 11-person student executive board, overseeing membership engagement and chapter affairs.",
      "Chapter earned Regional Chapter of the Year, Chapter of the Month, and WIT student-organization program of the year.",
    ],
  },
  {
    kind: "leadership",
    title: "Career Peer Mentor",
    org: "Wentworth Co-ops & Careers",
    when: "Aug 2025 — present",
    where: "Boston, MA",
    points: [
      "Host tutoring sessions and workshops building students' job-search skills and comfort in professional environments.",
      "Peer-reviewed resumes for 60+ students across the Schools of Computing & Cybersecurity.",
    ],
  },

  /* ---- education ---- */
  {
    kind: "education",
    title: "B.S. Computer Science",
    org: "Wentworth Institute of Technology",
    when: "Expected Dec 2027",
    where: "Boston, MA",
    points: ["Minors in Data Science and Applied Math."],
  },
  {
    kind: "education",
    title: "Coursework",
    org: "Wentworth Institute of Technology",
    tags: [
      "Operating Systems",
      "Databases",
      "AI Applications",
      "Software Engineering",
      "Cloud Computing",
      "Linear Algebra",
      "Probability",
      "Statistics",
      "Calculus",
      "Object-Oriented Programming",
    ],
  },
  {
    kind: "education",
    title: "AI4ALL Research Cohort",
    when: "May — Oct 2026",
    points: [
      "Selected research cohort; produced the EquiBirth AI preterm-birth disparity study with a team of 7.",
    ],
  },
  {
    kind: "education",
    title: "Dean's List",
    org: "Wentworth Institute of Technology",
    when: "Spring 2025",
  },

  /* ---- skills ---- */
  {
    kind: "skills",
    title: "Focus",
    tags: [
      "LLM integration & agent design",
      "Systems design",
      "Data visualization & processing",
      "Model evaluation",
    ],
  },
  {
    kind: "skills",
    title: "AI & Engineering",
    tags: [
      "Generative AI (Claude, Ollama)",
      "LLM integration",
      "Agentic systems",
      "RAG",
      "Memory architecture",
      "Model evaluation",
      "ChromaDB",
      "FastAPI",
      "Flask",
      "Docker",
      "Microsoft Azure",
    ],
  },
  {
    kind: "skills",
    title: "Analytics & Data",
    tags: [
      "SQL",
      "Snowflake",
      "scikit-learn",
      "pandas",
      "ETL pipelines",
      "Dashboards",
      "Data governance",
      "Fairness / bias auditing",
      "SQLite",
      "MongoDB",
      "Excel",
    ],
  },
  {
    kind: "skills",
    title: "Languages",
    tags: [
      "Python",
      "TypeScript / JavaScript",
      "C / C++",
      "Java",
      "Rust",
      "SQL",
      "React",
      "Node.js",
      "HTML",
      "MATLAB",
    ],
  },
  {
    kind: "skills",
    title: "Tools",
    tags: [
      "Git",
      "Claude Code",
      "VS Code",
      "pytest",
      "Vercel",
      "Netlify",
      "Render",
      "CodePen",
      "Slack",
      "Microsoft Office",
    ],
  },
  {
    kind: "skills",
    title: "Spoken",
    tags: ["English", "Haitian Creole", "French"],
  },
];

export const LINKS = {
  github: "https://github.com/pierrea5atwit",
  linkedin: "https://linkedin.com/in/andrew-pierre",
  email: "mailto:pierrea5@wit.edu",
};
