# Governance

The project optimises for one thing above all: **the data staying trustworthy
after the founding maintainer stops answering email.** Everything below is
designed around that.

## Phases

| Phase | Trigger | Structure |
|---|---|---|
| **1** | 0–100 stars | Single maintainer, full merge rights |
| **2** | 100–1,000 stars | 3–5 maintainers, one owner per category |
| **3** | 1,000+ stars | RFC process, CODEOWNERS per directory, maintainer rotation |

We are in **Phase 1** at launch. Promotion to Phase 2 happens when a contributor
has had ≥5 substantive PRs merged and been active for ≥30 days.

## Roles

| Role | Can do | How you get it |
|---|---|---|
| **Contributor** | Open PRs and issues | Just start |
| **Category maintainer** | Merge PRs touching their category's YAML; triage its issues | Invited after 5 merged PRs in that category |
| **Maintainer** | Merge anything, manage workflows, cut releases | Invited by consensus of existing maintainers |
| **Founding maintainer** | Tiebreaker, secrets, repo settings | The person who started it, until they step down |

## Decision rights

- **Within a category** (is this provider's free tier worth listing?): the
  category maintainer decides alone, and their decision is final. Speed matters
  more than consensus here.
- **Cross-cutting changes** (schema fields, adding a category, changing inclusion
  criteria): 2+ maintainers must agree, and the change needs an entry in
  `docs/DECISIONS.md`.
- **Breaking the data contract** (renaming a field, changing an enum, dropping an
  entry): requires an RFC issue, a 14-day comment window, a schema version bump
  and a CHANGELOG entry. Downstream consumers get a deprecation window, never a
  silent break.
- **Removing a maintainer**: inactivity for 90 days moves someone to *emeritus*.
  Nothing personal — an unresponsive reviewer is worse than a smaller team.

## Merge policy

| Change | Reviewer needed | Target time |
|---|---|---|
| New entry, schema-valid, link alive | 1 maintainer (any) | 24h |
| Update to an existing entry (limits, dates) | 1 maintainer | 24h |
| Fix a broken link | 1 maintainer | 12h |
| Schema change | 2 maintainers + RFC | 14 days |
| New category | 2 maintainers | 7 days |
| Anything touching `.github/workflows/` | A maintainer with workflow rights | 48h |
| Reverting a bad data change | Any maintainer, immediately | Now |

CI is a gate, not a judge: a green PR still gets read by a human before merge,
because "passes the schema" and "is true" are different claims.

## COI policy (conflicts of interest)

- Maintainers may merge PRs touching products they work for, **if** they disclose
  it in the PR thread and another maintainer approves
- A maintainer may not merge their own employer's entry unilaterally
- Vendors may not become category maintainers for their own category
- Any maintainer who joins a listed vendor must disclose it in
  `MAINTAINERS.md` within 30 days

## RFC process (from Phase 3)

1. Open an issue titled `RFC: <change>`, using the RFC template
2. 14-day comment window
3. Two maintainer approvals required
4. Merged RFCs are recorded in `docs/DECISIONS.md` with the reasoning — including
   the options that were rejected and why

## Sustainable maintenance

The mitigation for maintainer burnout (risk R-4) is automation-first, and it is
enforced by these rules:

1. **No manual recurring work.** If a task repeats weekly, it gets a workflow or
   it does not get done. The stats block, contributor wall, link checks and stale
   triage are all automated for this reason
2. **The bus factor is a number, not a feeling.** ≥2 people must hold merge rights
   and workflow-admin access at all times
3. **A quarterly dump.** Every quarter the maintainers publish the on-call
   reality: PRs merged, median time to merge, stale entries, and anything that
   felt like a burden
4. **Walking away is legitimate.** If nobody wants to maintain a category, the
   honest move is to mark its entries as they are and say so, not to let them rot
   quietly

## Succession

If the founding maintainer disappears for 60 days with no notice:

1. Maintainers may merge anything not touching secrets or billing without them
2. After 120 days, the maintainer group may appoint a new lead and take over repo
   settings
3. The data licence is irrevocable — no future maintainer can relicense the
   dataset to a paid-only model. This is deliberate

## What this project will never do

Recorded here so a future maintainer cannot quietly change it:

- Sell listing placement, or rank listings by payment
- Add affiliate links or referral parameters
- Put content behind a paywall or an email gate
- Add a popup, interstitial or consent-banner-triggering tracker
- Delete a deprecated entry to make the numbers look better
