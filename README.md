<div align="center">

# free-ai-agent-stack

**The definitive, human-verified catalogue of free AI agent tools, free LLM APIs, MCP servers, agent frameworks and free-tier infrastructure for 2026. Build a production-grade AI agent for $0.00 — with verified free limits, no credit card requirements, and links checked daily.**

**By [Adarsh Kushwah](https://github.com/DevAnimecx) — Dev Animecx**

[![Stars](https://img.shields.io/github/stars/DevAnimecx/free-ai-agent-stack?style=for-the-badge&logo=github&logoColor=white&label=Stars)](https://github.com/DevAnimecx/free-ai-agent-stack/stargazers)
[![Forks](https://img.shields.io/github/forks/DevAnimecx/free-ai-agent-stack?style=for-the-badge&label=Forks)](https://github.com/DevAnimecx/free-ai-agent-stack/forks)
[![Watch](https://img.shields.io/github/watchers/DevAnimecx/free-ai-agent-stack?style=for-the-badge&label=Watch)](https://github.com/DevAnimecx/free-ai-agent-stack)
[![License](https://img.shields.io/badge/license-MIT%20%2F%20CC-BY-4.0-blue?style=for-the-badge)](LICENSE)
[![Website](https://img.shields.io/badge/Website-Live%20%28GitHub%20Pages%29-brightgreen?style=for-the-badge)](https://devanimecx.github.io/free-ai-agent-stack/)
[![Data](https://img.shields.io/badge/Data-JSON%20%2B%20llms.txt-ff6b6b?style=for-the-badge)](https://devanimecx.github.io/free-ai-agent-stack/llms.txt)
[![Verified](https://img.shields.io/badge/Verified-100%25%20fresh%20%3C%2030d-4ade80?style=for-the-badge)](https://github.com/DevAnimecx/free-ai-agent-stack/actions/workflows/verify.yml)
[![CI](https://img.shields.io/badge/CI-PRs%20welcome-2ea446?style=for-the-badge)](https://github.com/DevAnimecx/free-ai-agent-stack/pulls)

</div>

---

## 🧠 Build a production AI agent for $0.00 — the complete stack, verified

**384 free-tier resources. 222 with no credit card required. 100% of links verified within the last 30 days.**

Every free LLM API, MCP server, agent framework and free-tier database a developer needs to build an AI agent in 2026 — in one place, with the **free limit**, the **credit-card requirement** and the **date a human last checked it**. Data is YAML in this repo; the website is generated from it; a **daily robot checks every link**.

If a listing says "no credit card", a human verified that. If it says "no longer free", we left it in on purpose — so you stop wasting signups on lists that never update.

> **Free AI agent tools, checked 2026-09-24.** 384 entries · 222 need no credit card · 100% of links verified in the last 30 days.

<!-- STATS:START -->
| Category | Count | No credit card | Verified <30d | Top pick |
|---|---:|---:|---:|---|
| [Free LLM APIs](data/llm-apis.yaml) | 70 | 58 | 70 | Cloudflare Workers AI |
| [MCP Servers](data/mcp-servers.yaml) | 64 | — | 64 | Context7 |
| [Agent Tools](data/agent-tools.yaml) | 82 | 82 | 82 | Aider |
| [Free Tiers](data/free-tiers.yaml) | 90 | 82 | 90 | Better Auth |
| [Agent Skills](data/skills.yaml) | 78 | — | 78 | Anthropic Agent Skills |
| **Total** | **384** | **222** | **384** | — |

_Auto-generated 2026-09-24T11:39:08+00:00 · link freshness 100.0% verified within 30 days (target 95%)._
<!-- STATS:END -->

---

## 🎯 Why this list exists

Most "free AI" lists are copied from each other and never re-verified. By 2026, the gap between what they claim and what actually works is a graveyard of wasted signups. This catalogue exists to close that gap:

- **Every entry was checked by a human** against the vendor's pricing page, and the date is recorded.
- **We are deliberately conservative.** If we don't know whether a signup needs a credit card, we say it does — a wrong "no card required" costs you time.
- **We keep the dead.** Providers that stopped being free (OpenAI, Anthropic, xAI, DeepSeek, Together, Perplexity) stay in the list with the reason, so you stop opening their pricing pages.
- **A robot checks every link daily.** Three consecutive failures sets `status: broken` and opens a tracking issue.

The result: a list you can build on, not one you have to verify yourself.

---

## ⚡ Quick start: build an agent for $0 this weekend

```bash
# 1. Get a free key (no card) — pick any one of these
#    Google AI Studio  https://aistudio.google.com/apikey    1,500 req/day
#    Groq              https://console.groq.com/keys        1,000 req/day, very fast
#    OpenRouter        https://openrouter.ai/settings/keys  19+ :free models

# 2. Point a free agent at it
npx -y @google/gemini-cli          # 1,000 free requests/day, terminal agent
npx -y @upstash/context7-mcp       # version-pinned docs for your coding agent
docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN ghcr.io/github/github-mcp-server

# 3. Ship it for free
npx create-next-app@latest && npx vercel --prod   # static + serverless, $0 tier
```

## Table of contents

- [Free LLM APIs](#free-llm-apis) — 70 entries (no credit card required: 58)
- [MCP servers](#mcp-servers) — 64 entries (copy-paste install commands)
- [Agent tools & frameworks](#agent-tools--frameworks) — 82 entries (IDEs, CLIs, orchestrators)
- [Free-tier infrastructure](#free-tier-infrastructure) — 90 entries (hosting, databases, vector DBs)
- [Agent skills](#agent-skills) — 78 entries (skill packs and registries)
- [What "free" means here](#what-free-means-here) · [Methodology](#methodology) · [Machine-readable data](#machine-readable-data)
- [FAQ](#faq) · [Deployment](#deployment) · [Contribute](#contribute) · [Licence](#licence)

---

## 🏆 Best free AI agent stacks by use case

| Use case | Recommended stack | Cost |
|---|---|---|
| **Coding agent** | Gemini CLI (1,000 req/day) + Context7 MCP + Ollama (local fallback) | $0.00 |
| **Voice agent** | Groq (STT/TTS via Canary) + ElevenLabs free (10K chars/mo) + Deepgram ($200 credit) | $0.00 |
| **RAG / knowledge base** | Cloudflare Workers AI + Qdrant Cloud (1GB) + Context7 MCP | $0.00 |
| **Autonomous researcher** | Playwright MCP + Tavily MCP + OpenRouter free (19+ models) | $0.00 |
| **Self-hosted** | Ollama + n8n (fair-code) + Supabase (500MB Postgres) + Langfuse (self-hosted) | $0.00 |
| **Enterprise prototype** | GitHub Models + Vercel + Cloudflare D1/R2 + Oracle Cloud Always Free | $0.00 |
| **Offline / privacy** | Ollama + LM Studio + Sentence Transformers + Piper TTS | $0.00 |
| **Browser-based** | WebLLM + Transformers.js + Puter.js (client-side AI) | $0.00 |

---

## Free LLM APIs

70 free LLM API providers, from frontier multimodal models to models you run on your own laptop. Every entry states the free limit, the rate limit and whether a card is required. The full list lives in [`data/llm-apis.yaml`](data/llm-apis.yaml).

### Top picks

#### Google Gemini API

**Google** · 1,500 requests/day on Flash, 1,000/day on Flash-Lite; 250K TPM · no credit card · verified 2026-09-24

Frontier multimodal models on a permanent free tier — Flash and Flash-Lite families only since April 2026. Free-tier prompts are used to improve Google products. → [ai.google.dev](https://ai.google.dev) · [`#google-gemini`](https://devanimecx.github.io/free-ai-agent-stack/llm-apis#google-gemini)

#### Groq Cloud

**Groq** · 1,000 req/day and 200K tokens/day per model · no credit card · verified 2026-09-24

Open-weight models at 300+ tokens/sec on LPU hardware, with the most generous request-per-day allowance of any free tier. → [groq.com](https://groq.com) · [`#groq`](https://devanimecx.github.io/free-ai-agent-stack/llm-apis#groq)

#### OpenRouter Free Models

**OpenRouter** · 50 requests/day (1,000/day after a one-time $10 credit purchase) · no credit card · verified 2026-09-24

One OpenAI-compatible key fronting 19+ `:free` models across providers. The `:free` roster rotates monthly. → [openrouter.ai](https://openrouter.ai) · [`#openrouter-free`](https://devanimecx.github.io/free-ai-agent-stack/llm-apis#openrouter-free)

#### Cloudflare Workers AI

**Cloudflare** · 10,000 Neurons/day · no credit card · verified 2026-09-24

Serverless inference that runs inside a Worker — no egress cost, no cold-start management. Budget is in Neurons, not tokens. → [developers.cloudflare.com](https://developers.cloudflare.com/workers-ai/) · [`#cloudflare-workers-ai`](https://devanimecx.github.io/free-ai-agent-stack/llm-apis#cloudflare-workers-ai)

#### Ollama

**Ollama** · Unlimited; limited only by your GPU/RAM · no credit card · verified 2026-09-24

The default way to run open models locally — one command to pull, serve and expose an OpenAI-compatible endpoint. → [ollama.com](https://ollama.com) · [`#ollama`](https://devanimecx.github.io/free-ai-agent-stack/llm-apis#ollama)

> **70 entries in total**, including every provider that quietly stopped being free (OpenAI, Anthropic, xAI, DeepSeek, Together, Perplexity — all marked `status: deprecated` with the reason). [See the full list](https://devanimecx.github.io/free-ai-agent-stack/llm-apis) · [raw data](data/llm-apis.yaml)

---

## MCP servers

64 MCP servers with copy-paste install commands, transport, auth requirements and official-vs-community status. The MCP registry lands in 2026; this list stays useful because it tells you what a server *needs* before you run it. Full list: [`data/mcp-servers.yaml`](data/mcp-servers.yaml).

### Top picks

#### Context7

**Upstash** · `npx -y @upstash/context7-mcp` · stdio, http · no auth

Version-pinned, up-to-date documentation for thousands of libraries — the single highest-value server for coding agents. → [github.com/upstash/context7](https://github.com/upstash/context7) · [`#context7-mcp`](https://devanimecx.github.io/free-ai-agent-stack/mcp-servers#context7-mcp)

#### GitHub MCP Server

**GitHub** · `docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN ghcr.io/github/github-mcp-server` · stdio, http · PAT required

Repo automation, PRs, issues, code search and CI workflows — 51 tools. → [github.com/github/github-mcp-server](https://github.com/github/github-mcp-server) · [`#github-mcp`](https://devanimecx.github.io/free-ai-agent-stack/mcp-servers#github-mcp)

#### Playwright MCP

**Microsoft** · `npx -y @playwright/mcp@latest` · stdio, http · no auth

Browser automation over accessibility snapshots rather than screenshots — far fewer tokens than screenshot-based agents. → [github.com/microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp) · [`#playwright-mcp`](https://devanimecx.github.io/free-ai-agent-stack/mcp-servers#playwright-mcp)

#### Filesystem

**MCP Steering Group** · `npx -y @modelcontextprotocol/server-filesystem /path/to/allowed/dir` · stdio · no auth

Secure local file operations with configurable allow-listed directories — where every local agent starts. → [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem) · [`#filesystem-mcp`](https://devanimecx.github.io/free-ai-agent-stack/mcp-servers#filesystem-mcp)

#### Qdrant MCP

**Qdrant** · `uvx mcp-server-qdrant --qdrant-url <url>` · stdio · API key

Stores and retrieves memories in a Qdrant collection — vector memory as a tool, paired with Qdrant's free 1GB cluster. → [github.com/qdrant/mcp-server-qdrant](https://github.com/qdrant/mcp-server-qdrant) · [`#qdrant-mcp`](https://devanimecx.github.io/free-ai-agent-stack/mcp-servers#qdrant-mcp)

> **64 entries in total**, including the archived reference servers (`postgres`, `slack`, `puppeteer`, `brave-search`) that most tutorials still tell you to install, each replaced with a maintained alternative. [See the full list](https://devanimecx.github.io/free-ai-agent-stack/mcp-servers) · [raw data](data/mcp-servers.yaml)

---

## Agent tools & frameworks

82 IDEs, CLI agents, frameworks and orchestrators — with the actual numbers on each free tier rather than a vague "free plan available". Full list: [`data/agent-tools.yaml`](data/agent-tools.yaml).

### Top picks

#### Gemini CLI

**cli** · 1,000 requests/day with a personal Google account (60 RPM) · open source

Google's open-source terminal agent with the most generous free quota of any first-party CLI. The best $0 coding agent in 2026. → [github.com/google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli) · [`#gemini-cli`](https://devanimecx.github.io/free-ai-agent-stack/agent-tools#gemini-cli)

#### Cline

**ide** · Free and open source — bring any provider key (including free tiers) · open source

Autonomous coding agent for VS Code, JetBrains and the terminal, with human approval at every step. Point it at Gemini or Groq free tiers and a full agent costs nothing. → [cline.bot](https://cline.bot) · [`#cline`](https://devanimecx.github.io/free-ai-agent-stack/agent-tools#cline)

#### LangGraph

**framework** · Open source (MIT) · Python

Stateful, graph-based agent orchestration with durable execution, human-in-the-loop and time travel. → [langchain-ai.github.io/langgraph](https://langchain-ai.github.io/langgraph/) · [`#langgraph`](https://devanimecx.github.io/free-ai-agent-stack/agent-tools#langgraph)

#### n8n

**orchestrator** · Self-hosted Community Edition is free forever (fair-code licence) · TypeScript

Node-based automation with native AI agent nodes, MCP trigger and hundreds of integrations. → [n8n.io](https://n8n.io) · [`#n8n`](https://devanimecx.github.io/free-ai-agent-stack/agent-tools#n8n)

#### LiteLLM

**framework** · Open source (MIT) · Python

One OpenAI-shaped interface over 100+ providers, with a proxy that adds budgets, keys and tracing — the cleanest way to stack several free tiers behind one endpoint. → [docs.litellm.ai](https://docs.litellm.ai) · [`#litellm`](https://devanimecx.github.io/free-ai-agent-stack/agent-tools#litellm)

> [See the full list](https://devanimecx.github.io/free-ai-agent-stack/agent-tools) · [raw data](data/agent-tools.yaml)

---

## Free-tier infrastructure

90 free-tier services you actually need to ship: hosting, databases, vector stores, auth, queues, observability, email and search. Each entry includes a **cold-start risk** rating, because "free hosting" that sleeps for 60 seconds is not the same as free hosting. Full list: [`data/free-tiers.yaml`](data/free-tiers.yaml).

### Top picks

#### Vercel

**hosting** · Hobby: 100GB bandwidth/mo, 100h serverless, $5/mo AI credit · low cold-start risk

Static and serverless hosting with preview deployments per branch and AI Gateway included. Hobby is explicitly non-commercial. → [vercel.com](https://vercel.com) · [`#vercel`](https://devanimecx.github.io/free-ai-agent-stack/free-tiers#vercel)

#### Supabase

**database** · 500MB database, 1GB file storage, 50K MAU auth · medium cold-start risk

Postgres with auth, storage, realtime and pgvector in one free project. Projects pause after 7 days of inactivity. → [supabase.com](https://supabase.com) · [`#supabase`](https://devanimecx.github.io/free-ai-agent-stack/free-tiers#supabase)

#### Qdrant Cloud

**vector-db** · 1GB cluster free forever · low cold-start risk

The best free vector tier: a real cluster with payload filtering, no card required. Holds roughly 250K vectors at 384 dimensions. → [qdrant.tech](https://qdrant.tech) · [`#qdrant-cloud`](https://devanimecx.github.io/free-ai-agent-stack/free-tiers#qdrant-cloud)

#### Oracle Cloud Always Free

**compute** · 2 ARM cores + 12GB RAM, 200GB storage, 10TB egress/mo, forever · low cold-start risk

Oracle halved this allowance on 15 June 2026 with no announcement. Two Ampere cores and 12GB is still the only permanently free ARM VM on the market and remains generous enough to self-host several services — including your own Langfuse and n8n. → [oracle.com/cloud/free](https://www.oracle.com/cloud/free/) · [`#oracle-cloud-always-free`](https://devanimecx.github.io/free-ai-agent-stack/free-tiers#oracle-cloud-always-free)

#### Langfuse

**observability** · 50K observations/mo on free cloud; self-hosted is unlimited · low cold-start risk

Open-source LLM tracing, prompt management and evaluation — the default for debugging agent runs. → [langfuse.com](https://langfuse.com) · [`#langfuse`](https://devanimecx.github.io/free-ai-agent-stack/free-tiers#langfuse)

> [See the full list](https://devanimecx.github.io/free-ai-agent-stack/free-tiers) · [raw data](data/free-tiers.yaml)

---

## 📊 Key metrics at a glance

| Metric | Value |
|---|---|
| Total resources | **384** |
| No credit card required | **222** (58%) |
| Human-verified entries | **384** (100%) |
| Links verified within 30 days | **384** (100%) |
| Active entries | **363** |
| Degraded (works with caveats) | **6** |
| Deprecated (no longer free) | **15** |
| Categories | **5** (LLM APIs, MCP Servers, Agent Tools, Free Tiers, Agent Skills) |
| Contributors | **2** (seed-import, hidden-gems-import) |
| Schema version | **1.0.0** |
| Data licence | **CC BY 4.0** |
| Code licence | **MIT** |
| Website | **GitHub Pages** (static, zero runtime cost) |
| Link checking | **Daily** (GitHub Actions) |

---

## 🆕 What's new (2026-09-24)

- **384 entries** live, all verified within the last 30 days
- **Cloudflare Workers AI** promoted to top pick for LLM APIs (10,000 Neurons/day, no card)
- **Context7** confirmed as the highest-value MCP server for coding agents
- **15 deprecated entries** documented with what replaced them — including OpenAI, Anthropic, xAI, DeepSeek, Together AI, and Perplexity
- **Machine-readable JSON endpoints** and `llms.txt` updated for AI consumption
- **FAQ section** added covering "free" tiers, commercial use, and methodology

---

## Agent skills

Skills are folders of instructions and scripts that teach an agent a workflow it was never trained on — how to lay out a PDF, deploy to Vercel, or repair a failing CI job. They add no process, no token and no network service, which is why they spread faster than any other agent primitive.

This section lists where skills come from, at the granularity of *packs* rather than individual skills: the two first-party catalogs, vendor packs maintained by the companies whose APIs they wrap, and the public registries. Full list: [`data/skills.yaml`](data/skills.yaml).

#### Anthropic Agent Skills

**catalog** · 177,887 stars · 19 skills · document, spreadsheet, slide and PDF workflows

Anthropic's official skills repository, and the largest skills project by a wide margin. → [github.com/anthropics/skills](https://github.com/anthropics/skills) · [`#anthropics-skills`](https://devanimecx.github.io/free-ai-agent-stack/skills#anthropics-skills)

#### OpenAI Plugins

**catalog** · 7,141 stars · 536 skills across 62 plugins · the current home for Codex skills

Where OpenAI moved its skill catalogue — vendor plugins from Adobe, Cloudflare, Datadog, Figma, GitHub, Linear, Notion, Sentry, Stripe and Vercel alongside first-party tooling. The older `openai/skills` catalog is deprecated but its 39 curated skills still install. → [github.com/openai/plugins](https://github.com/openai/plugins) · [`#openai-plugins`](https://devanimecx.github.io/free-ai-agent-stack/skills#openai-plugins)

> **74 entries in total.** The warning for this category: registries that render in the browser answer HTTP 200 for *any* path, including invented ones, so a link checker cannot tell a real skill from a fake one — only an API or a file listing can. Of one submitted list of 25 registry entries, 11 existed and 14 did not, and seven of those 14 turned out to exist in another registry. Four named OpenAI skills exist at no path; one exists only as a system skill inside Codex. Every install command here was run before it was written down. [See the full list](https://devanimecx.github.io/free-ai-agent-stack/skills) · [raw data](data/skills.yaml)

---

## What "free" means here

Every entry declares `requires_card` explicitly, and we default it to **true** when the answer is unknown — a wrong "no credit card required" costs you a signup, so we never guess in your favour.

| Field | Meaning |
|---|---|
| `free_limit` | The published free allowance, in the vendor's own units |
| `requires_card` | `true` = payment details needed at signup. Verified, not inferred |
| `requires_phone` | Phone verification required (common for Chinese and Indian providers) |
| `data_used_for_training` | Whether the free tier trains on your prompts — a real cost on "free" |
| `verified` / `verified_by` | ISO date and the handle of whoever last checked |
| `status` | `active` · `degraded` · `broken` · `deprecated` |

`status: deprecated` entries are **kept on purpose**. Six providers that half the internet still lists as free (OpenAI, Anthropic, xAI, DeepSeek, Together AI, Perplexity) are documented here with what replaced them, so you can stop opening their pricing pages.

## Methodology

1. **Human verification.** A maintainer opens the vendor's pricing page and confirms the free limit, the rate limit and the card requirement. The entry records the date and their handle.
2. **Daily automated link checks.** `.github/workflows/verify.yml` HEAD-requests every URL once a day. Three consecutive failures sets `status: broken` and opens a tracking issue; recovery flips it back to `active`.
3. **Stale-entry triage.** Anything unverified for more than 30 days is listed in a weekly "needs re-verification" issue.
4. **Conservative defaults.** Unknown card requirement → `true`. Unknown limit → the entry does not ship.
5. **Community correction.** Every card on the website has a "report outdated" link that pre-fills an issue with the entry's ID.

Read the long form in [`docs/METHODOLOGY.md`](docs/METHODOLOGY.md).

---

## FAQ

### What is a free AI agent stack?
A free AI agent stack is the complete set of tools — LLM APIs, MCP servers, agent frameworks, and infrastructure — that lets you build, run, and ship an autonomous AI agent without paying a cent. This catalogue covers every layer: inference (which model to call), tools (what the agent can do), memory (where it stores facts), and infrastructure (where it runs).

### How is this different from other "free AI" lists?
Three ways. First, every entry was checked by a human against the vendor's pricing page, and the date of that check is recorded — most lists are copied and never re-verified. Second, we are conservative: if we don't know whether a signup needs a credit card, we say it does, because a wrong "no card required" costs you a signup. Third, we keep the providers that stopped being free (OpenAI, Anthropic, xAI, DeepSeek, Together, Perplexity) with the reason, so you stop opening their pricing pages.

### What does "no credit card required" mean?
It means you can sign up and start using the free tier without entering a payment method. We verify this manually — a listing that says "no credit card" was checked by a human on the recorded date. When the answer is unknown, we default to `requires_card: true`.

### Are these free tiers actually free forever?
Some are. Cloudflare Workers AI, Ollama, and Qdrant Cloud are free with no expiry. Others are time-limited credits (e.g. Google Cloud Vertex gives $300 for 90 days). Every entry states the exact allowance and, where relevant, the expiry. We also flag `status: degraded` when a tier still works but has caveats, and `status: deprecated` when it is no longer free.

### Can I use these for a commercial product?
It depends on the provider. We record `commercial_use` for every entry. Most free LLM APIs allow commercial use, but some (e.g. Cohere trial keys, ElevenLabs free TTS) are non-commercial only. Always read the provider's terms; this list is a starting point, not legal advice.

### How often is this data updated?
Every link is HEAD-requested once a day by a GitHub Actions workflow. Entries unverified for more than 30 days are flagged in a weekly issue. The dataset is regenerated on every merge to `main`. The live site at [devanimecx.github.io/free-ai-agent-stack](https://devanimecx.github.io/free-ai-agent-stack/) always reflects the latest data.

### Can I use this data in my own AI answers?
Yes. The `data/` directory is licensed under [CC BY 4.0](DATA_LICENSE) — you can reuse it, including inside AI-generated answers, as long as you attribute Adarsh Kushwah (Dev Animecx) and link to the site. Machine-readable JSON endpoints and an `llms.txt` file are provided specifically so AI systems can consume the catalogue directly.

### How do I add a resource?
Three steps: fork the repo, add ~12 lines of YAML to the right file, and open a PR. CI validates the schema, checks for duplicate IDs and URLs, and verifies the link is alive. Full instructions in [`CONTRIBUTING.md`](CONTRIBUTING.md). You can also submit via the issue form and a maintainer will turn it into a PR for you.

### What is an MCP server and why do I need one?
MCP (Model Context Protocol) is an open standard that lets an AI agent call external tools — read files, query databases, browse the web, write code. Instead of each agent hard-coding its own integrations, MCP servers provide a uniform interface. This catalogue lists 64 MCP servers with copy-paste install commands, so you can give any agent any capability in one line.

---

## Machine-readable data

Built for agents, not just humans: stable IDs, a versioned schema, JSON endpoints and an `llms.txt`.

| Resource | URL |
|---|---|
| Full dataset | [`/data/all.json`](https://devanimecx.github.io/free-ai-agent-stack/data/all.json) |
| Per category | `/data/llm-apis.json` · `/data/mcp-servers.json` · `/data/agent-tools.json` · `/data/free-tiers.json` · `/data/skills.json` |
| Index and counts | [`/data/index.json`](https://devanimecx.github.io/free-ai-agent-stack/data/index.json) |
| Agent summary | [`/llms.txt`](https://devanimecx.github.io/free-ai-agent-stack/llms.txt) — index of everything below |
| Full text for models | [`/llms-full.txt`](https://devanimecx.github.io/free-ai-agent-stack/llms-full.txt) — every field of every entry, ~25k lines |
| Change feed | [`/feed.xml`](https://devanimecx.github.io/free-ai-agent-stack/feed.xml) — RSS of the 50 most recently re-verified entries |
| Schemas | [`/schemas/*.json`](https://devanimecx.github.io/free-ai-agent-stack/schemas/skill.schema.json) — Draft 2020-12, published with live `$id`s |
| Validation | `python3 scripts/validate.py` — schema, duplicates, dead links, affiliate params |
| Export check | `python3 scripts/verify_export.py` — canonicals, OG images, JSON-LD, base path |

IDs are immutable: once merged, an ID never changes. Renames are a new entry plus a deprecation.

### Citing this dataset

```
free-ai-agent-stack (2026). Adarsh Kushwah (Dev Animecx).
https://devanimecx.github.io/free-ai-agent-stack
Data licensed CC BY 4.0.
```

Structured data on every page carries the same attribution in `Person`, `Organization` and `Dataset` nodes, so anything that parses the markup rather than the prose still resolves the author.

## Deployment

Hosted on **GitHub Pages** at <https://devanimecx.github.io/free-ai-agent-stack/>. The site is a static export — no server, no runtime cost.

`.github/workflows/deploy-site.yml` builds and deploys on every push to `main`. Both values it needs are *derived*, not configured:

| Value | Derived from | Override |
|---|---|---|
| `BASE_PATH` | `/<repo-name>` | repo variable `BASE_PATH` (set to empty string for a root domain) |
| `SITE_URL` | `https://<owner>.github.io/<repo-name>` | repo variable `SITE_URL` |

Deriving them means a fork, rename or transfer keeps working with no settings touched — and it removes the failure mode where the canonical URL disagrees with where the site is actually served, which silently splits a site's search ranking.

**No manual setup required.** The Pages site is already configured with
`build_type: workflow`, and the workflow derives the host from the repository
itself — so a fork, a rename or a transfer keeps deploying with nothing touched.
If you ever need to re-create it: Settings → Pages → Source = **GitHub Actions**.

The build fails rather than shipping a broken deployment: `scripts/verify_export.py` asserts the canonical host, that every Open Graph image and feed exists, that JSON-LD parses and names the author, that the base path appears exactly once, and that all five category pages carry `ItemList`, `FAQPage` and `BreadcrumbList` schema. A `.nojekyll` file is written into the output because Pages otherwise runs Jekyll, which silently deletes every path beginning with an underscore — including all of `_next/`.

## Contribute

Adding a resource takes three steps: **fork → add ~12 lines of YAML → open a PR.** CI validates the schema, checks for duplicate IDs and URLs, and verifies the link is alive. Full instructions in [`CONTRIBUTING.md`](CONTRIBUTING.md).

- **[Add a resource](../../issues/new?template=add-resource.yml)** — maintainers turn it into a PR for you
- **[Report a broken link or outdated limit](../../issues/new?template=report-broken-link.yml)** — one click from any card on the site
- **Good first issues** are labelled [`good first issue`](../../labels/good%20first%20issue) — mostly re-verifying entries whose 30-day window expired

### Contributors

<!-- CONTRIBUTORS:START -->
@seed-import (234) @hidden-gems-import (150)
<!-- CONTRIBUTORS:END -->

## Star history

<a href="https://star-history.com/#DevAnimecx/free-ai-agent-stack&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=DevAnimecx/free-ai-agent-stack&type=Date&theme=dark" />
    <img alt="Star history chart for free-ai-agent-stack" src="https://api.star-history.com/svg?repos=DevAnimecx/free-ai-agent-stack&type=Date" width="600" />
  </picture>
</a>

## Licence

- **Code** — [MIT](LICENSE)
- **Data** (`data/**`, `schemas/**`) — [CC-BY-4.0](DATA_LICENSE); reuse it, including in AI answers, with attribution
- **Trademarks** belong to their owners. This project is not affiliated with any listed vendor, and a listing is not an endorsement.

---

## 🤝 Support this project

[![GitHub Sponsors](https://img.shields.io/github/sponsors/DevAnimecx?style=for-the-badge&logo=github-sponsors&logoColor=white)](https://github.com/DevAnimecx/sponsor) · [![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-☕%20yellow?style=for-the-badge)](https://www.buymeacoffee.com/devanimecx) · [![X](https://img.shields.io/badge/X-@devadarshkush-1DA1F2?style=for-the-badge&logo=x&logoColor=white)](https://x.com/devadarshkush) · [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/adarshkushwahdev/) · [![Mastodon](https://img.shields.io/badge/Mastodon-68426c?style=for-the-badge&logo=mastodon&logoColor=white)](https://hachyderm.io/@devanimecx)

Keeping 384 entries human-verified and link-checked daily is a full-time job. If this catalogue has saved you a signup or two, consider sponsoring the maintenance.

### 📧 Direct contact

For sponsorship inquiries, collaboration requests, or vendor outreach:

**animecx69@gmail.com**

---

## 📣 Stay in the loop

- **Weekly digest** — new entries, deprecated tiers, and methodology updates
- **RSS feed** — [`/feed.xml`](https://devanimecx.github.io/free-ai-agent-stack/feed.xml) of the 50 most recently re-verified entries
- **Website changelog** — [devanimecx.github.io/free-ai-agent-stack](https://devanimecx.github.io/free-ai-agent-stack/)

---

## 🏷️ Tags & topics

This repository is tagged for discoverability across GitHub, search engines, and AI retrieval systems:

`free-llm-api` · `mcp-server` · `ai-agent` · `agent-framework` · `free-tier` · `llm` · `openai` · `anthropic` · `gemini` · `groq` · `cloudflare` · `langchain` · `langgraph` · `ollama` · `rag` · `vector-database` · `observability` · `coding-agent` · `self-hosted` · `open-source` · `machine-learning` · `generative-ai` · `developer-tools` · `api` · `no-credit-card` · `zero-cost` · `2026`

---

## 📄 Structured data (JSON-LD)

The published website carries structured data on every page so search engines and AI systems can understand the catalogue:

| Schema | Purpose |
|---|---|
| `ItemList` | Every category page lists its entries as a structured ItemList |
| `BreadcrumbList` | Navigation hierarchy for each category page |
| `FAQPage` | Frequently asked questions about "free" tiers and methodology |
| `Dataset` | The full catalogue is a Dataset with CC BY 4.0 licensing |
| `Person` / `Organization` | Attribution for Adarsh Kushwah (Dev Animecx) |

---

<div align="center">

**Built and maintained by [Adarsh Kushwah](https://github.com/DevAnimecx) — Dev Animecx**

[![X](https://img.shields.io/badge/X-@devadarshkush-1DA1F2?style=for-the-badge&logo=x&logoColor=white)](https://x.com/devadarshkush) [![LinkedIn](https://img.shields.io/badge/LinkedIn-Adarsh%20Kushwah-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/adarshkushwahdev/) [![Email](https://img.shields.io/badge/Email-animecx69@gmail.com-4285F4?style=for-the-badge&logo=gmail&logoColor=white)](mailto:animecx69@gmail.com)

<sub>Independent project. Not affiliated with, endorsed by or sponsored by any listed vendor.</sub>

</div>

<div align="center">

**[Website](https://devanimecx.github.io/free-ai-agent-stack)** · **[Add a resource](../../issues/new?template=add-resource.yml)** · **[Methodology](docs/METHODOLOGY.md)** · **[Sponsor](https://github.com/DevAnimecx/sponsor)** · **[Contact](mailto:animecx69@gmail.com)**

</div>
