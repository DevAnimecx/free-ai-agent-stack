"use client";

import { strings } from "@/lib/strings";

export type FilterKey =
  | "no-card"
  | "open-source"
  | "official"
  | "no-auth"
  | "active"
  | "commercial";

export interface FilterState {
  [key: string]: boolean;
}

/**
 * <FilterPanel filters={filters} onChange={setFilters} available={[...]} />
 * FR-W-4: checkbox groups, keyboard-operable, no JS-only rendering of the
 * entries themselves (filtering hides cards, it does not fetch them).
 */
export function FilterPanel({
  filters,
  onChange,
  available,
}: {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  available: FilterKey[];
}) {
  const labels: Record<FilterKey, string> = {
    "no-card": strings.explorer.noCard,
    "open-source": strings.explorer.openSource,
    official: strings.explorer.official,
    "no-auth": strings.explorer.noAuth,
    active: strings.explorer.active,
    commercial: strings.card.commercialNo,
  };

  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <fieldset className="flex flex-wrap items-center gap-1.5">
      <legend className="sr-only">{strings.a11y.filterLabel}</legend>
      {available.map((key) => {
        const checked = Boolean(filters[key]);
        return (
          <label
            key={key}
            className={`cursor-pointer select-none rounded-full border px-2.5 py-1 text-[12px] transition ${
              checked
                ? "border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900"
                : "border-slate-300 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500"
            }`}
          >
            <input
              type="checkbox"
              className="sr-only"
              checked={checked}
              onChange={(event) => onChange({ ...filters, [key]: event.target.checked })}
            />
            {labels[key]}
          </label>
        );
      })}
      {activeCount > 0 && (
        <button
          type="button"
          onClick={() => onChange({})}
          className="rounded-full px-2.5 py-1 text-[12px] text-slate-500 underline decoration-dotted hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
        >
          {strings.explorer.clear}
        </button>
      )}
    </fieldset>
  );
}
