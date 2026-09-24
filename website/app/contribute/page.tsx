import { strings } from "@/lib/strings";
import { BRAND, SITE_BASE_PATH } from "@/lib/site";

const withBase = (path: string) => `${SITE_BASE_PATH}${path}`;

export const metadata = {
  title: "Contribute — add a free AI resource in three steps",
  description:
    "How to add a free LLM API, MCP server or free-tier service to free-ai-agent-stack: a three-step flow, the inclusion criteria and exactly what CI checks.",
  alternates: { canonical: "/contribute/" },
  openGraph: {
    title: "Contribute — add a free AI resource in three steps",
    description:
      "Twelve lines of YAML. CI checks the schema, the duplicates and the link before a human reads it.",
    url: "/contribute/",
    images: [{ url: "/og/contribute.png", width: 1200, height: 630, alt: "Contribute" }],
  },
};

const ISSUE_ADD = `${strings.site.repo}/issues/new?template=add-resource.yml`;
const ISSUE_FIX = `${strings.site.repo}/issues/new?template=report-broken-link.yml`;

export default function ContributePage() {
  return (
    <>
      <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-50">
        {strings.contribute.h1}
      </h1>
      <p className="mt-2 max-w-prose text-[14px] leading-6 text-slate-600 dark:text-slate-400">
        {strings.contribute.lede}
      </p>

      {/* Contribution is asked of people who have just found the catalogue, so
          the maintainer is named here too: an anonymous ask for free labour
          converts badly and reads badly. */}
      <p className="mt-2 max-w-prose text-[13px] leading-6 text-slate-600 dark:text-slate-400">
        Maintained by{" "}
        <a
          href={BRAND.github}
          target="_blank"
          rel="noopener noreferrer author"
          className="font-medium text-slate-900 hover:underline dark:text-slate-100"
        >
          {BRAND.author}
        </a>{" "}
        at {BRAND.studio}. Corrections are as welcome as additions — a dead link
        reported is worth more than a resource nobody checks.
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href={ISSUE_ADD}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md bg-slate-900 px-3 py-2 text-[13px] font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
        >
          Submit a resource
        </a>
        <a
          href={ISSUE_FIX}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border border-slate-300 px-3 py-2 text-[13px] font-medium text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:text-slate-200"
        >
          Report an outdated limit
        </a>
        <a
          href={`${strings.site.repo}/blob/main/CONTRIBUTING.md`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border border-slate-300 px-3 py-2 text-[13px] font-medium text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:text-slate-200"
        >
          Read CONTRIBUTING.md
        </a>
      </div>

      <section className="mt-8">
        <h2 className="text-[15px] font-semibold text-slate-900 dark:text-slate-50">
          The three steps
        </h2>
        <ol className="mt-3 max-w-prose space-y-3 text-[13px] leading-6 text-slate-600 dark:text-slate-400">
          <li>
            <strong className="text-slate-900 dark:text-slate-100">1. Pick the right file.</strong>{" "}
            <code>data/llm-apis.yaml</code>, <code>data/mcp-servers.yaml</code>,{" "}
            <code>data/agent-tools.yaml</code> or <code>data/free-tiers.yaml</code>.
          </li>
          <li>
            <strong className="text-slate-900 dark:text-slate-100">2. Add about twelve lines.</strong>{" "}
            Copy an existing entry and change the fields. The three that matter most are{" "}
            <code>free_limit</code>, <code>requires_card</code> and <code>verified</code>.
          </li>
          <li>
            <strong className="text-slate-900 dark:text-slate-100">
              3. Run the validator, then open the PR.
            </strong>{" "}
            <code className="mt-1 block rounded bg-slate-100 px-2 py-1 font-mono text-[12px] dark:bg-slate-900">
              python3 scripts/validate.py
            </code>
          </li>
        </ol>
      </section>

      <section className="mt-8">
        <h2 className="text-[15px] font-semibold text-slate-900 dark:text-slate-50">
          What gets accepted
        </h2>
        <ul className="mt-3 max-w-prose space-y-2 text-[13px] leading-6 text-slate-600 dark:text-slate-400">
          <li>
            ✅ Usable without paying, and without contacting sales — a free tier, a no-card trial, or
            free open-source software you can self-host.
          </li>
          <li>✅ Relevant to building an agent: inference, tools, memory, hosting, observability.</li>
          <li>✅ Publicly accessible, with a published limit we can link to and cite.</li>
          <li>
            ❌ Paid products with a “free trial” that needs a card for less than $5 of value.
          </li>
          <li>❌ Free consumer chat apps with no API — an agent needs an API.</li>
          <li>❌ Crypto or token-gated services, affiliate links, and anything invite-only.</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-[15px] font-semibold text-slate-900 dark:text-slate-50">
          What CI checks before a human reads your PR
        </h2>
        <ul className="mt-3 max-w-prose space-y-1.5 text-[13px] leading-6 text-slate-600 dark:text-slate-400">
          <li>Schema validation against <code>schemas/*.schema.json</code></li>
          <li>Duplicate <code>id</code>, duplicate <code>url</code>, near-duplicate names</li>
          <li>HTTPS-only URLs, and no affiliate parameters</li>
          <li>
            <code>requires_card</code> stated explicitly — unknown means <code>true</code>
          </li>
          <li>
            <code>verified</code> not in the future, and not older than 30 days
          </li>
          <li>Link reachability for the URLs you touched</li>
          <li>A delete guard that refuses a change dropping a category below its floor</li>
        </ul>
      </section>

      <section className="mt-8 border-t border-slate-200 pt-4 dark:border-slate-800">
        <h2 className="text-[15px] font-semibold text-slate-900 dark:text-slate-50">
          Credit
        </h2>
        <p className="mt-2 max-w-prose text-[13px] leading-6 text-slate-600 dark:text-slate-400">
          Every entry records who verified it in <code>verified_by</code>, and that handle appears in
          the README's contributor wall. Your name stays attached to the claim you checked.
        </p>
      </section>
    </>
  );
}
