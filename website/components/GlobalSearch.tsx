"use client";

import Fuse from "fuse.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { strings } from "@/lib/strings";

interface IndexEntry {
  id: string;
  name: string;
  description: string;
  url: string;
  verified: string;
  tags?: string[];
  free_limit?: string;
  install?: string;
  _category: string;
}

/**
 * Home-page search across every category (FR-W-3).
 *
 * The index is fetched from /data/all.json on first interaction rather than
 * serialised into the page: shipping 235 entries as props would blow the
 * 150KB JS budget, and the list itself is already in the HTML without it.
 */
export function GlobalSearch() {
  const [entries, setEntries] = useState<IndexEntry[] | null>(null);
  const [query, setQuery] = useState("");
  const loading = useRef(false);

  const load = useCallback(async () => {
    if (entries || loading.current) return;
    loading.current = true;
    try {
      const response = await fetch("/data/all.json");
      const payload = (await response.json()) as Record<string, unknown>;
      const flat: IndexEntry[] = [];
      for (const [key, value] of Object.entries(payload)) {
        if (!Array.isArray(value)) continue;
        for (const row of value as Array<Record<string, unknown>>) {
          flat.push({ ...(row as unknown as IndexEntry), _category: key });
        }
      }
      setEntries(flat);
    } catch {
      setEntries([]);
    }
  }, [entries]);

  useEffect(() => {
    void load();
  }, [load]);

  const fuse = useMemo(
    () =>
      entries
        ? new Fuse(entries, {
            keys: [
              { name: "name", weight: 3 },
              { name: "tags", weight: 2 },
              { name: "description", weight: 1 },
              { name: "free_limit", weight: 1 },
            ],
            threshold: 0.35,
            ignoreLocation: true,
            minMatchCharLength: 2,
          })
        : null,
    [entries],
  );

  const results = useMemo(() => {
    if (!fuse || query.trim().length < 2) return [];
    return fuse.search(query.trim()).slice(0, 8);
  }, [fuse, query]);

  return (
    <div>
      <label htmlFor="global-search" className="sr-only">
        {strings.a11y.searchLabel}
      </label>
      <input
        id="global-search"
        type="search"
        autoComplete="off"
        value={query}
        onFocus={() => void load()}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={strings.home.searchPlaceholder.replace("235", String(entries?.length ?? 235))}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-[14px] text-slate-800 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      />
      {query.trim().length >= 2 && (
        <ul className="mt-2 divide-y divide-slate-100 rounded-md border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
          {results.length === 0 && (
            <li className="px-3 py-2 text-[13px] text-slate-500 dark:text-slate-400">
              Nothing matches “{query}”. Search the category pages for a fuzzy match, or browse a
              category below.
            </li>
          )}
          {results.map(({ item }) => (
            <li key={`${item._category}-${item.id}`}>
              <a
                href={`/${item._category}/#${item.id}`}
                className="flex items-baseline gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-900/60"
              >
                <span className="text-[13px] font-medium text-slate-800 dark:text-slate-100">
                  {item.name}
                </span>
                <span className="min-w-0 flex-1 truncate text-[12px] text-slate-500 dark:text-slate-400">
                  {item.description}
                </span>
                <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                  {item._category}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
