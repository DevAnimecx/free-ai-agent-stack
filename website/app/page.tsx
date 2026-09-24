import Link from "next/link";

import { FaqSection } from "@/components/FaqSection";
import { GlobalSearch } from "@/components/GlobalSearch";
import { StatsBanner } from "@/components/StatsBanner";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { answerSummary, homeFaq } from "@/lib/faq";
import { CATEGORIES, getAllEntries, getEntries, getStats } from "@/lib/loadData";
import { datasetSchema, graph, personSchema } from "@/lib/schema";
import { BRAND, SITE_BASE_PATH } from "@/lib/site";
import { strings } from "@/lib/strings";
import type { AnyEntry } from "@/lib/types";

const withBase = (path: string) => `${SITE_BASE_PATH}${path}`;

export const metadata = {
  title: `${strings.site.name} — free AI agent tools, free LLM APIs and MCP servers (2026)`,
  description: strings.site.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${strings.site.name} — free AI agent tools, free LLM APIs and MCP servers`,
    description: strings.site.description,
    url: "/",
    images: [{ url: "/og/home.png", width: 1200, height: 630, alt: strings.site.tagline }],
  },
};

function pickFeatured(stats: ReturnType<typeof getStats>): Array<AnyEntry & { _category: string }> {
  // Round-robin across categories. Pushing each category's picks in sequence
  // and slicing the head would fill the grid with llm-apis and mcp-servers
  // only — agent-tools and free-tiers would never surface on the home page.
  const byCategory = CATEGORIES.map((category) => {
    const ids = stats.featured[category.slug] ?? [];
    const entries = getEntries(category.slug);
    const picks: Array<AnyEntry & { _category: string }> = [];
    for (const id of ids) {
      const found = entries.find((entry) => entry.id === id);
      if (found) picks.push({ ...found, _category: category.slug });
    }
    return picks;
  });

  const out: Array<AnyEntry & { _category: string }> = [];
  const depth = Math.max(0, ...byCategory.map((picks) => picks.length));
  for (let i = 0; i < depth; i++) {
    for (const picks of byCategory) {
      if (picks[i]) out.push(picks[i]);
    }
  }
  return out;
}

export default function HomePage() {
  const stats = getStats();
  const all = getAllEntries();
  const featured = pickFeatured(stats);
  const faq = homeFaq();
  const newest = [...all].sort((a, b) => (a.verified < b.verified ? 1 : -1)).slice(0, 5);

  return (
    <>
      <section className="py-2">
        <h1 className="max-w-3xl text-2xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-[28px] dark:text-slate-50">
          {strings.home.h1}
        </h1>
        <p className="mt-3 max-w-prose text-[14px] leading-6 text-slate-600 dark:text-slate-400">
          {strings.home.lede}
        </p>

        {/* AEO-1: a self-contained paragraph at the top of the page, written to
            make sense with no surrounding context, because that is the unit an
            answer engine quotes. Marked `#answer-summary`, which the WebSite
            schema's speakable selector points at. */}
        <p
          id="answer-summary"
          className="mt-3 max-w-prose border-l-2 border-blue-600 pl-3 text-[13px] leading-6 text-slate-700 dark:border-blue-500 dark:text-slate-300"
        >
          {answerSummary()}
        </p>

        <div className="mt-5 max-w-2xl">
          <GlobalSearch />
        </div>

        <div className="mt-5">
          <StatsBanner stats={stats} />
        </div>
      </section>

      <section className="mt-8" aria-labelledby="featured">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="featured" className="text-[15px] font-semibold text-slate-900 dark:text-slate-50">
            {strings.home.featured}
          </h2>
          <p className="text-[12px] text-slate-500 dark:text-slate-400">{strings.home.featuredSub}</p>
        </div>

        <ul className="mt-3 grid gap-px overflow-hidden rounded-md border border-slate-200 bg-slate-200 sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-800">
          {featured.slice(0, 8).map((entry) => (
            <li key={`${entry._category}-${entry.id}`} className="bg-white p-3 dark:bg-slate-950">
              <div className="flex items-baseline justify-between gap-2">
                <Link
                  href={`/${entry._category}/#${entry.id}`}
                  className="text-[13px] font-semibold text-slate-900 hover:underline dark:text-slate-50"
                >
                  {entry.name}
                </Link>
                <VerifiedBadge date={entry.verified} compact />
              </div>
              <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-slate-600 dark:text-slate-400">
                {entry.description}
              </p>
              <p className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
                <span className="font-mono">{entry._category}</span>
                {"requires_card" in entry && (
                  <span>{(entry as { requires_card: boolean }).requires_card ? "💳 card" : "✅ no card"}</span>
                )}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8" aria-labelledby="browse">
        <h2 id="browse" className="text-[15px] font-semibold text-slate-900 dark:text-slate-50">
          {strings.home.browseAll}
        </h2>
        <ul className="mt-3 divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800">
          {CATEGORIES.map((category) => {
            const count = stats.counts[category.slug] ?? 0;
            const noCard = stats.no_card[category.slug] ?? 0;
            return (
              <li key={category.slug} className="py-3">
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <Link
                    href={`/${category.slug}/`}
                    className="text-[14px] font-semibold text-slate-900 hover:underline dark:text-slate-50"
                  >
                    {category.label}
                  </Link>
                  <span className="font-mono text-[12px] text-slate-400 dark:text-slate-500">
                    {count} entries
                    {noCard > 0 ? ` · ${noCard} without a card` : ""}
                  </span>
                </div>
                <p className="mt-1 max-w-prose text-[12px] leading-5 text-slate-600 dark:text-slate-400">
                  {category.intro[0].split(". ").slice(0, 2).join(". ")}.
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="text-[15px] font-semibold text-slate-900 dark:text-slate-50">
            {strings.home.forAgents}
          </h2>
          <p className="mt-2 max-w-prose text-[13px] leading-6 text-slate-600 dark:text-slate-400">
            {strings.home.forAgentsBody}
          </p>
          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[12px]">
            <a href={withBase("/data/all.json")} className="text-blue-700 hover:underline dark:text-blue-400">
              /data/all.json
            </a>
            <a href={withBase("/llms.txt")} className="text-blue-700 hover:underline dark:text-blue-400">
              /llms.txt
            </a>
            <a href={withBase("/llms-full.txt")} className="text-blue-700 hover:underline dark:text-blue-400">
              /llms-full.txt
            </a>
            <a href={withBase("/feed.xml")} className="text-blue-700 hover:underline dark:text-blue-400">
              /feed.xml
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-[15px] font-semibold text-slate-900 dark:text-slate-50">
            {strings.home.howItWorks}
          </h2>
          <ol className="mt-2 max-w-prose list-decimal space-y-1.5 pl-4 text-[13px] leading-6 text-slate-600 dark:text-slate-400">
            <li>A maintainer opens the vendor&apos;s pricing page and records the free limit, the rate limit and whether a card is required.</li>
            <li>
              The date and their handle go into the entry — every card on this site shows{" "}
              <VerifiedBadge date={newest[0]?.verified ?? "2026-09-24"} compact /> so you can judge how
              current the claim is.
            </li>
            <li>A robot re-checks every URL daily and flags dead links after three consecutive failures.</li>
            <li>Anything unverified for 30 days is thrown back into the weekly triage issue.</li>
          </ol>
          <p className="mt-3 text-[12px]">
            <Link href="/about/" className="text-blue-700 hover:underline dark:text-blue-400">
              Read the full methodology →
            </Link>
          </p>
        </div>
      </section>

      {/* E-E-A-T: an explicit authorship statement on the highest-traffic page,
          naming the maintainer and linking the profile. Trust signals that only
          exist on an /about page are worth much less than one on the page
          people actually land on. */}
      <section className="mt-8 rounded-md border border-slate-200 p-4 dark:border-slate-800" aria-labelledby="maintainer">
        <h2 id="maintainer" className="text-[15px] font-semibold text-slate-900 dark:text-slate-50">
          {strings.about.authorHeading}
        </h2>
        <p className="mt-2 max-w-prose text-[13px] leading-6 text-slate-600 dark:text-slate-400">
          {strings.about.authorBody}
        </p>
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px]">
          <a
            href={BRAND.github}
            target="_blank"
            rel="noopener noreferrer author"
            className="text-blue-700 hover:underline dark:text-blue-400"
          >
            @DevAnimecx on GitHub
          </a>
          <a
            href={BRAND.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700 hover:underline dark:text-blue-400"
          >
            Source repository
          </a>
          <Link href="/about/" className="text-blue-700 hover:underline dark:text-blue-400">
            Methodology
          </Link>
        </p>
      </section>

      <section className="mt-8 border-t border-slate-200 pt-4 dark:border-slate-800">
        <p className="text-[12px] text-slate-500 dark:text-slate-400">
          Recently re-verified:{" "}
          {newest.map((entry, index) => (
            <span key={`${entry.name}-${entry.id}`}>
              {index > 0 && " · "}
              <a
                href={`/${entry._category}/#${entry.id}`}
                className="hover:underline"
                aria-label={`${entry.name}, ${entry._category}, verified ${entry.verified}`}
              >
                {entry.name}
              </a>
            </span>
          ))}
        </p>
      </section>

      <FaqSection items={faq} heading={strings.home.faqHeading} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(graph(datasetSchema(stats), personSchema())),
        }}
      />
    </>
  );
}
