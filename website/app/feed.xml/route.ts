import { CATEGORIES, getAllEntries, getStats } from "@/lib/loadData";
import { BRAND, SITE_URL } from "@/lib/site";
import { strings } from "@/lib/strings";

// A real RSS 2.0 feed of the entries re-verified most recently.
//
// It exists for three reasons rather than one: readers who genuinely want a
// feed, aggregators and newsletters that will re-publish a verified-only
// catalogue, and freshness signals for crawlers that look for a syndication
// endpoint. Each entry links to its canonical anchor on the site, not to the
// vendor, so the citation resolves back here.

export const dynamic = "force-static";

function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function GET() {
  const stats = getStats();
  const entries = getAllEntries()
    .slice()
    .sort((a, b) => (a.verified < b.verified ? 1 : -1))
    .slice(0, 50);

  const items = entries
    .map((entry) => {
      const link = `${SITE_URL}/${entry._category}/#${entry.id}`;
      const category = CATEGORIES.find((c) => c.slug === entry._category)?.label ?? entry._category;
      const extra = "free_limit" in entry ? ` Free limit: ${(entry as { free_limit: string }).free_limit}` : "";
      const pub = new Date(`${entry.verified}T09:00:00Z`).toUTCString();
      return [
        "    <item>",
        `      <title>${esc(`${entry.name} (${category})`)}</title>`,
        `      <link>${esc(link)}</link>`,
        `      <guid isPermaLink="true">${esc(link)}</guid>`,
        `      <pubDate>${pub}</pubDate>`,
        `      <category>${esc(category)}</category>`,
        `      <description>${esc(`${entry.description}${extra} Verified ${entry.verified}.`)}</description>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(`${strings.site.name} — recently verified`)}</title>
    <link>${SITE_URL}/</link>
    <description>${esc(
      `Free LLM APIs, MCP servers, agent tools, free tiers and agent skills as they are re-verified. ${stats.total} entries, ${stats.total_no_card} needing no credit card. Maintained by ${BRAND.byline}.`,
    )}</description>
    <language>en</language>
    <lastBuildDate>${new Date(stats.generated_at).toUTCString()}</lastBuildDate>
    <copyright>Data CC BY 4.0 — ${esc(BRAND.byline)}</copyright>
    <managingEditor>${esc(BRAND.author)}</managingEditor>
    <webMaster>${esc(BRAND.author)}</webMaster>
    <generator>free-ai-agent-stack</generator>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
