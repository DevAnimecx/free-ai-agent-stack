// NFR (i18n-ready): every user-visible string lives here, so V2 localisation is
// a matter of swapping this module rather than touching components.
// Nothing in /components or /app should contain literal UI copy.

export const strings = {
  site: {
    name: "free-ai-agent-stack",
    tagline: "Free AI agent tools, verified weekly",
    domain: "freeaiagentstack.dev",
    url: "https://freeaiagentstack.dev",
    description:
      "Every free LLM API, MCP server, agent framework and free-tier infrastructure service you need to build an AI agent in 2026 — with free limits, credit-card requirements and verification dates.",
    license: "Data CC-BY-4.0 · Code MIT",
    repo: "https://github.com/free-ai-agent-stack/free-ai-agent-stack",
  },
  nav: {
    categories: "Categories",
    about: "Methodology",
    contribute: "Contribute",
    data: "Data",
    skip: "Skip to content",
  },
  home: {
    h1: "Free AI agent tools, checked by hand and by robot",
    lede:
      "Every free LLM API, MCP server, agent framework and free-tier service you need to build an agent in 2026 — with the free limit, the rate limit, whether a credit card is required, and the date a human last confirmed it.",
    statsTotal: "resources catalogued",
    statsNoCard: "need no credit card",
    statsFresh: "verified within 30 days",
    searchPlaceholder: "Search 235 free AI tools, APIs and services…",
    featured: "Start here",
    featuredSub: "The entries most people should look at first.",
    browseAll: "Browse all categories",
    forAgents: "Building an agent, not a human?",
    forAgentsBody:
      "The whole dataset is published as JSON and an llms.txt summary, with stable IDs and verification dates, so an agent can cite it without scraping HTML.",
    howItWorks: "How verification works",
  },
  explorer: {
    searchPlaceholder: "Filter by name, provider, tag…",
    filters: "Filters",
    noCard: "No credit card",
    openSource: "Open source",
    official: "Official / vendor-maintained",
    noAuth: "No authentication needed",
    active: "Working right now",
    sort: "Sort",
    sortAlphabetical: "A → Z",
    sortVerified: "Recently verified",
    sortFreeLimit: "Largest free limit",
    sortStars: "Most starred",
    results: "showing",
    of: "of",
    clear: "Clear filters",
    none: "No entries match those filters.",
    noneHint: "Try removing a filter — the “no credit card” toggle is the most restrictive one.",
    modality: "Modality",
    category: "Category",
  },
  card: {
    freeLimit: "Free limit",
    rateLimit: "Rate limit",
    install: "Install",
    auth: "Auth",
    noAuth: "none",
    verifiedPrefix: "verified",
    review: "Review",
    report: "Report outdated",
    visit: "Open",
    copy: "Copy",
    copied: "Copied",
    deprecatedNote: "No longer free — kept so you do not waste a signup.",
    trainingOn: "Trains on your prompts",
    trainingOff: "Does not train on prompts",
    commercialNo: "Non-commercial use only",
    coldStart: "Cold-start risk",
    tools: "tools",
    stars: "stars",
  },
  verified: {
    fresh: "verified this week",
    aging: "verified this month",
    stale: "needs re-verification",
    days: "days ago",
    today: "today",
  },
  status: {
    active: "active",
    degraded: "degraded",
    broken: "broken link",
    deprecated: "no longer free",
  },
  about: {
    h1: "Methodology",
    lede:
      "What “free” means here, how each entry is verified, and exactly which parts of a listing a robot is allowed to change.",
  },
  contribute: {
    h1: "Contribute",
    lede: "Adding a resource takes three steps: fork, add twelve lines of YAML, open a PR. CI checks the schema, the duplicates and the link before a human reads it.",
  },
  footer: {
    builtWith: "Built from",
    entries: "entries",
    lastVerified: "Data exported",
    corrections: "Spotted something wrong?",
    correctionsCta: "Report it",
    disclaimer:
      "Independent project. Not affiliated with, endorsed by or sponsored by any listed vendor. Trademarks belong to their owners.",
  },
  a11y: {
    outbound: "opens in a new tab",
    verifiedBadge: "verification date",
    searchLabel: "Search resources",
    filterLabel: "Filter resources",
  },
} as const;

export type Strings = typeof strings;
