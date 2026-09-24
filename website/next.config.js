/** @type {import('next').NextConfig} */

// Static export (PRD §10.1): no server, no runtime cost, deployable to GitHub
// Pages, Vercel or Cloudflare Pages from the same build.
//
// The base path is DERIVED from the site URL rather than configured separately.
// It used to read `process.env.BASE_PATH || ""`, which meant a local build
// (no env var) produced root-relative asset URLs while a CI build produced
// prefixed ones — so the same commit generated two structurally different
// sites, and only one of them worked. Worse, the failure is invisible locally:
// SITE_URL defaulted to the Pages URL, so absolute URLs carried the subpath
// while `/_next/...` did not, and the result was a site that looked fine in a
// dev server and shipped to Pages with no CSS at all.
//
// One value decides everything: NEXT_PUBLIC_SITE_URL.
//   https://devanimecx.github.io/free-ai-agent-stack  →  basePath /free-ai-agent-stack
//   https://example.com                               →  basePath "" (root domain)
//
// To override the path while keeping the URL (rare — a reverse-proxy rewrite),
// set BASE_PATH explicitly. Setting it to "" forces a root-domain build.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://devanimecx.github.io/free-ai-agent-stack";

function deriveBasePath() {
  if (process.env.BASE_PATH !== undefined) {
    return process.env.BASE_PATH.replace(/\/+$/, "");
  }
  try {
    return new URL(SITE_URL).pathname.replace(/\/+$/, "");
  } catch {
    return "";
  }
}

const basePath = deriveBasePath();

// NOTE: `redirects()` and `headers()` are deliberately NOT configured here —
// Next warns (correctly) that custom routes do not work with `output: 'export'`.
// Host-level equivalents live in:
//   website/public/_headers      → Cloudflare Pages and Netlify
//   website/vercel.json          → Vercel
//   .github/workflows/           → GitHub Pages (no custom headers available)
// Slug renames must therefore add a redirect at the host, not in this file, or
// the old anchor will 404 (SEO-9).
const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true }, // no image optimiser in a static export
  reactStrictMode: true,
  poweredByHeader: false,
};

module.exports = nextConfig;
