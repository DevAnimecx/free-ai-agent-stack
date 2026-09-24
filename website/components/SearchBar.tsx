"use client";

import { strings } from "@/lib/strings";

/**
 * <SearchBar onQuery={setQuery} placeholder="…" resultCount={12} />
 * Debouncing happens in the consumer (CategoryExplorer) so the input stays
 * responsive while Fuse.js works (FR-W-4, US-1.4: results in <100ms).
 */
export function SearchBar({
  value,
  onQuery,
  placeholder,
  resultCount,
}: {
  value: string;
  onQuery: (next: string) => void;
  placeholder?: string;
  resultCount?: number;
}) {
  return (
    <div className="relative">
      <label htmlFor="site-search" className="sr-only">
        {strings.a11y.searchLabel}
      </label>
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-slate-400"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle cx="9" cy="9" r="6" />
        <path d="M13.5 13.5 17 17" strokeLinecap="round" />
      </svg>
      <input
        id="site-search"
        type="search"
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={(event) => onQuery(event.target.value)}
        placeholder={placeholder ?? strings.explorer.searchPlaceholder}
        className="w-full rounded-md border border-slate-300 bg-white py-2 pl-8 pr-24 text-[13px] text-slate-800 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500"
      />
      {typeof resultCount === "number" && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-2.5 top-2.5 font-mono text-[11px] text-slate-400"
        >
          {resultCount} {strings.explorer.results}
        </span>
      )}
    </div>
  );
}
