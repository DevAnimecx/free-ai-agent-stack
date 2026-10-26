# Re-verification plan — fixing the stale 2026-09-24 dates

## Status on 2026-10-26

- 384 entries. All human pricing-verification dates are 2026-09-24.
- That is 32 days old, past this project's own 30-day window.
- The auto-generated stats on 2026-10-26 say it plainly: 0 entries
  verified within 30 days, 0.0% freshness against a 95% target.
- Tracker: issue #15, "Needs re-verification".

This plan does **not** change any `verified` date by itself. A date only
moves when a human has actually opened the vendor's pricing page, per
`docs/METHODOLOGY.md` section 2.

## What "verified" means here, and what it does not

- **Daily link checking (robot):** HEAD request, 3 strikes, then
  `status: broken`. It proves a URL is alive. It does **not** prove the
  free limit, the card requirement, or the rate limit are still true.
- **Human verification:** open the pricing / rate-limits page, confirm
  `free_limit`, `rate_limit`, and `requires_card`, then set `verified`
  to that day's date and `verified_by` to your handle.
- No robot may write `free_limit`, `requires_card`, `verified`, or
  `verified_by`. That rule is in the methodology, and it is the product.

That distinction is why the README badge was fixed in this PR: the old
"100% fresh <30d" badge confused link-alive with pricing-verified.

## Priority order (rot fastest first)

| Order | Category | Count | Why first |
|---|---|---|---|
| 1 | LLM APIs (`data/llm-apis.yaml`) | 70 | Free tiers rot fastest — the site itself notes Cerebras and Google changes in 2026 |
| 2 | MCP servers (`data/mcp-servers.yaml`) | 64 | Install commands and auth requirements change; archived servers must stay marked archived |
| 3 | Free tiers (`data/free-tiers.yaml`) | 90 | Hosting/database limits change quietly; check the free tier, not the marketing page |
| 4 | Agent tools (`data/agent-tools.yaml`) | 82 | Mostly stable, but check for deprecation / paywall moves |
| 5 | Agent skills (`data/skills.yaml`) | 78 | Lowest pricing risk; many are registries, check the registry still exists |

Work in batches of **at most 20 entries per PR**, one category at a time.
A 384-entry PR cannot be reviewed honestly.

## How to re-verify one entry

1. Open the vendor's pricing or rate-limits page — not a blog post,
   not a Reddit thread, not the marketing homepage.
2. Confirm `free_limit` in the vendor's own units. If it changed,
   update it and add a `notes` line saying what changed.
3. Confirm `rate_limit`, if the vendor publishes one.
4. Confirm `requires_card`. If the page does not say, and there is no
   card-free evidence in docs or the console flow, set it to `true`.
   Never default in the vendor's favour.
5. Check phone verification, region restrictions, and whether the free
   tier trains on prompts — record those where they apply.
6. Set `verified` to today's date and `verified_by` to your GitHub handle.
7. If the free tier is gone, do **not** delete the entry. Set
   `status: deprecated` with a `notes` line naming the replacement.
   Keeping deprecated entries is deliberate — see Methodology §4.

## Validation before opening a PR

```bash
python3 scripts/validate.py       # schema + duplicates + https + dates
python3 scripts/export_json.py    # regenerate /data/*.json and /llms.txt if you touched data
```

In the PR description, list the pricing pages you opened, or at least
the category batch and the date you checked them. A PR that only bumps
dates, with no pricing-page evidence, should be rejected.

## When this plan is done

- The auto-stats block should read ≥95% verified within 30 days.
- Only then should the README badge go back to a "fresh" claim — and
  it must say what was actually checked: pricing, not just links.
- Until then, the README must keep the honest 2026-09-24 date visible.
  Hiding staleness to look fresh is worse than being stale.
