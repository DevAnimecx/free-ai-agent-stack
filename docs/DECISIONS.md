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

## D-7 — Hidden-gem cohort II: 45 accepted, 10 rejected, 4 already listed

A second contributor batch arrived in the same shape as D-6: 78 submissions
across frameworks, coding agents, browser agents, memory, RAG, security,
evaluation and gateways, ending in "feed them all". The difference was quality.
Where the first batch was mostly unverifiable, this one was mostly real — every
`pip install` name resolved on PyPI and every npm name resolved on the registry,
with one exception each. That changes the work from "does this exist" to "is
this what it claims, and should we recommend it".

**Accepted — 45 entries.** 38 agent tools and 7 gateways/observability services.
Notable ones include Goose (Block, ~54K stars), NanoBot (HKUDS, ~48K),
UI-TARS Desktop (ByteDance, ~39K), BrowserOS (~13.7K) and agentgateway (a Linux
Foundation MCP proxy). The tail is deliberately included: several projects have
under 50 stars but commit this week, and a new, maintained project is exactly
what a "hidden gems" section is for. Star counts are recorded, not gated —
CONTRIBUTING sets "not abandoned" as the criterion, not popularity.

**The "no API key" test.** This batch contained a new class of submission that
needed a rule rather than a case-by-case call: tools that market themselves as
free because they automate a web chat UI or reuse a browser session instead of
calling an API. Three rejected under the existing policy:

- **Dulus** — "harvests anonymous web sessions", and its documentation asks you
  to reload a wallet QR code to "fuel" usage, while directing users to download
  binaries from a separate repository. This is a token-gated service, which
  CONTRIBUTING already lists under "Rejected outright", and the binary-download
  pattern is a supply-chain risk independent of that.
- **Browse Code** and **Forge Agent** — both drive ChatGPT/Claude/Gemini through
  browser automation to obtain inference their authors did not pay API rates for.
  Every major provider prohibits automated access outside its API, so the real
  cost is the reader's account. These are the same family as the Completions.me
  rejection in D-6 and are rejected for consistency.

The line drawn: a tool is listed when its free path is *local* (Ollama,
llama.cpp, bundled weights) or *sanctioned* (a published free API tier). It is
not listed when the free path is an unsanctioned route to someone else's paid
product. Code Buddy is the borderline case and is included — its supported free
path is Ollama, and its optional ChatGPT-subscription mode is disclosed in the
entry's note rather than presented as the free tier.

**Redirected to upstream — 2.** Both submissions pointed at forks rather than the
real projects, which is a signature of lists assembled from search results:
`strategist922/mempalace` is a **zero-star fork** of the canonical MemPalace
already listed in D-6, and `gHashTag/BrowserOS` is a **one-star fork** of
`browseros-ai/BrowserOS` (~13.7K stars). The upstream BrowserOS was added; the
MemPalace fork was dropped as a duplicate. Where a submission and its upstream
differ only by stars, the entry points at the upstream.

**Rejected — 10.**

| Submission | Reason |
|---|---|
| GoldBean MCP | Still does not resolve — re-submitted after D-6 rejection |
| endoflife.ai MCP | Still $89/month for MCP access — re-submitted after D-6 rejection |
| `cloudflare-os` | No such repository; the path as given 404s |
| Dulus, Browse Code, Forge Agent | "No API key" by bypassing provider terms (above) |
| Junie Local | Could not verify the on-device/no-credits claim |
| TencentDB Agent Memory, Jingxuan-observe | Could not verify specifics against a primary source |

**Corrected — 2 figures.** ClawMetry was submitted as "12 agent runtimes" (and
appeared as "14" in the earlier batch); its package now advertises 32. OmniRoute
was submitted as "160+ providers" with "~1.51B free tokens/month"; the package
advertises 352 providers, and the token figure is not something a router can
guarantee since it depends on upstream free tiers that change without notice.
Both entries carry the corrected framing.

**Caught by CI — 1.** A duplicate `goose` entry was caught by the validator's
duplicate-id check and removed before commit. It works: this repository now has
had submissions arrive that were already present twice (four items in D-6, one
here), and automation caught it both times rather than a human reviewer.

## D-8 — Hidden-gem cohort III: 8 accepted, 8 rejected, 9 already listed

A third batch, this time about always-free compute: VPS instances, container
hosts, PaaS platforms, GPU credits and student programmes. The important outcome
was not the additions — it was that the batch **caught stale data in our own
catalogue**.

**Our Oracle entry was wrong, and this batch is why we know.** The submission
claimed Oracle's Always Free ARM allowance is "up to 2 ARM OCPUs / 12 GB RAM
(reduced from 4/24 in June 2026)". That claim is correct, and our entry had been
sitting at the old 4 OCPU / 24 GB figure. Oracle halved the allowance on
15 June 2026 by quietly editing its documentation — no blog post, no customer
notice — and gave existing tenancies until 18 August 2026 before terminating
over-limit instances. `oracle-cloud-always-free` is now corrected to 2 OCPU /
12 GB with the change, the deadline and the tenancy-wide pool documented. A
catalogue whose selling point is freshness had been carrying a stale spec on one
of its headline entries for three months.

**Accepted — 8 entries.**

| Entry | What made it worth listing |
|---|---|
| Google AI Studio Starter Tier | Two full-stack apps on Cloud Run + Firestore/Cloud SQL, no billing account, no expiry |
| Hugging Face Spaces | Free Docker host at 2 vCPU / 16GB RAM, no card ever |
| Hugging Face ZeroGPU | Shared GPU allocated per request with a free daily quota |
| Databricks Free Edition | Free-forever workspace, no cloud account |
| Toolforge | Wikimedia's free bot hosting — genuinely hidden, absent from most lists |
| Zeabur | Free plan with no card required |
| AMD Developer Cloud | MI300X with 192GB HBM3, listed as a `trial` |
| Yotta Shakti Studio | H100/L40S in India, listed as a `trial` |
| GitHub Student Developer Pack | Bundled credits, collapsed from five submissions into one entry |

**Corrected — 3 claims, in both directions.** Zeabur was wrong twice over: the
submission said it requires a card (it does not) and that it never sleeps (it
auto-sleeps after inactivity). The "$5 free credit" was actually the price of the
paid Dev plan. AMD was the reverse error: presented as simply "free" with no
card, when a card is required at account creation, the $100 is one-off, and the
credits expire (AMD's own pages disagree with each other — 30 days now, 10 days
in older guidance). AMD and Yotta are listed as `trial` under OQ-3, which
already permits card-gated credit grants of $100+ over 30+ days provided they
are tagged and never appear in a no-card filter. Hugging Face ZeroGPU's hardware
could not be pinned down — the submission said an RTX Pro 6000 Blackwell, other
sources say H200 — so the entry states the quota, which is the real constraint,
and flags the hardware as variable.

**Rejected — 8.**

| Submission | Reason |
|---|---|
| ClawCloud | Its own users report the free tier does not work and support never replies: Trustpilot 2.0/5 across 30 reviews, 2.8/5 across 16 more. Several reviewers describe being charged and then ignored past the refund window |
| Kuberns | `kuberns.com` does not resolve |
| Darwin Agentic Cloud | No independent coverage found; could not verify the signed-receipt or spend-limit claims |
| rawhq | No independent coverage found; could not verify the "90% cheaper than EC2, free forever" claim |
| SnapDeploy, InstaVM, Northflank | Free-tier claims could not be reproduced from vendor documentation — Northflank's pricing page now shows only paid plans |
| GTHost Free NAT KVM | A LowEndTalk promotional offer, not a standing free tier |
| PicoClaw / Hermes Agent / HuggingClaw / huggingfree-openclaw recipes | Deployment guides for third-party agent projects rather than free tiers — out of scope for `free-tiers.yaml` |

ClawCloud is the clearest rejection in this batch and worth naming explicitly:
a provider with a documented pattern of taking payment and providing no support
is the exact opposite of what this catalogue promises readers.

**Already listed — 9.** Oracle, GCP, AWS, Render, Railway, Fly.io, Neon, Qdrant
and Cloudflare R2 were all already present, which is why the batch's real
contribution was the correction rather than the additions. One near-miss: Hugging
Face Spaces *was* already listed under the id `huggingface-spaces`, but a dedupe
grep for `hugging-face` missed it because of the hyphen. The duplicate was caught
by the validator rather than by my search, and the existing entry was enriched
with the verified specs instead of being added twice.

## D-9 — New category: `skills` (5th), and why registries need an API to verify

This batch proposed a fifth data file. Unlike the previous three batches it
asked for a structural change, so the decision was about whether agent skills
are a distinct resource type or a flavour of `agent-tools`.

**They are distinct.** An agent tool is a program you run; a skill is a folder of
instructions and scripts that extends an agent you already run. Skills have no
process, no token and no network service, and they are distributed through
catalogs and registries rather than package indexes. Filing them under
`agent-tools` would have meant inventing a fake `category` value inside a schema
whose enum is IDE/CLI/framework/orchestrator. So: `data/skills.yaml`, its own
schema, a fifth website route, and a row in the stats table.

**Granularity: packs, not individual skills.** Listing 39 individual OpenAI
skills would be 39 near-identical rows and would duplicate a registry that already
exists. The catalogue's job is to say where skills come from, who maintains them
and what they cost — so entries are catalogs, vendor packs and registries.

**A new verification problem, and a rule for it.** Public skill directories are
client-rendered single-page apps. Two of the three in this batch return HTTP 200
for *any* path, including slugs invented specifically to test that:

| Host | Real skill | Invented skill | Verdict |
|---|---|---|---|
| `clawhub.ai/skills/<slug>` | 200 | 200 | Cannot verify by URL |
| `skills.sh/<org>/<repo>/<skill>` | 200 | 200 | Cannot verify by URL |
| `skillsmp.com/skills/<slug>` | 404 (`/skills/notion`) | 404 | Can verify — and the claimed page is missing |
| `github.com/openai/skills/...` | 200 | 404 | Verifiable |

Rule adopted: **a skill entry may only claim a count that came from a real API or
a repository tree.** ClawHub's 7,703 unique slugs were counted by paginating
`clawhub.ai/api/v1/skills`; OpenAI's 39 curated skills were read from the
repository's own file listing. Neither number was taken from the submission.
Registries that cannot be queried are listed at registry level and marked
`degraded` rather than carrying unverifiable counts.

**What the verification found.** This batch had the highest fabrication rate of
the four:

- **OpenAI curated skills: 5 of 33 invented.** `doc`, `spreadsheet`, `imagegen`,
  `sora` and `develop-web-game` are not in the catalog — all five 404 against the
  repository, while the other 28 resolve. The real curated set contains skills
  the submission did not mention: `figma-use`, `migrate-to-codex`, `hatch-pet`,
  `winui-app`, `playwright-interactive`.
- **ClawHub skills: 19 of 25 invented.** Only `pdf-generation`, `skill-creator`,
  `skill-vetter`, `openai-whisper`, `systematic-debugging` and `code-review`
  exist in the registry of 7,703. The headline "Skill Security Scan (Alibaba)"
  does not exist under that slug, nor under any close variant.
- **`hol-guard/hol-guard` (GitHub) does not exist**, although HOL Guard itself is
  real and already catalogued from PyPI. `browserbase/browse.sh` is not a
  repository either.
- **`skillsmp.com/skills/notion`** and the claimed `duarteocarmo-dotfiles-github`
  page did not resolve.

**Two major finds the submission missed.** While verifying `openai/skills` the
obvious sibling check turned up `anthropics/skills` — the larger project, at
177,887 stars — and `obra/superpowers` at 290,953. All three are now listed with
counts read from GitHub. A skills category without the two first-party catalogs
would have been the wrong category.

**Fixed while wiring this up — three real bugs.**

1. `validate.py` used `if stem in CARD_CATEGORIES: ... else: require
   requires_auth`. The else-branch silently assumed every non-card category was
   MCP servers, so 13 spurious errors appeared the moment a third shape existed.
   Now keyed explicitly on `stem == "mcp-servers"`.
2. Website `<title>` and meta descriptions carried **hardcoded counts** and had
   read "63 providers" and "62 servers" since the first import — the most
   SEO-visible strings on the site, stale for three batches. They now carry a
   `{count}` token substituted from `getEntries(slug).length` at render time.
   The first attempt read from `stats.json` instead, which is written by a
   separate script, and the new category immediately rendered a literal
   `{count}` into its title — counting the entries the page already loads is the
   version that cannot drift.
3. The README's hand-written featured block still advertised Oracle's
   pre-June-2026 spec ("4 ARM cores + 24GB RAM") — the same stale claim D-8
   corrected in the data file but not in the prose.
