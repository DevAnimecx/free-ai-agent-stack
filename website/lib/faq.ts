import { CATEGORIES, getEntries, getStats } from "./loadData";
import { strings } from "./strings";

// Answer Engine Optimization, in code.
//
// Answer engines (Google AI Overviews, ChatGPT Search, Perplexity, Copilot)
// quote self-contained passages rather than ranking pages. So every category
// page ends with real questions as headings and answers of 40–60 words that
// make sense with no surrounding context, numbers substituted from the dataset
// rather than typed. Each set is emitted twice: visibly, for the reader, and as
// FAQPage structured data, for the crawler — never one without the other,
// because structured data that disagrees with the page is a liability.
//
// Copy lives here rather than in strings.ts because every answer is
// interpolated from live counts; for i18n, template the sentences and pass the
// same numbers in.

export interface FaqItem {
  q: string;
  a: string;
}

function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_match, key: string) =>
    key in vars ? String(vars[key]) : `{${key}}`,
  );
}

function facts(slug: string) {
  const stats = getStats();
  const entries = getEntries(slug);
  const count = entries.length;
  // `?? 0` used to sit here, and it manufactured a statistic: for a category
  // that records no card field at all, it produced "0 of which need no credit
  // card" — which reads as a finding about the data rather than the absence of
  // one, and shipped on the MCP-server and skills pages and their social cards.
  // An unrendered token is visible and gets fixed; a plausible zero does not.
  const noCard = stats.no_card[slug] ?? "{noCard}";
  const official = entries.filter((e) => "official" in e && (e as { official?: boolean }).official).length;
  const noAuth = entries.filter(
    (e) => "requires_auth" in e && (e as { requires_auth?: boolean }).requires_auth === false,
  ).length;
  const openSource = entries.filter(
    (e) => "open_source" in e && (e as { open_source?: boolean }).open_source,
  ).length;
  const notFreeAnyMore = stats.deprecated_entries?.length ?? 0;
  return {
    count,
    noCard,
    official,
    noAuth,
    openSource,
    notFreeAnyMore,
    total: stats.total,
    totalNoCard: stats.total_no_card,
    categories: CATEGORIES.length,
    updated: stats.generated_at.slice(0, 10),
  };
}

const TEMPLATES: Record<string, Array<{ q: string; a: string }>> = {
  "llm-apis": [
    {
      q: "How many free LLM APIs are there in 2026?",
      a: "{count} free LLM API providers are listed in this catalogue as of {updated}, and {noCard} of them can be started without a credit card. Each entry records the free limit in the provider's own units, the rate limit, and the date a human last confirmed it.",
    },
    {
      q: "Which free LLM APIs need no credit card?",
      a: "{noCard} of the {count} providers here can be used without entering card details. The catalogue flags every provider that requires a card and can filter them out in one click, which matters because a card-required free tier is a trial with extra steps.",
    },
    {
      q: "Are free LLM APIs actually free?",
      a: "They are free up to a published quota, not unmetered. Every provider listed states a limit — requests per minute, tokens per day, or a credit balance — and this catalogue records that limit instead of repeating a marketing claim. No legitimate unmetered frontier API exists, so none is listed.",
    },
    {
      q: "What is the catch with free LLM APIs?",
      a: "Three catches recur: your prompts may be used for training, commercial use may be restricted, and a free tier can be withdrawn with little notice. All three are recorded per provider here, which is why the entries carry a training flag, a commercial-use flag and a last-verified date.",
    },
  ],
  "mcp-servers": [
    {
      q: "What is an MCP server?",
      a: "An MCP server is a small program that exposes tools to an AI assistant through the Model Context Protocol, an open standard originally published by Anthropic. Instead of building a bespoke integration per client, a server declares its tools once and every MCP-capable client — Claude Code, Cursor, VS Code, Codex — can use them.",
    },
    {
      q: "How many MCP servers are listed here?",
      a: "{count} MCP servers are catalogued as of {updated}, of which {official} are maintained by the company whose service they connect to and {noAuth} need no authentication at all. Each entry carries a copy-paste install command and its transport type.",
    },
    {
      q: "Which MCP servers need no API key?",
      a: "{noAuth} of the {count} servers here run without a key because they operate on your own machine rather than a remote API — filesystem, git, fetch and similar local tools. Remote servers for hosted products necessarily require an account, and the catalogue says which requires what.",
    },
    {
      q: "Are MCP servers free to use?",
      a: "The servers themselves are free and mostly open source, because they are small adapters rather than services. What may cost money is the API behind them: a Slack or Stripe MCP server is free to install but acts on an account that has its own pricing. The catalogue keeps those two facts separate.",
    },
  ],
  "agent-tools": [
    {
      q: "What is the best free AI coding agent in 2026?",
      a: "There is no single best answer, because the honest options split three ways: open-source agents you run and point at your own model key, vendor CLIs with a genuinely free tier, and IDE-integrated agents bundled with an editor. This catalogue lists {count} such tools and records what each one's free access actually costs you.",
    },
    {
      q: "How many free AI coding agents and frameworks are there?",
      a: "{count} are listed here as of {updated}, spanning {official} vendor-maintained tools and {openSource} open-source projects. They range from terminal agents to orchestration frameworks, and each entry states whether a card is required and what the free limit is.",
    },
    {
      q: "Are free AI coding agents really free?",
      a: "Mostly they are free software, not free compute. An open-source agent costs nothing to download but still needs a model, so the real cost is the API key you give it — which is why this catalogue pairs agents with free LLM API providers that need no card.",
    },
    {
      q: "What is the difference between an agent, an IDE and a framework?",
      a: "An agent completes tasks by itself and reports back. An IDE-integrated assistant works inside your editor while you type. A framework is a library you write code against to build your own agent. All three are catalogued here, tagged by category, because people searching for one often need another.",
    },
  ],
  "free-tiers": [
    {
      q: "Which free tiers need no credit card?",
      a: "{noCard} of the {count} services here can be started without a credit card, out of {total} resources across the whole catalogue. Entries that do require a card say so explicitly, and card-gated credit grants are tagged as trials rather than listed as free tiers.",
    },
    {
      q: "What free hosting can I use for an AI agent?",
      a: "The workable free options are container hosting with a sleep policy, always-free virtual machines with tight limits, and static hosting for the frontend. {count} free-tier services are catalogued here as of {updated}, each with its cold-start risk and card requirement recorded.",
    },
    {
      q: "Why do free tiers disappear?",
      a: "Because they are marketing with a cost centre attached. Providers cut them quietly — Oracle halved its Always Free ARM allocation in mid-2026 without an announcement — so this catalogue dates every claim and keeps entries that are no longer free, flagged, so you do not waste a signup on them.",
    },
    {
      q: "What is the difference between always-free and a free trial?",
      a: "Always-free has no end date, though the provider may reclaim idle resources. A trial ends on a date or when a credit balance runs out, and is often card-gated. This catalogue separates the two, and tags credit grants of $100 or more as trials even when they last a month.",
    },
  ],
  skills: [
    {
      q: "What is an agent skill?",
      a: "An agent skill is a folder of instructions and scripts that teaches an agent a workflow it was not trained on — how to lay out a PDF, deploy to Vercel, or repair a failing CI job. Unlike an MCP server it adds no process and no network service: it is just files, which is why skills spread quickly.",
    },
    {
      q: "How do I install an agent skill?",
      a: "For most packs, one command: npx skills add <owner>/<repo> --skill <name>. Packs published by Anthropic, OpenAI, Vercel, CrewAI and Browserbase all install this way, and every install command in this catalogue was executed before it was written down.",
    },
    {
      q: "Are agent skills free?",
      a: "Yes — every skill catalogued here is free files under an open licence. Some skills call a paid service once installed, so this catalogue pairs each vendor pack with the vendor's own free tier where one exists.",
    },
    {
      q: "How can I tell whether a skill really exists?",
      a: "Do not trust a URL status code. ClawHub and skills.sh return HTTP 200 for any path, including invented ones, so a link checker cannot distinguish a real skill from a fake. Verification for this catalogue used registry APIs and repository file listings, where fabricated skills return honest 404s.",
    },
  ],
};

const HOME: Array<{ q: string; a: string }> = [
  {
    q: "What is free-ai-agent-stack?",
    a: "A hand-verified catalogue of {total} free resources for building AI agents in 2026 — LLM APIs, MCP servers, agent tools, infrastructure free tiers and agent skills — across {categories} categories. Every entry records its free limit, whether a credit card is required, and the date a human last verified it.",
  },
  {
    q: "How often is this data updated?",
    a: "Every URL is re-checked daily by a robot, which flags dead links after three consecutive failures. Human verification dates are recorded per entry and anything older than 30 days is returned to the weekly triage list. The dataset was last exported on {updated}.",
  },
  {
    q: "Can I use this data in my own project?",
    a: "Yes. The data is licensed CC BY 4.0 and the code is MIT, so you may republish and adapt it commercially provided you attribute it. The full catalogue is published as JSON and as an llms.txt summary with stable IDs, so you can consume it directly rather than scraping the pages.",
  },
  {
    q: "How do I know a claim here is accurate?",
    a: "Every entry names the date and handle of whoever verified it, and the catalogue keeps resources that quietly stopped being free — flagged rather than deleted — so the record shows where claims failed. Entries that require a credit card are labelled, never presented as free.",
  },
  {
    q: "Is there an API for this catalogue?",
    a: "There is no rate-limited API because none is needed: the whole dataset is static JSON at /data/all.json, with per-category files alongside it, plus /llms.txt and /llms-full.txt for language models. The files are regenerated from the YAML source on every change and are cacheable indefinitely.",
  },
];

export function faqFor(slug: string): FaqItem[] {
  const templates = TEMPLATES[slug];
  if (!templates) return [];
  const vars = facts(slug);
  return templates.map((item) => ({
    q: fill(item.q, vars),
    a: fill(item.a, vars),
  }));
}

export function homeFaq(): FaqItem[] {
  const vars = facts("llm-apis");
  return HOME.map((item) => ({ q: fill(item.q, vars), a: fill(item.a, vars) }));
}

/**
 * One-sentence, self-contained summary — the passage an engine lifts.
 *
 * Written per category rather than from one template, because the categories do
 * not share a billing model and a shared sentence produced a false claim. MCP
 * servers and skills record no `requires_card` field at all — a self-hosted
 * server has no billing relationship and a skill is a folder of files — so
 * reading the card count for them yielded "0 of which need no credit card",
 * which reads as an assertion that none of them are card-free. It was wrong on
 * two of five category pages and on their social cards. Each category is now
 * described with a statistic that exists for it.
 */
export function answerSummary(slug?: string): string {
  const vars = facts(slug ?? "llm-apis");
  if (!slug) {
    return strings.home.answerSummary
      .replaceAll("{total}", String(vars.total))
      .replaceAll("{noCard}", String(vars.totalNoCard))
      .replaceAll("{categories}", String(vars.categories))
      .replaceAll("{updated}", vars.updated);
  }

  const category = CATEGORIES.find((c) => c.slug === slug);
  const label = category?.label ?? slug;
  const updated = vars.updated;

  switch (slug) {
    case "skills":
      return `${label}: ${vars.count} verified packs, catalogues, registries and individual skills, last checked ${updated}. Every one is free files under an open licence — no card, no account.`;
    case "mcp-servers":
      return `${label}: ${vars.count} verified servers, ${vars.noAuth} of which need no authentication, last checked ${updated}. Each entry carries a copy-paste install command and its transport.`;
    default:
      return `${label}: ${vars.count} verified entries, ${vars.noCard} of which need no credit card, last checked ${updated}.`;
  }
}
