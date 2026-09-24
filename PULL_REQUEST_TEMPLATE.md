# Pull Request

> **Thank you for keeping this the most current free-tier list on the internet.**
>
> Every entry in this catalogue was checked by a human against the vendor's pricing page. Your contribution keeps it that way.

## What kind of change is this?

- [ ] **Add a resource** — new free-tier entry
- [ ] **Update a resource** — changed free limit, card requirement, or status
- [ ] **Fix a link** — dead URL or wrong reference
- [ ] **Documentation** — README, methodology, or website text
- [ ] **Data cleanup** — deduplication, tag fixes, schema updates

## Checklist

- [ ] I ran `python3 scripts/validate.py` locally and it passed
- [ ] `verified` is set to today's date (`YYYY-MM-DD`)
- [ ] `verified_by` is set to my GitHub handle
- [ ] `requires_card` is explicitly set (true or false)
- [ ] URLs use `https://` only (no affiliate parameters)
- [ ] The `id` is kebab-case and unique across all data files
- [ ] I have not copied the vendor's marketing text verbatim
- [ ] I checked the vendor's pricing page today

## For new resources only

- [ ] The free tier is genuinely free (no credit card, no purchase required to start)
- [ ] The free limit is published somewhere we can link to and cite
- [ ] The service is relevant to building AI agents
- [ ] The service is publicly accessible (no waitlist, no invite-only)
- [ ] The service is actively maintained (commit or release within the last 12 months)
- [ ] It is not a pure affiliate or referral link

## Notes for reviewers

<!-- Anything unusual, edge cases, or questions for maintainers -->

---
> Full guidelines: [CONTRIBUTING.md](CONTRIBUTING.md)
> CI runs on every PR. If it passes, a maintainer will merge within 72 hours (target median: 24h).