import { daysSince, freshness } from "@/lib/freshness";
import { strings } from "@/lib/strings";

/**
 * <VerifiedBadge date="2026-09-24" />
 *
 * PRD §10.4 principle 2: trust is visible. Green <7d, amber <30d, red >30d.
 * Rendered as text, not colour alone, so it survives a screen reader and a
 * grayscale printout.
 */
export function VerifiedBadge({ date, compact = false }: { date: string; compact?: boolean }) {
  const state = freshness(date);
  const days = daysSince(date);

  const styles: Record<typeof state, string> = {
    fresh: "text-trust-fresh border-trust-fresh/30 bg-trust-fresh/5",
    aging: "text-trust-aging border-trust-aging/30 bg-trust-aging/5",
    stale: "text-trust-stale border-trust-stale/30 bg-trust-stale/5",
  };

  const label =
    days === 0
      ? `${strings.card.verifiedPrefix} ${strings.verified.today}`
      : compact
        ? `${days}d`
        : `${strings.card.verifiedPrefix} ${days} ${strings.verified.days}`;

  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium ${styles[state]}`}
      title={`${strings.card.verifiedPrefix} ${date} (${days} ${strings.verified.days}) — ${strings.verified[state]}`}
    >
      <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
      <time dateTime={date}>{label}</time>
    </span>
  );
}
