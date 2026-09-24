# Methodology — how a listing earns its place

This document is the public contract between the project and its readers. If an
entry says `requires_card: false` or `verified: 2026-09-24`, this is what that
promise means.

## 1. What counts as "free"

A resource qualifies if a developer can start using it **without paying**, today,
with no sales conversation, and can keep using some meaningful allowance
indefinitely or for a fixed, clearly-labelled window.

Four tiers are recorded, and the tier is visible in the data:

| Tier | Meaning | Example |
|---|---|---|
| **Standing free tier** | No end date, renews | Gemini API, Groq, Cloudflare Workers AI, Supabase, Qdrant Cloud |
| **Recurring allowance** | Free quota that resets monthly or daily, forever | ElevenLabs 10K chars/month, Speechmatics 8h/month |
| **One-time credit / trial** | Fixed credit or window, then it ends | Deepgram $200, Modal $30/month credits, Cognee-style trials |
| **Self-hosted** | Free software, you supply the machine | Ollama, vLLM, pgvector, Langfuse self-hosted |

Trials are included only when they can be started **without a credit card**, or
when the credit is large enough (≥$100) to justify stating that a card is needed.
Either way `requires_card` says so and `free_limit` states the expiry.

Explicitly **not** free, therefore not listed as free:

- A free *trial* that requires a card and gives less than $5 of value
- Free *consumer apps* with no API (ChatGPT free, claude.ai free) — the API is
  what an agent needs, and conflating the two is the most common error in
  competing lists
- Open-source code with a **paid hosted service only** and no self-host path in
  the same entry

## 2. How an entry is verified

A human maintainer (not a script) performs this sequence and records themselves
in `verified_by`:

1. Open the vendor's **pricing or rate-limits page** (not a blog post, not a
   Reddit thread, not the marketing homepage)
2. Confirm the **free allowance** in the vendor's own units and copy it into
   `free_limit` verbatim enough to be quotable
3. Confirm the **rate limit** (RPM/RPD/TPM) and record it in `rate_limit`
4. Determine whether a **credit card** is required. If the page does not say,
   and there is no card-free evidence in the documentation or console flow, the
   value is `true`. We never default in the vendor's favour
5. Check **phone verification** and **region restrictions**; both go in the entry
6. Check whether the free tier **trains on prompts**; that goes in
   `data_used_for_training` — it is a real cost of "free"
7. Set `verified` to the date of this check and `verified_by` to the handle

The five facts that must be right, in priority order, because they are what
people actually act on:

1. `requires_card` — a false negative wastes a signup and a card detail
2. `free_limit` — a wrong number breaks someone's production assumption
3. `status` — people need to know *today* whether this still works
4. `commercial_use` — a licence violation is worse than a wasted signup
5. `data_used_for_training` — increasingly the deciding factor for companies

## 3. What automation does, and what it never does

Automation is deliberately limited, because a robot cannot read a pricing page.

| Automation | Runs | Can it change a listing? |
|---|---|---|
| Link checking (HEAD request, 3 strikes) | Daily | Only `status`, and only between `active` and `broken` |
| Star count refresh | Weekly | Writes `stars:` only |
| Stale-entry triage (30-day window) | Weekly | Opens an issue; a human must act |
| Schema validation | Every PR | Blocks the PR; never edits data |
| Stats and contributor block in README | Weekly | Only inside the `STATS` markers |
| JSON/`llms.txt` export | Every build | Generated files only |

No robot may write `free_limit`, `requires_card`, `verified` or `verified_by`.
Those four fields are human-only by design — that is the whole product.

## 4. Decay handling

Free tiers rot fast (Cerebras dropped its no-card free tier in July 2026; Google
moved Pro models to paid in April 2026). Our handling:

| Situation | Action |
|---|---|
| URL dead 3 consecutive days | `status: broken`, tracking issue opened. Fix within 24h or the entry is deprecated |
| Limits changed downward | Update `free_limit`, add a `notes` line, keep `status: active` |
| Free tier removed entirely | `status: deprecated` + `notes` naming the replacement. **The entry stays** |
| Provider acquired / product renamed | New `id`, old entry deprecated, `notes` on both explaining the rename |
| Unverified for >30 days | Surfaced weekly for re-verification; `verified` date stays honest |

Keeping deprecated entries — rather than deleting them — is the single most
useful thing this dataset does. Half the internet still tells developers that
the OpenAI API has free credits. It does not. Here, that costs one line in a
file, and saves thousands of wasted signups.

## 5. Known limitations, stated plainly

- **Region gating.** Free tiers often differ by country. We record the notable
  restrictions in `notes` rather than attempting per-country entries; a US-centric
  bias is real and contributors outside the US are actively encouraged to correct it
- **Rotation.** Some free model rosters change monthly (OpenRouter's `:free`
  list, SiliconFlow's free models). `verified` tells you when we last looked; it
  does not promise the list is unchanged since
- **No benchmarking.** We do not test model quality or measure latency. Requests
  are an HTTP HEAD, not a performance claim
- **Vendor-declared limits.** We record what vendors publish. Undocumented soft
  limits exist and we cannot see them
- **Neurons, credits and units.** Some allowances are not token-based (Cloudflare
  Neurons, Modal dollars). These are recorded in the vendor's unit rather than
  converted, because conversions go stale faster than the limits do

## 6. Corrections

Every card on the website and every entry supports a one-click "report outdated"
action that pre-fills an issue with the entry's ID. Corrections from readers are
prioritised over new submissions, and a wrong `requires_card` value is treated as
a bug of the highest severity.
