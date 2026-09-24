<!--
Thanks for the PR. This template mirrors the Definition of Done in CONTRIBUTING.md.
Delete sections that do not apply rather than leaving them blank.
-->

## What does this change?

<!-- One or two sentences. "Adds Acme LLM to llm-apis.yaml" or "Re-verifies all 12 MCP servers whose 30-day window expired". -->

**Type:** data addition · data correction · deprecation · schema change · site/tooling · docs

## Entries touched

| Entry ID | Category | Change |
|---|---|---|
| `acme-llm` | llm-apis | added |

## Verification (required for data changes)

- [ ] I opened the vendor's **pricing or rate-limits page** (not a blog post or a third-party list)
- [ ] `verified` is set to today's date, `verified_by` is my handle
- [ ] `free_limit` is copied from the vendor's published wording
- [ ] `requires_card` is explicitly `true` or `false` — and set to `true` if the page does not say
- [ ] I noted any region restriction, phone verification or training-on-prompts behaviour in `notes`

**Link to the page I checked:** <!-- paste it here -->

## Checklist

- [ ] `python3 scripts/validate.py` passes locally
- [ ] No duplicate `id` or `url` (validate.py checks both)
- [ ] Descriptions are written by me, not copied from the vendor site
- [ ] If a free tier was removed, the entry is marked `status: deprecated` **with the replacement named** — we keep deprecations rather than deleting them
- [ ] If this adds more than 5 entries, I have explained why in one PR instead of several

## Affiliations

<!-- Required disclosure: do you work for, maintain, or have any stake in any resource in this PR? "None" is a fine answer. -->

## Notes for the reviewer

<!-- Anything you were unsure about. Flagging uncertainty is encouraged — it costs you nothing and it is how a bad entry gets caught before merge. -->
