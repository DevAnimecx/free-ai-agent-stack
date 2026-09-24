# Decision log

Every decision here closes an Open Question from PRD-2026-001 §20, or records a
scope call made during the build. Format: **decision → reasoning → revisit
trigger.** Nothing here is permanent; a new entry supersedes an old one rather
than editing it.

---

## OQ-1 — Next.js or Astro?

**Decision: Next.js 15 (App Router) with `output: 'export'`.**

- Metadata API gives per-route `title`/`description`/canonical/JSON-LD without a
  plugin, which matters because every one of the four category pages needs its own
  keyword targeting
- `app/sitemap.ts` and `app/robots.ts` generate from the data at build time
- Static export means no server, no runtime cost and no cold start, satisfying G-6
- Astro would ship less JavaScript for a content site and is genuinely the better
  tool on paper. We chose Next because contributor familiarity is a funding
  constraint on an OSS project, and the JS budget (150KB) is achievable here
  because the interactivity is one search box and one filter panel

**Revisit:** if a category page exceeds 150KB JS twice in a row, migrate the
category pages to Astro islands.

## OQ-2 — GitHub Pages or Vercel?

**Decision: Vercel primary, Cloudflare Pages as a documented mirror.**

- Vercel Hobby is free, supports preview deployments per PR, custom headers and
  gives $5/month of AI Gateway credit on the same account
- Hobby is non-commercial, which is fine: the site is a public reference, not a
  product with revenue
- Cloudflare Pages is the fallback if Vercel's terms or limits ever change — a
  static export deploys to either in under a minute, so lock-in is nil
- GitHub Pages is deliberately **not** primary: no PR preview URLs and no custom
  headers makes the workflow worse, and preview deploys are how a reviewer checks
  a YAML change actually renders correctly

**Revisit:** any Vercel ToS change, or if the build starts needing server
functions, in which case Cloudflare Workers is the target.

## OQ-3 — Do we accept "free trial with card" entries?

**Decision: yes, with strict labelling and never in a "no card" filter.**

- Included only if it is a genuine no-card trial **or** the card-gated credit is
  ≥ $100 / ≥ 30 days
- Always `requires_card: true`, always carrying the `trial` tag, expiry stated in
  `free_limit` ("$5 trial credit, valid 30 days")
- They never appear in the `no credit card` filter, which is the most-used filter
  on the site
- Example in the dataset: Cerebras (moved from a no-card free tier to a card-gated
  30-day trial in July 2026) is `status: degraded` with the change explained

**Revisit:** if trial entries ever exceed 15% of the catalogue, split them into a
separate file so the main lists stay clean.

## OQ-4 — Do we list closed-source MCP servers?

**Decision: yes, marked honestly.**

- Developers choose by function; excluding commercial servers would make the
  directory worse at exactly the moment MCP adoption is exploding
- Requirement: a public install command and public documentation. No waitlists
- Trust signalling does the work instead of exclusion: `official` distinguishes
  vendor-maintained servers (Notion, Stripe, Sentry, Vercel) from community ones
  (OpenAPI, DuckDuckGo), and `notes` flags data-access implications
- We do not yet record a licence field for MCP servers; adding one is a V1 schema
  minor bump

**Revisit:** V1 — add `license` and `data_access` fields so the closed/open
distinction is filterable rather than prose.

## OQ-5 — Individual resource pages in V1?

**Decision: no. Anchors only.**

- 235 thin pages (vendor copy + a link) is the classic thin-content trap and would
  put the SEO goal at risk to serve a navigational need the anchors already meet
- Anchors rank for long-tail queries when the parent page is strong: the whole
  point of consolidating link equity on four pages
- In V2 there will be something genuinely page-worthy: verification history, limit
  changes over time, and "what replaced this" chains. That content does not exist
  yet, and inventing it now would be filler

**Revisit:** at 600+ entries, or when ≥20% of entries have a meaningful limit-change
history to display.

## OQ-6 — Threshold for co-maintainers?

**Decision: 100 stars = Phase 2 (3–5 maintainers); invites at 5 merged PRs + 30 days active.**

- 100 stars is the point at which issue volume stops being manageable solo; the
  90-day target is 5,000 stars, so this phase should last weeks, not months
- One maintainer per category is the unit of delegation, because that is the level
  at which a person can actually hold the domain knowledge (which free tiers exist
  in *their* category this month)
- Dry-run policy: the first invited maintainer gets merge rights on one category
  only. Promotion follows demonstrated judgement, not enthusiasm

**Revisit:** at 1,000 stars, move to the RFC process in `GOVERNANCE.md`.

## OQ-7 — Vendor-sponsored listings?

**Decision: no paid placement in V1 or V2. Not now, and probably not ever.**

- The product's only asset is that a listing cannot be bought. The moment that
  becomes ambiguous, the eight-person team that writes the same list in a Reddit
  thread wins on trust
- Vendors already have a legitimate path: accurate, self-serve PRs updating their
  own entries, plus the free embeddable badge
- If it is ever revisited, the requirements would be: explicit `sponsored` label
  in the data schema, no ranking influence, disclosed in `GOVERNANCE.md`, and a
  maintainer-wide vote with a public tally

**Revisit:** not before 15,000 stars, and only with a written ethics policy.

## OQ-8 — Which analytics provider?

**Decision: self-hosted Umami on the Oracle Always Free ARM VM.**

- Cookie-free, no personal data, no consent banner — which is a hard requirement
  from the PRD's privacy principle, not a preference
- Self-hosting on the always-free VM costs $0 and avoids any vendor dependency for
  a project whose whole pitch is durability
- The same VM also hosts a self-hosted Langfuse and a cron runner, so it earns its
  place several times over
- Plausible self-hosted is the documented alternative; only the specific product
  is decided, not the principle

**Revisit:** never on the principle; only if the self-hosted instance costs more
maintenance than it saves.

---

## Build-time decisions

## D-1 — YAML dates are written unquoted

`verified: 2026-09-24` reads better in a diff than `verified: "2026-09-24"`.
PyYAML parses the former into a `date` object, so normalisation happens once in
`scripts/datalib.py` and every consumer sees an ISO string. JSON Schemas therefore
declare `verified` as a string, and contributors keep writing what looks natural.

## D-2 — `stars` is never hand-typed

`scripts/generate_stats.py --update-stars` writes it from the GitHub API weekly.
The initial seed intentionally shipped with no `stars` field at all, which is why
the README could claim freshness honestly before the first refresh ran.

## D-3 — Deprecated entries are a feature

Six providers that most lists still present as free are `status: deprecated` with
the replacement named. The `deprecated_entries` array in `data/stats.json` makes
this auditable, and the delete guard in `validate.py` (minimum entry counts per
category) stops a future maintainer from tidying them away.

## D-4 — Link checking never touches `free_limit`

Automated verification is allowed to flip `status` between `active` and `broken`
and to write `stars`. Everything else in an entry is human-only. A robot has no
way to know that a vendor moved Pro models behind billing; it only knows whether
a URL answered.

## D-5 — The MVP ships 235 entries, not 150

The PRD set a floor of 150 seeded resources (60 LLM APIs, 40 MCP servers, 20 agent
tools, 30 free tiers). The build shipped 63 / 62 / 40 / 70. The surplus is mostly
in the two categories where coverage compounds: MCP servers (archived-but-used
servers and their maintained replacements) and free tiers (the full stack an agent
needs, not just a database).

*Superseded in part by D-6: the catalogue now ships 70 / 63 / 45 / 74 = 252
entries after the hidden-gem import. The reasoning above still holds — the surplus
stayed concentrated in MCP servers and free tiers.*

## D-6 — Hidden-gem cohort: 17 accepted, 13 rejected, 5 already listed

In September 2026 a contributor submitted a curated "hidden gems" list of roughly
40 resources — including several stealth models, unknown gateways and a zero-key
inference bridge. "Feed them all" is not a policy this repository can follow. The
entire value of the catalogue is that a human checked the claim before it shipped,
so the list was treated as a set of leads, not as data. Every item was fetched and
checked against the vendor's own documentation or live API on 2026-09-24.

**Accepted — 17 entries.** Dahl Inference (100M anonymous tokens), LLM7.io, OVH
AI Endpoints, Hack Club AI, Space Bunny Alpha, ZenMux, Puter.js, MemPalace,
Cognee, Mem0, Nanobrowser, Freebuff, Actian VectorAI DB, Wikidata Vector
Database, Opik, free-llm-gateway and Wikidata MCP.

**Corrected before publication — 4.** Three submitted figures did not survive
contact with the source and were replaced with the documented numbers:

| Claim as submitted | What the vendor actually documents |
|---|---|
| LLM7.io: "2 req/s, 20 RPM, 100 req/hr" | 10 req/min anonymous, 40 req/min with a free token |
| Puter.js: "free & unlimited, no API keys" | Free for the *developer*; end users spend their own credits and pay Puter past the allowance |
| free-llm-gateway: "24+ providers" | Its own README says 14+ |
| MemPalace: "100% accuracy on benchmarks" | 96.6% R@5 raw, zero API calls; the 100% figure is a reranked pipeline the authors themselves flagged as tuned on failing questions |

**Rejected — 13, grouped by reason.**

*Paid, despite being submitted as free.* endoflife.ai MCP ("the MCP server is
covered by a paid key from $89 a month"), Court Records MCP ($0.01 per tool call)
and SEC Filings MCP ($0.004 per tool call). A free web UI or a free trial does not
make an MCP server a free tier.

*Cannot be recommended to readers in good conscience.* Completions.me advertises
unlimited free Claude Opus and GPT-5.2. No legitimate unmetered frontier-model API
exists; independent coverage is unambiguous that such services resell revoked or
stolen keys and route every prompt through infrastructure the user does not
control. AgentRouter ($175 signup credit) was rejected for the same family of
reasons: reviewers report billing errors that strand the balance, and at least one
widely-shared guide concedes the served models may not be the models named. Both
are also referral-driven products. A repository that promises verification has no
business pointing readers at either.

*Dead or nonexistent.* Aerolink is a parked Porkbun placeholder, so its "$35 + $140
in credits" cannot exist. KeylessAI's host does not resolve. BazaarLink returns
HTTP 500. GoldBean MCP and Enally AI do not resolve. WebOperator, Everfern, KISS
Sorcar, pi-coding-agent, memory-forge, mengram-ai, uniroute, Agens, Accomplish,
token-free-gateway, AINative LangChain.js, dhiya-npm, Rapls, AgentLens and
ClawMetry could not be located at any URL that matched the description.

*Expired.* Ox Alpha — the previous stealth drop — is absent from OpenRouter's
live catalogue: its preview ended in late August 2026 and the model was unmasked
as Z.AI's GLM-5.3-Flash. Its sibling, Space Bunny Alpha, was confirmed live and
free on the import date, so it shipped instead, flagged `volatile`. This is the
clearest illustration of why the rule exists: a list written in August would have
shipped a dead entry in September.

**Already listed — 5.** Pollinations, OpenRouter, Helicone, Context7 and DeepWiki
were already in the catalogue; Playwright and the reference Memory server likewise.
Submitting a resource that is already present is not a reason to duplicate it. The
Wikidata MCP entry, meanwhile, was *not* on the list and was found while verifying
it — the genuinely free knowledge-graph MCP server turned out to be Wikimedia
Deutschland's, not the paid one that was submitted.
