import { CopyButton } from "./CopyButton";
import { VerifiedBadge } from "./VerifiedBadge";
import { strings } from "@/lib/strings";
import type { AgentToolEntry, AnyEntry, FreeTierEntry, LlmApiEntry, McpServerEntry, SkillEntry } from "@/lib/types";

const REPORT_BASE =
  "https://github.com/free-ai-agent-stack/free-ai-agent-stack/issues/new?template=report-broken-link.yml";

/** US-2.3 / FR-W-8: pre-fills the issue with this entry's ID, one click. */
function reportUrl(entry: AnyEntry, slug: string) {
  const params = new URLSearchParams({
    title: `[Fix] ${entry.name} (${entry.id})`,
    "entry_id": entry.id,
    "entry_url": entry.url,
    body: `Entry: \`${slug}#${entry.id}\`\n\nWhat is wrong:\n\n\nWhat it should say instead:\n\n\nWhere I checked:\n`,
  });
  return `${REPORT_BASE}&${params.toString()}`;
}

function notes(entry: AnyEntry): string[] {
  if (!entry.notes) return [];
  return Array.isArray(entry.notes) ? entry.notes : [entry.notes];
}

const statusStyles: Record<string, string> = {
  active: "text-slate-500 dark:text-slate-400",
  degraded: "text-amber-600 dark:text-amber-400",
  broken: "text-red-600 dark:text-red-400",
  deprecated: "text-red-600 dark:text-red-400",
};

export function ResourceCard({ entry, slug }: { entry: AnyEntry; slug: string }) {
  const isLlm = slug === "llm-apis";
  const isMcp = slug === "mcp-servers";
  const isTool = slug === "agent-tools";
  const isTier = slug === "free-tiers";
  const isSkill = slug === "skills";

  const llm = entry as LlmApiEntry;
  const mcp = entry as McpServerEntry;
  const tool = entry as AgentToolEntry;
  const tier = entry as FreeTierEntry;
  const skill = entry as SkillEntry;

  const meta: Array<[string, string]> = [];
  if (isLlm) {
    meta.push([strings.card.freeLimit, llm.free_limit]);
    if (llm.rate_limit) meta.push([strings.card.rateLimit, llm.rate_limit]);
    // Format context the way people read it, not as a raw division: 131072
    // should be "131K" (not "131.072K") and 1000000 should be "1M" (not
    // "1,000K"), which is what the naive /1000 + toLocaleString produced.
    if (llm.context_window) {
      const ctx = llm.context_window;
      const label =
        ctx >= 1_000_000
          ? `${(ctx / 1_000_000).toFixed(ctx % 1_000_000 === 0 ? 0 : 1)}M`
          : `${Math.round(ctx / 1000)}K`;
      meta.push(["Context", label]);
    }
  }
  if (isTool) meta.push([strings.card.freeLimit, tool.free_limit]);
  if (isTier) {
    meta.push([strings.card.freeLimit, tier.free_limit]);
    if (tier.cold_start_risk)
      meta.push([strings.card.coldStart, `${tier.cold_start_risk}`]);
  }
  if (isMcp) {
    if (mcp.tools_exposed) meta.push([`Tools`, `${mcp.tools_exposed}`]);
    if (typeof mcp.stars === "number" && mcp.stars > 0)
      meta.push([strings.card.stars, mcp.stars.toLocaleString()]);
  }
  if (isSkill) {
    // A skill says what it is about and which pack it came from; a pack says
    // how many skills it holds. Neither field means anything on the other, so
    // each is only read under the kind the entry declares.
    if (skill.kind === "skill") {
      if (skill.domain) meta.push(["Domain", skill.domain]);
      if (skill.parent) meta.push(["Part of", skill.parent]);
    }
    if (typeof skill.skill_count === "number" && skill.skill_count > 0)
      meta.push(["Skills", skill.skill_count.toLocaleString()]);
    if (typeof skill.stars === "number" && skill.stars > 0)
      meta.push([strings.card.stars, skill.stars.toLocaleString()]);
  }

  const flags: string[] = [];
  if (isLlm || isTool || isTier) {
    flags.push(
      (entry as { requires_card: boolean }).requires_card
        ? "💳 card required"
        : "✅ no credit card",
    );
  }
  if (isMcp) flags.push(mcp.requires_auth ? `🔑 ${mcp.auth_type ?? "auth required"}` : "✅ no auth");
  if (isMcp) flags.push(mcp.official ? "official" : "community");
  if (isLlm && llm.commercial_use === false) flags.push(strings.card.commercialNo);
  if (isLlm && llm.data_used_for_training === true) flags.push(strings.card.trainingOn);
  if (isLlm && llm.data_used_for_training === false) flags.push(strings.card.trainingOff);
  if (isTool && tool.open_source) flags.push("open source");
  if (isSkill) {
    flags.push(skill.kind === "pack" ? "pack" : "single skill");
    flags.push(skill.category.replace("-", " "));
    if (skill.compatible_with?.length) flags.push(skill.compatible_with.join(" · "));
  }

  const install = isMcp
    ? mcp.install
    : isTool
      ? tool.install
      : isSkill
        ? skill.install
        : undefined;

  return (
    <article
      id={entry.id}
      className="group scroll-mt-24 border-b border-slate-200 py-4 last:border-b-0 dark:border-slate-800"
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-[15px] font-semibold text-slate-900 dark:text-slate-50">
          <a
            href={`#${entry.id}`}
            className="hover:underline decoration-slate-300 dark:decoration-slate-600"
          >
            {entry.name}
          </a>
        </h3>
        <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">{entry.id}</span>
        {entry.status !== "active" && (
          <span className={`text-[11px] font-medium ${statusStyles[entry.status] ?? ""}`}>
            {strings.status[entry.status as keyof typeof strings.status] ?? entry.status}
          </span>
        )}
        <span className="ml-auto flex items-center gap-2">
          <VerifiedBadge date={entry.verified} />
        </span>
      </div>

      {entry.status === "deprecated" && (
        <p className="mt-1 text-[12px] text-red-600 dark:text-red-400">
          {strings.card.deprecatedNote}
        </p>
      )}

      <p className="mt-1.5 max-w-prose text-[13px] leading-5 text-slate-600 dark:text-slate-300">
        {entry.description}
      </p>

      {meta.length > 0 && (
        <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
          {meta.map(([k, v]) => (
            <div key={k} className="flex items-baseline gap-1.5">
              <dt className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
                {k}
              </dt>
              <dd className="font-mono text-[12px] text-slate-700 dark:text-slate-200">{v}</dd>
            </div>
          ))}
        </dl>
      )}

      {install && (
        <div className="mt-2 flex items-center gap-2 overflow-hidden rounded border border-slate-200 bg-slate-50 px-2 py-1.5 dark:border-slate-800 dark:bg-slate-900/60">
          <code className="min-w-0 flex-1 truncate font-mono text-[12px] text-slate-700 dark:text-slate-200">
            {install}
          </code>
          <CopyButton text={install} />
        </div>
      )}

      {flags.length > 0 && (
        <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
          {flags.map((f) => (
            <span key={f}>{f}</span>
          ))}
        </p>
      )}

      {notes(entry).map((note) => (
        <p
          key={note}
          className="mt-2 border-l-2 border-slate-200 pl-2 text-[12px] leading-5 text-slate-500 dark:border-slate-700 dark:text-slate-400"
        >
          {note}
        </p>
      ))}

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]">
        <a
          href={entry.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-blue-700 hover:underline dark:text-blue-400"
        >
          {entry.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
          <span className="sr-only"> ({strings.a11y.outbound})</span>
          <span aria-hidden="true"> ↗</span>
        </a>
        {entry.docs_url && (
          <a
            href={entry.docs_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:underline dark:text-slate-400"
          >
            docs<span className="sr-only"> ({strings.a11y.outbound})</span>
          </a>
        )}
        <a
          href={reportUrl(entry, slug)}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-slate-400 hover:text-slate-700 hover:underline dark:text-slate-500 dark:hover:text-slate-200"
        >
          {strings.card.report}
        </a>
      </div>
    </article>
  );
}
