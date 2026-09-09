/**
 * Single source of truth for site content.
 *
 * Keep this file honest — everything here is public-facing. If a link is
 * `undefined` the card renders as private instead of dead-linking.
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
  /** Featured projects render large, at the top of the grid. */
  featured?: boolean;
};

export const PROJECTS: Project[] = [
  {
    name: "Apollo",
    tag: "Local-first agent",
    featured: true,
    blurb:
      "Push-to-talk assistant running the whole loop on-device: audio, STT, a ReAct planner over a local 8B model, tools, memory, speech. No cloud inference anywhere in the path.",
    stack: ["Python", "Ollama", "whisper.cpp", "SQLite / FTS5", "FastAPI"],
    privateNote: "Private while in progress — happy to walk the architecture.",
  },
  {
    name: "Meridian",
    tag: "Calendar",
    featured: true,
    blurb:
      "Every .ics feed I subscribe to — school, NSBE, personal — merged into one calendar instead of four tabs. Self-provisions its own storage on first run.",
    stack: ["TypeScript", "React", "Vite", "Postgres"],
    repo: "https://github.com/pierrea5atwit/meridian-cal",
    live: "https://meridian-two-eta.vercel.app",
  },
  {
    name: "NSBE Region 1 Dashboard",
    tag: "Data / ETL",
    blurb:
      "Chapter-health dashboard across 103 chapters and 2,800+ members. Raw exports run a filtered-then-clean ETL, so member PII never reaches the repo.",
    stack: ["TypeScript", "React", "Vite"],
    privateNote: "Private — handles member data.",
  },
  {
    name: "NSBE RAG Manager",
    tag: "RAG backend",
    blurb:
      "Privacy-preserving retrieval backend for meeting intelligence: ingest notes, store semantic memory, answer with structured output. Runs entirely local.",
    stack: ["Python", "Flask", "ChromaDB", "Ollama", "Docker"],
    repo: "https://github.com/pierrea5atwit/NSBE_RAG_Manager",
  },
  {
    name: "EquiBirth AI",
    tag: "ML R&D",
    blurb:
      "Team research on U.S. maternal safety and inequity — an equity-centered policy tool surfacing where outcomes diverge. I own implementation and pipeline planning.",
    stack: ["Python", "pandas", "Ollama", "Streamlit"],
    privateNote: "Team project — in development.",
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
      "Cloud-computing research into hidden inefficiency in rented NVIDIA vGPU instances — why instances advertising identical capacity vary up to 30% in runtime.",
    stack: ["Python", "Virtualization", "Benchmarking"],
    repo: "https://github.com/pierrea5atwit/CloudResearchProject",
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

export type Role = {
  org: string;
  title: string;
  when: string;
  where: string;
  points: string[];
};

export const ROLES: Role[] = [
  {
    org: "Dynatrace",
    title: "Data Analytics & Engineering Intern",
    when: "Jun — Aug 2026",
    where: "Boston, MA",
    points: [
      "Automated data quality and assurance for the Data & Analytics team, cutting a workflow-disrupting request down to ~10s retrieval.",
      "Built a data view over user-accessible Snowflake tables that generates staging tests and renders the database as a visual spreadsheet with warnings and shape information.",
      "Onboarded a team of 24 to a Claude-skill design workflow during the company's AI adoption, giving teams a shared interface for fast collaboration.",
    ],
  },
  {
    org: "Liberty Mutual",
    title: "Software Engineering Intern",
    when: "Jun — Aug 2025",
    where: "Portsmouth, NH",
    points: [
      "Technical lead on two full-stack internal tools (Python / TypeScript / SQL) that replaced manual lookup processes for cross-functional managers.",
      "Architected and delivered both in an Agile workflow, guiding five other interns and launching two weeks early with added UX work.",
      "Designed an API-backed people-analytics chat interface translating natural language into SQL and dashboards, and trained a local scikit-learn regression to surface data-security trends.",
    ],
  },
  {
    org: "NSBE",
    title: "Region 1 Membership Chair",
    when: "Apr 2026 — present",
    where: "Region 1",
    points: [
      "Own membership data for 103 chapters and 2,800+ members.",
      "Oversee an executive board of state, pre-collegiate, and professional committee chairs.",
    ],
  },
  {
    org: "Health Resources in Action · MA DPH",
    title: "Young Adult Leader",
    when: "May 2025 — present",
    where: "Massachusetts",
    points: [
      "Run a bi-weekly youth advisory board, managing 14 young adults working alongside healthcare professionals.",
      "Organize statewide focus groups on youth public-health improvement.",
    ],
  },
];

export const LINKS = {
  github: "https://github.com/pierrea5atwit",
  linkedin: "https://linkedin.com/in/andrew-pierre-6aa1592b3",
  email: "mailto:pierrea5@wit.edu",
};
