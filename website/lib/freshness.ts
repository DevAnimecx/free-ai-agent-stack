// Pure helpers with no fs/node imports, so client components can use them
// without dragging the data loader into the browser bundle.

export function daysSince(iso: string): number {
  const then = Date.parse(`${iso}T00:00:00Z`);
  if (Number.isNaN(then)) return 9999;
  return Math.max(0, Math.floor((Date.now() - then) / 86_400_000));
}

export function freshness(iso: string): "fresh" | "aging" | "stale" {
  const days = daysSince(iso);
  if (days <= 7) return "fresh";
  if (days <= 30) return "aging";
  return "stale";
}
