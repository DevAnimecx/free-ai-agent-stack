import fs from "node:fs";
import path from "node:path";

import { daysSince, freshness } from "./freshness";
import type { AnyEntry, CategoryConfig, Stats } from "./types";

// Re-exported for server-side consumers; lib/freshness.ts is what client
// components import, so `node:fs` never reaches the browser bundle.
export { daysSince, freshness };

// The site reads the JSON that scripts/export_json.py generates from the YAML.
// Doing the conversion in one place means there is exactly one YAML→JSON
// contract to keep honest, and the build never needs a YAML parser (D-6).
const DATA_ROOT = path.join(process.cwd(), "public", "data");

export const CATEGORIES: CategoryConfig[] = [
  {
    slug: "llm-apis",
    label: "Free LLM APIs",
    title: "Free LLM APIs in 2026 — 63 providers with real limits and no-card flags",
    metaDescription:
      "63 free LLM API providers compared: free limits, rate limits, whether a credit card is required, and the date each was last verified. Includes local runtimes.",
    intro: [
      "A free LLM API is the starting point for almost every agent project, and it is the category where lists rot fastest: Cerebras removed its no-card free tier in July 2026, Google moved its Pro models behind billing in April, and Half the providers quoted in older guides now require a payment method before the first request.",
      "Every entry below states the free allowance in the vendor's own units, the rate limit, whether a credit card is required, and whether the free tier trains on your prompts. Providers that quietly stopped being free are still listed — marked as no longer free, with the replacement named — because knowing where not to go is half the value.",
      "If you want to start in the next five minutes: Gemini gives the most daily requests without a card, Groq is the fastest, and Ollama is the only option with genuinely no limit at all.",
    ],
    schema: "schemas/llm-api.schema.json",
    cardFreeField: "requires_card",
  },
  {
    slug: "mcp-servers",
    label: "MCP Servers",
    title: "MCP servers list 2026 — 62 servers with copy-paste install commands",
    metaDescription:
      "A maintained list of MCP servers for Claude Code, Cursor, VS Code and Windsurf: install command, transport, authentication requirement and official-vs-community status.",
    intro: [
      "Model Context Protocol servers are how an agent reaches the outside world — files, databases, browsers, tickets, payments. The official registry lists what exists; this page tells you what each server actually needs before you run it: the install command, the transport, and whether it wants a token, a connection string or nothing at all.",
      "The signal most directories miss is maintenance. Several widely-recommended servers (Postgres, Slack, Puppeteer, Brave Search) were archived during 2025–2026 and are still recommended all over the web. They are listed here as deprecated, each paired with the maintained server that replaced it.",
      "Start with the reference servers and Context7 if you are new to MCP; if you already have a stack, filter to official servers and check the authentication column before granting an agent access to anything that matters.",
    ],
    schema: "schemas/mcp-server.schema.json",
  },
  {
    slug: "agent-tools",
    label: "Agent Tools",
    title: "Free AI coding agents and agent frameworks in 2026 — real free tiers",
    metaDescription:
      "IDEs, CLI agents, frameworks and orchestrators with genuinely usable free tiers in 2026: Gemini CLI, Cline, LangGraph, n8n, LiteLLM and 35 more.",
    intro: [
      "“Free plan available” is the least useful sentence in developer marketing. This page puts the actual number next to each tool: Gemini CLI's 1,000 free requests per day, GitHub Copilot Free's 2,000 completions, Windsurf's unlimited tab completion with a quota-limited agent.",
      "The cheapest credible setup in 2026 is an open-source agent pointed at a free API tier: Cline or Aider with a Gemini or Groq key costs nothing and has no request ceiling beyond the provider's. The commercial editors are included because their free tiers are genuinely usable for evaluation, not because they are the cheapest path.",
      "Frameworks are listed with what they are actually good at rather than a feature matrix — LangGraph for stateful runs, LiteLLM to stack several free tiers behind one endpoint, n8n when the agent needs to touch existing systems.",
    ],
    schema: "schemas/agent-tool.schema.json",
    cardFreeField: "requires_card",
  },
  {
    slug: "free-tiers",
    label: "Free Tiers",
    title: "Free tier hosting, databases and infra for AI agents in 2026",
    metaDescription:
      "70 free-tier services for shipping an AI agent: hosting, Postgres, vector databases, auth, queues, observability, email and search — with cold-start risk ratings.",
    intro: [
      "An agent needs more than a model: somewhere to run, somewhere to remember, something to search, and something that tells you when it breaks. This is the full stack, with the free limit and a cold-start-risk rating for each service — because free hosting that sleeps for sixty seconds behaves very differently from free hosting that does not.",
      "The strongest free stack in 2026 costs nothing at all: static site on Cloudflare Pages or Vercel, Postgres and auth on Supabase, vectors in Qdrant's free cluster, tracing in self-hosted Langfuse, and the whole thing orchestrated from an Oracle always-free ARM VM. That combination has no time limit and no card requirement.",
      "Watch the database entries specifically: Supabase pauses free projects after seven days of inactivity, Render's free web services spin down after fifteen minutes, and MongoDB Atlas is one of the few free tiers that asks for a card even on the free cluster.",
    ],
    schema: "schemas/free-tier.schema.json",
    cardFreeField: "requires_card",
  },
];

export function categoryBySlug(slug: string): CategoryConfig | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

function readJson<T>(file: string): T {
  const full = path.join(DATA_ROOT, file);
  if (!fs.existsSync(full)) {
    throw new Error(
      `Missing ${path.relative(process.cwd(), full)}. Run \`python3 scripts/export_json.py\` before building the site.`,
    );
  }
  return JSON.parse(fs.readFileSync(full, "utf8")) as T;
}

export function getEntries(slug: string): AnyEntry[] {
  return readJson<AnyEntry[]>(`${slug}.json`);
}

/** Every entry, tagged with the category it came from (for cross-category search). */
export function getAllEntries(): Array<AnyEntry & { _category: string }> {
  return CATEGORIES.flatMap((c) => getEntries(c.slug).map((e) => ({ ...e, _category: c.slug })));
}

export function getStats(): Stats {
  return readJson<Stats>("stats.json");
}

/** Sorted copy used by the server-rendered list (client search re-sorts). */
export function sortEntries(entries: AnyEntry[], mode: string, slug: string): AnyEntry[] {
  const copy = [...entries];
  switch (mode) {
    case "verified":
      return copy.sort((a, b) => (a.verified < b.verified ? 1 : -1));
    case "free-limit":
      return copy.sort((a, b) => {
        const av = "free_limit_tokens_per_day" in a ? (a.free_limit_tokens_per_day ?? -1) : -1;
        const bv = "free_limit_tokens_per_day" in b ? (b.free_limit_tokens_per_day ?? -1) : -1;
        if (av !== bv) return bv - av;
        return a.name.localeCompare(b.name);
      });
    case "stars":
      return copy.sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0));
    default:
      if (slug === "mcp-servers") return copy.sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0));
      return copy.sort((a, b) => a.name.localeCompare(b.name));
  }
}
