<div align="center">

# free-ai-agent-stack

**Free AI agent tools, free LLM APIs, MCP servers and free-tier infrastructure — 252 resources, verified weekly, zero cost to build on.**

[![Stars](https://img.shields.io/github/stars/free-ai-agent-stack/free-ai-agent-stack?style=flat-square&logo=github)](https://github.com/free-ai-agent-stack/free-ai-agent-stack/stargazers)
[![Forks](https://img.shields.io/github/forks/free-ai-agent-stack/free-ai-agent-stack?style=flat-square)](https://github.com/free-ai-agent-stack/free-ai-agent-stack/forks)
[![Contributors](https://img.shields.io/github/contributors/free-ai-agent-stack/free-ai-agent-stack?style=flat-square)](https://github.com/free-ai-agent-stack/free-ai-agent-stack/graphs/contributors)
[![Last commit](https://img.shields.io/github/last-commit/free-ai-agent-stack/free-ai-agent-stack?style=flat-square)](https://github.com/free-ai-agent-stack/free-ai-agent-stack/commits/main)
[![Link check](https://img.shields.io/github/actions/workflow/status/free-ai-agent-stack/free-ai-agent-stack/verify.yml?label=links&style=flat-square)](../../actions/workflows/verify.yml)
[![Website](https://img.shields.io/badge/website-live-brightgreen?style=flat-square)](https://freeaiagentstack.dev)

</div>

Every free LLM API, MCP server, agent framework and free-tier database a developer needs to build an AI agent in 2026 — in one place, with the free limit, the credit-card requirement and the date it was last checked. **Data is YAML in this repo; the website is generated from it; a daily robot checks every link.** If a listing says "no credit card", a human verified that. If it says "no longer free", we left it in on purpose — so you stop wasting signups on lists that never update.

> **Free AI agent tools, checked 2026-09-24.** 252 entries · 171 need no credit card · 100% of links verified in the last 30 days.

<!-- STATS:START -->
| Category | Count | No credit card | Verified <30d | Top pick |
|---|---:|---:|---:|---|
| [Free LLM APIs](data/llm-apis.yaml) | 70 | 58 | 70 | Cloudflare Workers AI |
| [MCP Servers](data/mcp-servers.yaml) | 63 | — | 63 | Context7 |
| [Agent Tools](data/agent-tools.yaml) | 45 | 45 | 45 | Aider |
| [Free Tiers](data/free-tiers.yaml) | 74 | 68 | 74 | Better Auth |
| **Total** | **252** | **171** | **252** | — |

_Auto-generated 2026-09-24T09:43:57+00:00 · link freshness 100.0% verified within 30 days (target 95%)._
<!-- STATS:END -->

## Quick start: build an agent for $0 this weekend

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

- [Free LLM APIs](#free-llm-apis) — 70 entries
- [MCP servers](#mcp-servers) — 63 entries
- [Agent tools & frameworks](#agent-tools--frameworks) — 45 entries
- [Free-tier infrastructure](#free-tier-infrastructure) — 74 entries
- [What "free" means here](#what-free-means-here) · [Methodology](#methodology) · [Machine-readable data](#machine-readable-data)
- [Contribute](#contribute) · [Licence](#licence)

---

## Free LLM APIs

70 free LLM API providers, from frontier multimodal models to models you run on your own laptop. Every entry states the free limit, the rate limit and whether a card is required. The full list lives in [`data/llm-apis.yaml`](data/llm-apis.yaml).

### Top picks

#### Google Gemini API

**Google** · 1,500 requests/day on Flash, 1,000/day on Flash-Lite; 250K TPM · no credit card · verified 2026-09-24

Frontier multimodal models on a permanent free tier — Flash and Flash-Lite families only since April 2026. Free-tier prompts are used to improve Google products. → [ai.google.dev](https://ai.google.dev) · [`#google-gemini`](https://freeaiagentstack.dev/llm-apis#google-gemini)

#### Groq Cloud

**Groq** · 1,000 req/day and 200K tokens/day per model · no credit card · verified 2026-09-24

Open-weight models at 300+ tokens/sec on LPU hardware, with the most generous request-per-day allowance of any free tier. → [groq.com](https://groq.com) · [`#groq`](https://freeaiagentstack.dev/llm-apis#groq)

#### OpenRouter Free Models

**OpenRouter** · 50 requests/day (1,000/day after a one-time $10 credit purchase) · no credit card · verified 2026-09-24

One OpenAI-compatible key fronting 19+ `:free` models across providers. The `:free` roster rotates monthly. → [openrouter.ai](https://openrouter.ai) · [`#openrouter-free`](https://freeaiagentstack.dev/llm-apis#openrouter-free)

#### Cloudflare Workers AI

**Cloudflare** · 10,000 Neurons/day · no credit card · verified 2026-09-24

Serverless inference that runs inside a Worker — no egress cost, no cold-start management. Budget is in Neurons, not tokens. → [developers.cloudflare.com](https://developers.cloudflare.com/workers-ai/) · [`#cloudflare-workers-ai`](https://freeaiagentstack.dev/llm-apis#cloudflare-workers-ai)

#### Ollama

**Ollama** · Unlimited; limited only by your GPU/RAM · no credit card · verified 2026-09-24

The default way to run open models locally — one command to pull, serve and expose an OpenAI-compatible endpoint. → [ollama.com](https://ollama.com) · [`#ollama`](https://freeaiagentstack.dev/llm-apis#ollama)

> **70 entries in total**, including every provider that quietly stopped being free (OpenAI, Anthropic, xAI, DeepSeek, Together, Perplexity — all marked `status: deprecated` with the reason). [See the full list](https://freeaiagentstack.dev/llm-apis) · [raw data](data/llm-apis.yaml)

---

## MCP servers

63 MCP servers with copy-paste install commands, transport, auth requirements and official-vs-community status. The MCP registry lands in 2026; this list stays useful because it tells you what a server *needs* before you run it. Full list: [`data/mcp-servers.yaml`](data/mcp-servers.yaml).

### Top picks

#### Context7

**Upstash** · `npx -y @upstash/context7-mcp` · stdio, http · no auth

Version-pinned, up-to-date documentation for thousands of libraries — the single highest-value server for coding agents. → [github.com/upstash/context7](https://github.com/upstash/context7) · [`#context7-mcp`](https://freeaiagentstack.dev/mcp-servers#context7-mcp)

#### GitHub MCP Server

**GitHub** · `docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN ghcr.io/github/github-mcp-server` · stdio, http · PAT required

Repo automation, PRs, issues, code search and CI workflows — 51 tools. → [github.com/github/github-mcp-server](https://github.com/github/github-mcp-server) · [`#github-mcp`](https://freeaiagentstack.dev/mcp-servers#github-mcp)

#### Playwright MCP

**Microsoft** · `npx -y @playwright/mcp@latest` · stdio, http · no auth

Browser automation over accessibility snapshots rather than screenshots — far fewer tokens than screenshot-based agents. → [github.com/microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp) · [`#playwright-mcp`](https://freeaiagentstack.dev/mcp-servers#playwright-mcp)

#### Filesystem

**MCP Steering Group** · `npx -y @modelcontextprotocol/server-filesystem /path/to/allowed/dir` · stdio · no auth

Secure local file operations with configurable allow-listed directories — where every local agent starts. → [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem) · [`#filesystem-mcp`](https://freeaiagentstack.dev/mcp-servers#filesystem-mcp)

#### Qdrant MCP

**Qdrant** · `uvx mcp-server-qdrant --qdrant-url <url>` · stdio · API key

Stores and retrieves memories in a Qdrant collection — vector memory as a tool, paired with Qdrant's free 1GB cluster. → [github.com/qdrant/mcp-server-qdrant](https://github.com/qdrant/mcp-server-qdrant) · [`#qdrant-mcp`](https://freeaiagentstack.dev/mcp-servers#qdrant-mcp)

> **63 entries in total**, including the archived reference servers (`postgres`, `slack`, `puppeteer`, `brave-search`) that most tutorials still tell you to install, each replaced with a maintained alternative. [See the full list](https://freeaiagentstack.dev/mcp-servers) · [raw data](data/mcp-servers.yaml)

---

## Agent tools & frameworks

45 IDEs, CLI agents, frameworks and orchestrators — with the actual numbers on each free tier rather than a vague "free plan available". Full list: [`data/agent-tools.yaml`](data/agent-tools.yaml).

### Top picks

#### Gemini CLI

**cli** · 1,000 requests/day with a personal Google account (60 RPM) · open source

Google's open-source terminal agent with the most generous free quota of any first-party CLI. The best $0 coding agent in 2026. → [github.com/google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli) · [`#gemini-cli`](https://freeaiagentstack.dev/agent-tools#gemini-cli)

#### Cline

**ide** · Free and open source — bring any provider key (including free tiers) · open source

Autonomous coding agent for VS Code, JetBrains and the terminal, with human approval at every step. Point it at Gemini or Groq free tiers and a full agent costs nothing. → [cline.bot](https://cline.bot) · [`#cline`](https://freeaiagentstack.dev/agent-tools#cline)

#### LangGraph

**framework** · Open source (MIT) · Python

Stateful, graph-based agent orchestration with durable execution, human-in-the-loop and time travel. → [langchain-ai.github.io/langgraph](https://langchain-ai.github.io/langgraph/) · [`#langgraph`](https://freeaiagentstack.dev/agent-tools#langgraph)

#### n8n

**orchestrator** · Self-hosted Community Edition is free forever (fair-code licence) · TypeScript

Node-based automation with native AI agent nodes, MCP trigger and hundreds of integrations. → [n8n.io](https://n8n.io) · [`#n8n`](https://freeaiagentstack.dev/agent-tools#n8n)

#### LiteLLM

**framework** · Open source (MIT) · Python

One OpenAI-shaped interface over 100+ providers, with a proxy that adds budgets, keys and tracing — the cleanest way to stack several free tiers behind one endpoint. → [docs.litellm.ai](https://docs.litellm.ai) · [`#litellm`](https://freeaiagentstack.dev/agent-tools#litellm)

> [See the full list](https://freeaiagentstack.dev/agent-tools) · [raw data](data/agent-tools.yaml)

---

## Free-tier infrastructure

74 free-tier services you actually need to ship: hosting, databases, vector stores, auth, queues, observability, email and search. Each entry includes a **cold-start risk** rating, because "free hosting" that sleeps for 60 seconds is not the same as free hosting. Full list: [`data/free-tiers.yaml`](data/free-tiers.yaml).

### Top picks

#### Vercel

**hosting** · Hobby: 100GB bandwidth/mo, 100h serverless, $5/mo AI credit · low cold-start risk

Static and serverless hosting with preview deployments per branch and AI Gateway included. Hobby is explicitly non-commercial. → [vercel.com](https://vercel.com) · [`#vercel`](https://freeaiagentstack.dev/free-tiers#vercel)

#### Supabase

**database** · 500MB database, 1GB file storage, 50K MAU auth · medium cold-start risk

Postgres with auth, storage, realtime and pgvector in one free project. Projects pause after 7 days of inactivity. → [supabase.com](https://supabase.com) · [`#supabase`](https://freeaiagentstack.dev/free-tiers#supabase)

#### Qdrant Cloud

**vector-db** · 1GB cluster free forever · low cold-start risk

The best free vector tier: a real cluster with payload filtering, no card required. Holds roughly 250K vectors at 384 dimensions. → [qdrant.tech](https://qdrant.tech) · [`#qdrant-cloud`](https://freeaiagentstack.dev/free-tiers#qdrant-cloud)

#### Oracle Cloud Always Free

**compute** · 4 ARM cores + 24GB RAM, 200GB storage, 10TB egress/mo, forever · low cold-start risk

The only major cloud with a permanently free ARM VM generous enough to self-host several services — including your own Langfuse and n8n. → [oracle.com/cloud/free](https://www.oracle.com/cloud/free/) · [`#oracle-cloud-always-free`](https://freeaiagentstack.dev/free-tiers#oracle-cloud-always-free)

#### Langfuse

**observability** · 50K observations/mo on free cloud; self-hosted is unlimited · low cold-start risk

Open-source LLM tracing, prompt management and evaluation — the default for debugging agent runs. → [langfuse.com](https://langfuse.com) · [`#langfuse`](https://freeaiagentstack.dev/free-tiers#langfuse)

> [See the full list](https://freeaiagentstack.dev/free-tiers) · [raw data](data/free-tiers.yaml)

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

## Machine-readable data

Built for agents, not just humans: stable IDs, a versioned schema, JSON endpoints and an `llms.txt`.

| Resource | URL |
|---|---|
| Full dataset | [`/data/all.json`](https://freeaiagentstack.dev/data/all.json) |
| Per category | `/data/llm-apis.json` · `/data/mcp-servers.json` · `/data/agent-tools.json` · `/data/free-tiers.json` |
| Agent summary | [`/llms.txt`](https://freeaiagentstack.dev/llms.txt) |
| Schemas | [`schemas/`](schemas/) — Draft 2020-12, `additionalProperties: false` |
| Validation | `python3 scripts/validate.py` — schema, duplicates, dead links, affiliate params |

IDs are immutable: once merged, an ID never changes. Renames are a new entry plus a deprecation.

## Contribute

Adding a resource takes three steps: **fork → add ~12 lines of YAML → open a PR.** CI validates the schema, checks for duplicate IDs and URLs, and verifies the link is alive. Full instructions in [`CONTRIBUTING.md`](CONTRIBUTING.md).

- **[Add a resource](../../issues/new?template=add-resource.yml)** — maintainers turn it into a PR for you
- **[Report a broken link or outdated limit](../../issues/new?template=report-broken-link.yml)** — one click from any card on the site
- **Good first issues** are labelled [`good first issue`](../../labels/good%20first%20issue) — mostly re-verifying entries whose 30-day window expired

### Contributors

<!-- CONTRIBUTORS:START -->
@seed-import (235) @hidden-gems-import (17)
<!-- CONTRIBUTORS:END -->

## Star history

<a href="https://star-history.com/#free-ai-agent-stack/free-ai-agent-stack&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=free-ai-agent-stack/free-ai-agent-stack&type=Date&theme=dark" />
    <img alt="Star history chart for free-ai-agent-stack" src="https://api.star-history.com/svg?repos=free-ai-agent-stack/free-ai-agent-stack&type=Date" width="600" />
  </picture>
</a>

## Licence

- **Code** — [MIT](LICENSE)
- **Data** (`data/**`, `schemas/**`) — [CC-BY-4.0](DATA_LICENSE); reuse it, including in AI answers, with attribution
- **Trademarks** belong to their owners. This project is not affiliated with any listed vendor, and a listing is not an endorsement.

<div align="center">

**[Website](https://freeaiagentstack.dev)** · **[Add a resource](../../issues/new?template=add-resource.yml)** · **[Methodology](docs/METHODOLOGY.md)**

</div>
