import { strings } from "@/lib/strings";
import type { Stats } from "@/lib/types";

/** <StatsBanner stats={stats} /> — FR-W-1: total count + last updated on screen. */
export function StatsBanner({ stats, compact = false }: { stats: Stats; compact?: boolean }) {
  const items: Array<[string, string]> = [
    [stats.total.toString(), strings.home.statsTotal],
    [stats.total_no_card.toString(), strings.home.statsNoCard],
    [`${stats.freshness_pct_30d}%`, strings.home.statsFresh],
  ];

  return (
    <dl
      className={`flex flex-wrap gap-x-8 gap-y-2 ${compact ? "" : "border-y border-slate-200 py-3 dark:border-slate-800"}`}
    >
      {items.map(([value, label]) => (
        <div key={label} className="flex items-baseline gap-2">
          <dt className="sr-only">{label}</dt>
          <dd className="font-mono text-[15px] font-semibold tabular-nums text-slate-900 dark:text-slate-100">
            {value}
          </dd>
          <span className="text-[12px] text-slate-500 dark:text-slate-400">{label}</span>
        </div>
      ))}
    </dl>
  );
}
