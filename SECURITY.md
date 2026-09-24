# Security Policy

## Supported versions

Only the latest release of `main` receives security fixes.

## Reporting a vulnerability

Please do **not** open a public issue for security vulnerabilities. Instead:

1. Email **animecx69@gmail.com** with a descriptive subject line
2. Include a clear description of the issue, reproduction steps, and impact assessment
3. We will acknowledge receipt within 72 hours and aim to provide a fix within 14 days for high-severity issues

## Scope

This project is a curated data catalogue. It does not run code from third parties, execute untrusted input, or store secrets. The security surface is limited to:

- **Data integrity** — YAML files in `data/` that are schema-validated by CI
- **Link integrity** — daily HEAD requests against every URL in the catalogue
- **Website build** — a static Next.js export deployed to GitHub Pages

## What is *not* in scope

- Vulnerabilities in any third-party service listed in the catalogue (those are the vendors' responsibility)
- Issues with the website's visual rendering on a particular browser
- The pricing or free-tier decisions of listed providers

## Disclosure

We practice responsible disclosure. Once a fix is merged, we will publish a note in the changelog and credit the reporter (unless they request anonymity).

## Recognition

We thank the following security researchers for responsible disclosure (alphabetical):

- *Your name here* — submit a valid report and we will add you.*