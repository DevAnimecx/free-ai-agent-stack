/** @type {import('next').NextConfig} */

// Static export (PRD §10.1): no server, no runtime cost, deployable to Vercel,
// Cloudflare Pages or GitHub Pages from the same build.
const basePath = process.env.BASE_PATH || "";

// NOTE: `redirects()` and `headers()` are deliberately NOT configured here —
// Next warns (correctly) that custom routes do not work with `output: 'export'`.
// Host-level equivalents live in:
//   website/public/_headers      → Cloudflare Pages and Netlify
//   website/vercel.json          → Vercel
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
