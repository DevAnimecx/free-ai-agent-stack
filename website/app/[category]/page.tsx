import Link from "next/link";
import { notFound } from "next/navigation";

import { CategoryExplorer } from "@/components/CategoryExplorer";
import { FaqSection } from "@/components/FaqSection";
import { StatsBanner } from "@/components/StatsBanner";
import { answerSummary, faqFor } from "@/lib/faq";
import { CATEGORIES, categoryBySlug, getEntries, getStats } from "@/lib/loadData";
import { breadcrumbSchema, graph, itemListSchema } from "@/lib/schema";
import { SITE_BASE_PATH } from "@/lib/site";
import { strings } from "@/lib/strings";

const withBase = (path: string) => `${SITE_BASE_PATH}${path}`;

interface Params {
  params: Promise<{ category: string }>;
}

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category: category.slug }));
}

export const dynamicParams = false;

/**
 * Titles and meta descriptions carry a live count via a `{count}` token.
 * These strings are the most SEO-visible text on the site and they previously
 * held hardcoded numbers, so they kept advertising "63 providers" long after
 * the category had grown to 70 — a stale claim in exactly the place a stale
 * claim does the most damage. Substituting from stats here means the number
 * is derived, never typed.
 */
function withCount(template: string, slug: string): string {
  if (!template.includes("{count}")) return template;
  // Count the entries the page already loads rather than reading stats.json:
  // stats is written by a separate script, so a category added between runs
  // would render a literal "{count}" into the <title>. getEntries reads the
  // same exported JSON the page body renders from, so the two cannot disagree.
  return template.replaceAll("{count}", String(getEntries(slug).length));
}

export async function generateMetadata({ params }: Params) {
  const { category: slug } = await params;
  const category = categoryBySlug(slug);
  if (!category) return {};
  const title = withCount(category.title, category.slug);
  const description = withCount(category.metaDescription, category.slug);
  return {
    title,
    description,
    alternates: { canonical: `/${category.slug}/` },
    openGraph: {
      title,
      description,
      url: `/${category.slug}/`,
      type: "website",
      // One generated card per category, carrying that category's real counts.
      images: [
        {
          url: `/og/${category.slug}.png`,
          width: 1200,
          height: 630,
          alt: `${category.label} — ${description}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/og/${category.slug}.png`],
    },
  };
}

export default async function CategoryPage({ params }: Params) {
  const { category: slug } = await params;
  const category = categoryBySlug(slug);
  if (!category) notFound();

  const entries = getEntries(category.slug);
  const stats = getStats();
  const others = CATEGORIES.filter((c) => c.slug !== category.slug);
  const faq = faqFor(category.slug);

  return (
    <>
      <header className="pb-4">
        {/* Visible breadcrumb; the same trail is emitted as BreadcrumbList
            below, so the two are generated from one literal. */}
        <nav aria-label="Breadcrumb" className="text-[12px] text-slate-400 dark:text-slate-500">
          <Link href="/" className="hover:text-slate-700 dark:hover:text-slate-300">
            {strings.site.name}
          </Link>
          <span aria-hidden="true"> / </span>
          <span className="text-slate-500 dark:text-slate-400">{category.label}</span>
        </nav>

        <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-50">
          {category.label}
        </h1>
        <p className="mt-1 font-mono text-[12px] text-slate-400 dark:text-slate-500">
          {entries.length} entries · verified {entries[0]?.verified ?? "—"} · schema{" "}
          {category.schema.split("/").pop()}
        </p>

        {/* AEO-1: the quotable one-sentence answer, placed above the fold and
            before the explorer, because it is the passage an engine lifts. */}
        <p
          id="answer-summary"
          className="mt-3 max-w-prose border-l-2 border-blue-600 pl-3 text-[13px] leading-6 text-slate-700 dark:border-blue-500 dark:text-slate-300"
        >
          {answerSummary(category.slug)}
        </p>

        {/* SEO-11: 150+ words of unique intro copy per category. */}
        <div className="prose-intro mt-3">
          {category.intro.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-4">
          <StatsBanner stats={stats} compact />
        </div>
      </header>

      <CategoryExplorer entries={entries} slug={category.slug} />

      <FaqSection items={faq} heading={`${category.label} — questions`} />

      <section className="mt-10 border-t border-slate-200 pt-4 dark:border-slate-800">
        <h2 className="text-[13px] font-semibold text-slate-900 dark:text-slate-50">
          Keep going
        </h2>
        <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[13px]">
          {others.map((other) => (
            <li key={other.slug}>
              <Link
                href={`/${other.slug}/`}
                className="text-blue-700 hover:underline dark:text-blue-400"
              >
                {other.label}
              </Link>
              <span className="ml-1.5 font-mono text-[11px] text-slate-400 dark:text-slate-500">
                {stats.counts[other.slug] ?? 0}
              </span>
            </li>
          ))}
          <li>
            <Link href="/about/" className="text-blue-700 hover:underline dark:text-blue-400">
              Methodology
            </Link>
          </li>
          <li>
            <Link href="/contribute/" className="text-blue-700 hover:underline dark:text-blue-400">
              Add a resource
            </Link>
          </li>
        </ul>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            graph(
              itemListSchema(category, entries),
              breadcrumbSchema([
                { name: strings.site.name, path: "/" },
                { name: category.label, path: `/${category.slug}/` },
              ]),
            ),
          ),
        }}
      />
    </>
  );
}
