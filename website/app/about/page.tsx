import Link from "next/link";

import { FaqSection } from "@/components/FaqSection";
import { CATEGORIES, getStats } from "@/lib/loadData";
import { ID, breadcrumbSchema, graph, personSchema, webPageSchema } from "@/lib/schema";
import { BRAND, SITE_BASE_PATH, SITE_URL } from "@/lib/site";
import { strings } from "@/lib/strings";

const withBase = (path: string) => `${SITE_BASE_PATH}${path}`;

const PAGE_TITLE = "Methodology — how every free tier here is verified";
const PAGE_DESCRIPTION =
  "What counts as free, how each entry is verified by a human, which parts of a listing automation may change, how to cite the dataset, and its known limitations.";

export const metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/about/" },
  openGraph: {
    title: "Methodology — how every free tier here is verified",
    description:
      "What counts as free, who verified each claim, what automation may change, and how to cite this dataset.",
    url: "/about/",
    images: [{ url: "/og/about.png", width: 1200, height: 630, alt: "Methodology" }],
  },
};

const ABOUT_FAQ = [
  {
    q: "Can I reuse this dataset in my own project?",
    a: "Yes. The data is licensed CC BY 4.0 and the code MIT, so you may republish and adapt it, including commercially, provided you attribute it. The full catalogue is published as JSON, llms.txt and llms-full.txt, so you can consume it directly rather than scraping the rendered pages.",
  },
  {
    q: "What does “free” mean in this catalogue?",
    a: "Free to start without a credit card, on a tier the vendor documents publicly, with a citable limit. Card-gated credit grants of $100 or more are listed separately as trials, and a tier that quietly stopped being free stays in the data flagged rather than deleted, so the record shows where claims failed.",
  },
  {
    q: "How is each entry verified?",
    a: "A human opens the vendor's own pricing or documentation page and records the free limit in the vendor's units, whether a card is required, and the date. A robot then re-checks every URL daily and flags dead links after three consecutive failures. Entries unverified for 30 days return to the triage queue.",
  },
  {
    q: "Who maintains free-ai-agent-stack?",
    a: `Built and maintained by ${BRAND.byline}. Every entry records the handle of whoever verified it, the dataset is versioned in public on GitHub, and the project takes corrections through issues and pull requests.`,
  },
];

export default function AboutPage() {
  const stats = getStats();

  return (
    <>
      <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-50">
        {strings.about.h1}
      </h1>
      <p className="mt-2 max-w-prose text-[14px] leading-6 text-slate-600 dark:text-slate-400">
        {strings.about.lede}
      </p>

      <section className="mt-6 prose-intro">
        <h2 className="text-[15px] font-semibold text-slate-900 dark:text-slate-50">
          The five facts, in priority order
        </h2>
        <ol className="mt-2 max-w-prose list-decimal space-y-1.5 pl-4 text-[13px] leading-6 text-slate-600 dark:text-slate-400">
          <li>
            <strong>Credit card</strong> — a wrong “no card required” costs you a signup and a card
            detail. When a page does not say, the value is <code>true</code>.
          </li>
          <li>
            <strong>Free limit</strong> — recorded in the vendor's own units, never converted into a
            comparable-looking number that will be wrong next quarter.
          </li>
          <li>
            <strong>Status</strong> — whether it still works today. Dead links are found by a robot;
            “no longer free” is a human judgement.
          </li>
          <li>
            <strong>Commercial use</strong> — a licence violation hurts more than a wasted signup.
          </li>
          <li>
            <strong>Training on your prompts</strong> — increasingly the deciding factor, and almost
            never mentioned in competing lists.
          </li>
        </ol>
      </section>

      <section className="mt-6 prose-intro">
        <h2 className="text-[15px] font-semibold text-slate-900 dark:text-slate-50">
          What a robot is allowed to change
        </h2>
        <p>
          Automation does three things and nothing else: it HEAD-requests every URL once a day, it
          refreshes GitHub star counts weekly, and it rewrites the stats block in the README. It may
          flip <code>status</code> between <code>active</code> and <code>broken</code>. It may never
          touch <code>free_limit</code>, <code>requires_card</code>, <code>verified</code> or{" "}
          <code>verified_by</code> — those four fields are human-only by design, because a robot
          cannot read a pricing page.
        </p>
      </section>

      <section className="mt-6 prose-intro">
        <h2 className="text-[15px] font-semibold text-slate-900 dark:text-slate-50">
          Why providers that are no longer free are still listed
        </h2>
        <p>
          {stats.deprecated_entries.length} entries carry <code>status: deprecated</code>. Each one
          documents a provider that is still widely described as free elsewhere, names the
          replacement, and saves a reader the signup. Deleting them would make the catalogue look
          cleaner and be less useful.
        </p>
      </section>

      <section className="mt-6 prose-intro">
        <h2 className="text-[15px] font-semibold text-slate-900 dark:text-slate-50">
          Known limitations
        </h2>
        <p>
          Free tiers differ by region and we record notable restrictions in <code>notes</code>{" "}
          rather than pretending otherwise. Some rosters rotate monthly (OpenRouter's free models,
          SiliconFlow's free tier). We do not benchmark models or measure latency — a link being
          alive is not a quality claim. And we can only record published limits, not the
          undocumented soft limits that real workloads run into.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-[15px] font-semibold text-slate-900 dark:text-slate-50">
          Current state of the dataset
        </h2>
        <dl className="mt-2 grid max-w-prose grid-cols-2 gap-y-2 text-[13px] sm:grid-cols-3">
          {CATEGORIES.map((category) => (
            <div key={category.slug}>
              <dt className="text-slate-500 dark:text-slate-400">{category.label}</dt>
              <dd className="font-mono text-slate-900 dark:text-slate-100">
                {stats.counts[category.slug] ?? 0}
              </dd>
            </div>
          ))}
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Verified &lt;30d</dt>
            <dd className="font-mono text-slate-900 dark:text-slate-100">
              {stats.freshness_pct_30d}%
            </dd>
          </div>
          <div>
            <dt className="text-slate-500 dark:text-slate-400">No credit card</dt>
            <dd className="font-mono text-slate-900 dark:text-slate-100">{stats.total_no_card}</dd>
          </div>
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Contributors</dt>
            <dd className="font-mono text-slate-900 dark:text-slate-100">
              {Object.keys(stats.contributors).length}
            </dd>
          </div>
        </dl>
      </section>

      {/* E-E-A-T: who maintains this, stated on the page a sceptical reader
          lands on. Answer engines and reviewers both look for a named party
          with a traceable identity behind a claim-making dataset. */}
      <section className="mt-6 prose-intro">
        <h2 className="text-[15px] font-semibold text-slate-900 dark:text-slate-50">
          {strings.about.authorHeading}
        </h2>
        <p>{strings.about.authorBody}</p>
        <p className="font-mono text-[12px]">
          <a
            href={BRAND.github}
            target="_blank"
            rel="noopener noreferrer author"
            className="text-blue-700 hover:underline dark:text-blue-400"
          >
            github.com/DevAnimecx
          </a>{" "}
          ·{" "}
          <a
            href={BRAND.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700 hover:underline dark:text-blue-400"
          >
            source
          </a>
        </p>
      </section>

      <section className="mt-6 prose-intro">
        <h2 className="text-[15px] font-semibold text-slate-900 dark:text-slate-50">
          {strings.about.citeHeading}
        </h2>
        <p>{strings.about.citeBody}</p>
        <pre className="mt-2 overflow-x-auto rounded border border-slate-200 bg-slate-50 p-3 font-mono text-[12px] leading-5 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
{`free-ai-agent-stack (2026). ${BRAND.byline}.
${strings.site.url}
Data licensed CC BY 4.0.`}
        </pre>
        <p className="mt-2 font-mono text-[12px]">
          <a href={withBase("/data/all.json")} className="text-blue-700 hover:underline dark:text-blue-400">
            /data/all.json
          </a>{" "}
          ·{" "}
          <a href={withBase("/llms.txt")} className="text-blue-700 hover:underline dark:text-blue-400">
            /llms.txt
          </a>{" "}
          ·{" "}
          <a href={withBase("/llms-full.txt")} className="text-blue-700 hover:underline dark:text-blue-400">
            /llms-full.txt
          </a>{" "}
          ·{" "}
          <a href={withBase("/feed.xml")} className="text-blue-700 hover:underline dark:text-blue-400">
            /feed.xml
          </a>
        </p>
      </section>

      <section className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-800">
        <p className="max-w-prose text-[13px] leading-6 text-slate-600 dark:text-slate-400">
          The long form lives in the repository:{" "}
          <a
            href={`${strings.site.repo}/blob/main/docs/METHODOLOGY.md`}
            className="text-blue-700 hover:underline dark:text-blue-400"
          >
            docs/METHODOLOGY.md
          </a>
          ,{" "}
          <a
            href={`${strings.site.repo}/blob/main/docs/GOVERNANCE.md`}
            className="text-blue-700 hover:underline dark:text-blue-400"
          >
            GOVERNANCE.md
          </a>{" "}
          and{" "}
          <Link href="/contribute/" className="text-blue-700 hover:underline dark:text-blue-400">
            the contribution guide
          </Link>
          .
        </p>
      </section>

      <FaqSection items={ABOUT_FAQ} heading="Questions about the method" path="/about/" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            graph(
              personSchema(),
              breadcrumbSchema([
                { name: strings.site.name, path: "/" },
                { name: strings.about.h1, path: "/about/" },
              ]),
              webPageSchema({
                path: "/about/",
                name: strings.about.h1,
                description: PAGE_DESCRIPTION,
                type: "AboutPage",
                dateModified: stats.generated_at,
                primaryImage: "/og/about.png",
                // This page is about its author, so the author is the subject.
                mainEntity: { "@id": ID.author },
                breadcrumb: { "@id": `${SITE_URL}/about/#breadcrumb` },
              }),
            ),
          ),
        }}
      />
    </>
  );
}
