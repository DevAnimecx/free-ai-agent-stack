import Link from "next/link";

import { CATEGORIES, getStats } from "@/lib/loadData";
import { strings } from "@/lib/strings";

export const metadata = {
  title: "Methodology — how every free tier here is verified",
  description:
    "What counts as free, how each entry is verified by a human, which parts of a listing automation may change, and the known limitations of this dataset.",
  alternates: { canonical: "/about/" },
};

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
    </>
  );
}
