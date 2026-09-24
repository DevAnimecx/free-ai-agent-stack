# Contributing to free-ai-agent-stack

Thanks for helping keep this the most current free-tier list on the internet. There are four ways to contribute, in increasing order of effort.

| Path | Best for | Effort |
|---|---|---|
| [Report an outdated limit or dead link](../../issues/new?template=report-broken-link.yml) | Anyone who spots a wrong number | 30 seconds |
| [Submit a resource via issue form](../../issues/new?template=add-resource.yml) | Tool maintainers, non-technical contributors | 2 minutes |
| Direct PR (add or update an entry) | Developers | 5 minutes |
| Bulk update (5+ entries) | Vendors with many changes | Open an issue first |

CI runs on every PR. If it passes, a maintainer will merge it — usually within 72 hours (our target median is 24h).

---

## The 3-step flow

### 1. Find the right file

| File | What goes in it |
|---|---|
| [`data/llm-apis.yaml`](data/llm-apis.yaml) | LLM inference APIs and local runtimes |
| [`data/mcp-servers.yaml`](data/mcp-servers.yaml) | Model Context Protocol servers |
| [`data/agent-tools.yaml`](data/agent-tools.yaml) | IDEs, CLI agents, frameworks, orchestrators |
| [`data/free-tiers.yaml`](data/free-tiers.yaml) | Hosting, databases, vector DBs, auth, queues, observability, email, search |

### 2. Copy the template and fill it in

Every field is documented in [`schemas/`](schemas/). Here is a complete LLM API entry — it is the one most contributors add:

```yaml
- id: acme-llm                          # kebab-case, unique across ALL files, immutable once merged
  name: Acme LLM                        # the product's real name
  provider: Acme Inc                    # the company
  description: "One sentence, in your own words. Do not copy the vendor's marketing copy."
  free_limit: "1,000 requests/day"      # the published free allowance, in the vendor's units
  requires_card: false                  # true if payment details are needed. If unsure: true
  requires_phone: false                 # optional
  rate_limit: "10 RPM"                  # optional
  models: [acme-large, acme-mini]       # optional
  modalities: [text, vision]            # text | vision | audio | video | image-gen | embeddings |
                                        # rerank | speech-to-text | text-to-speech | translation | ocr
  context_window: 128000                # optional, integer
  commercial_use: true                  # optional
  data_used_for_training: false         # optional — does the free tier train on prompts?
  url: https://acme.example/llm         # https only. The canonical signup or pricing page
  docs_url: https://acme.example/docs   # optional
  signup_url: https://acme.example/signup
  tags: [no-card, openai-compatible]    # lowercase, hyphenated
  verified: 2026-09-24                  # the date YOU checked the pricing page
  verified_by: "@DevAnimecx"    # credit where it's due
  status: active                        # active | degraded | broken | deprecated
  notes: "Free tier is not available in the EU."   # optional, but invaluable
```

MCP servers use `install`, `transport`, `requires_auth`, `official` and `clients` instead of `free_limit`/`requires_card`:

```yaml
- id: acme-mcp
  name: Acme MCP
  maintainer: Acme Inc
  description: "What it does, one sentence, in your own words."
  install: "npx -y @acme/mcp-server"    # must be copy-pasteable
  transport: [stdio, http]              # stdio | http | sse
  official: true                        # vendor-maintained, or false
  language: typescript                  # implementation language
  requires_auth: true
  auth_type: "Acme API key"             # optional
  url: https://github.com/acme/mcp-server
  clients: [claude, cursor, vscode]     # claude | claude-code | cursor | vscode | windsurf |
                                        # zed | cline | kiro | gemini-cli | codex
  tags: [devops]
  verified: 2026-09-24
  verified_by: "@your-github-handle"
  status: active
```

### 3. Validate locally, then open the PR

```bash
python3 scripts/validate.py       # schema + duplicates + https + affiliate params + dates
python3 scripts/export_json.py    # regenerate /data/*.json and /llms.txt if you touched data
npm ci --prefix website && npm run build --prefix website   # only if you touched website/
```

`validate.py` prints exactly what is wrong and where, for example:

```
[ERROR] llm-apis#acme-llm.url: duplicate url, also used by openrouter-free
[ERROR] llm-apis#acme-llm.requires_card is missing — must be explicit (default true)
```

---

## Inclusion criteria

A resource is included only if **all** of these are true:

1. It offers a free tier that does not require payment to start
2. It is relevant to building AI agents (inference, memory, tools, hosting, observability)
3. It is publicly accessible — no waitlist-only, no invite-only, no "contact sales"
4. It is not abandoned (commit or release within the last 12 months, or actively maintained)
5. It is not a pure affiliate or referral link
6. Its free limit is published somewhere we can link to and cite

**Rejected outright:**

- Paid products with a "free trial" only — unless the trial has no card requirement, in which case it belongs in `llm-apis.yaml` as a trial entry with a note
- Thin wrappers around a free API that add nothing (point people at the upstream instead)
- Crypto, token-gated or "earn credits" services
- Duplicates of an existing entry (check `id` **and** `url`)
- Anything requiring a sales conversation to use

**Judgement calls, and how we call them:**

| Situation | We do this |
|---|---|
| Free tier is fine but no longer advertised | Keep it if it still works, mark `status: degraded`, explain in `notes` |
| Provider removed its free tier | Keep the entry as `status: deprecated` with what replaced it — this is a feature, not clutter |
| Card required, but a large credit is given | Include with `requires_card: true` and the expiry window in `free_limit` |
| Non-commercial licence (e.g. Cohere trial keys) | Include, set `commercial_use: false`, say so in `notes` |
| Free tier is region-restricted | Include with the region in `notes` — a huge share of readers are outside the US |

## Field rules

| Rule | Detail |
|---|---|
| `id` immutability | Once merged, `id` never changes. A rename = new entry + `status: deprecated` on the old one |
| `verified` | Must be the date you actually checked, in `YYYY-MM-DD`. CI rejects future dates |
| `requires_card` | Explicit `true`/`false`. When unknown, use `true` — never mislead |
| Descriptions | Written by you, not pasted from the vendor site (CI rejects verbatim duplicates) |
| URLs | `https://` only. Affiliate parameters (`?ref=`, `?via=`, `?aff=`) are auto-rejected |
| `status` | `active` · `degraded` (works, with caveats) · `broken` (set by CI) · `deprecated` (no longer free) |

## Spam and moderation rules

- PRs from GitHub accounts under 30 days old, with no prior history, get a maintainer review before merge (soft rule, never an automatic close)
- Any PR adding more than 5 entries at once needs manual review — split it, or expect a slower merge
- Affiliate parameters in URLs are rejected by CI
- Self-promotion is welcome **if** the resource meets the inclusion criteria and the PR states the affiliation. Undisclosed affiliation is the only thing that gets you blocked
- Vendors: you are encouraged to update your own entries when limits change. One PR with a changelog beats five silent edits

## What CI checks

| Check | Workflow | Fails the PR? |
|---|---|---|
| JSON Schema validation | `validate.yml` | Yes |
| Duplicate `id` / `url` / near-duplicate name | `validate.py` | Yes |
| Non-HTTPS URL, affiliate params | `validate.py` | Yes |
| `verified` in the future | `validate.py` | Yes |
| URL reachability (HEAD request) | `validate.yml` | Warns; a dead link blocks merge after review |
| Delete guard (entry count drop below the floor) | `validate.py` | Yes |
| Site build | `deploy-site.yml` | Yes, if you touched `website/` |

## Definition of done for a data PR

- [ ] YAML validates against the schema
- [ ] No duplicate `id` or `url`
- [ ] `verified` set to today
- [ ] `verified_by` set to your handle
- [ ] URL returns 200-399
- [ ] `requires_card` explicitly set
- [ ] Site builds if `website/` changed

## Code contributions

The website is Next.js 15 (App Router) with Tailwind, exported statically. Keep the JS budget under 150KB on category pages and Lighthouse ≥95; `npm run build` prints the analyzer output. All strings live in `website/lib/strings.ts` so the V2 localisation work does not require touching components.

## Getting help

Open an issue, or comment on the PR — we will tell you exactly what to change rather than just closing it. If you are unsure whether something qualifies, submit it with a note; that is a much better use of your time than deciding not to bother.
