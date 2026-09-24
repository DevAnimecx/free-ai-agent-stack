"use client";

import Fuse from "fuse.js";
import { useEffect, useMemo, useState } from "react";

import { FilterPanel, type FilterKey, type FilterState } from "./FilterPanel";
import { ResourceCard } from "./ResourceCard";
import { SearchBar } from "./SearchBar";
import { strings } from "@/lib/strings";
import type { AgentToolEntry, AnyEntry, FreeTierEntry, LlmApiEntry, McpServerEntry } from "@/lib/types";

/** Only LLM API entries carry a normalised token budget. */
function tokenBudget(entry: AnyEntry): number {
  return (entry as LlmApiEntry).free_limit_tokens_per_day ?? -1;
}

const FILTERS_BY_CATEGORY: Record<string, FilterKey[]> = {
  "llm-apis": ["no-card", "active", "commercial"],
  "mcp-servers": ["official", "no-auth", "active"],
  "agent-tools": ["no-card", "open-source", "active"],
  "free-tiers": ["no-card", "active"],
};

type SortMode = "az" | "verified" | "free-limit" | "stars";

/**
 * The one interactive island on a category page. Everything is still rendered
 * to static HTML at build time (FR-W-11): with JavaScript disabled you get the
 * complete, alphabetised list and lose only the search box.
 */
export function CategoryExplorer({
  entries,
  slug,
}: {
  entries: AnyEntry[];
  slug: string;
}) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [filters, setFilters] = useState<FilterState>({});
  const [sort, setSort] = useState<SortMode>(slug === "mcp-servers" ? "stars" : "az");

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(query.trim()), 150);
    return () => window.clearTimeout(id);
  }, [query]);

  const fuse = useMemo(
    () =>
      new Fuse(entries, {
        keys: [
          { name: "name", weight: 3 },
          { name: "id", weight: 2 },
          { name: "tags", weight: 2 },
          { name: "description", weight: 1 },
          { name: "free_limit", weight: 1 },
          { name: "provider", weight: 1 },
          { name: "maintainer", weight: 1 },
        ],
        threshold: 0.35,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
    [entries],
  );

  const filtered = useMemo(() => {
    let rows: AnyEntry[] = debounced ? fuse.search(debounced).map((hit) => hit.item) : entries;

    const active = Object.entries(filters).filter(([, on]) => on).map(([key]) => key as FilterKey);
    if (active.length) {
      rows = rows.filter((entry) => {
        const asLlm = entry as LlmApiEntry;
        const asMcp = entry as McpServerEntry;
        const asTool = entry as AgentToolEntry;
        const asTier = entry as FreeTierEntry;
        return active.every((key) => {
          switch (key) {
            case "no-card":
              return (asLlm.requires_card ?? asTool.requires_card ?? asTier.requires_card) === false;
            case "open-source":
              return asTool.open_source === true;
            case "official":
              return asMcp.official === true;
            case "no-auth":
              return asMcp.requires_auth === false;
            case "active":
              return entry.status === "active";
            case "commercial":
              return asLlm.commercial_use !== false;
            default:
              return true;
          }
        });
      });
    }

    const sorted = [...rows];
    switch (sort) {
      case "verified":
        sorted.sort((a, b) => (a.verified < b.verified ? 1 : -1));
        break;
      case "stars":
        sorted.sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0));
        break;
      case "free-limit":
        sorted.sort((a, b) => {
          const av = tokenBudget(a);
          const bv = tokenBudget(b);
          return bv - av || a.name.localeCompare(b.name);
        });
        break;
      default:
        sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    return sorted;
  }, [debounced, entries, filters, fuse, sort]);

  const visible = filtered;
  const isFiltering = Boolean(debounced) || Object.values(filters).some(Boolean);

  return (
    <div>
      <div className="sticky top-0 z-10 -mx-4 mb-1 space-y-2 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="sm:flex-1">
            <SearchBar
              value={query}
              onQuery={setQuery}
              placeholder={strings.explorer.searchPlaceholder}
              resultCount={filtered.length}
            />
          </div>
          <div className="flex items-center gap-2">
            <label
              htmlFor="sort"
              className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500"
            >
              {strings.explorer.sort}
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(event) => setSort(event.target.value as SortMode)}
              className="rounded border border-slate-300 bg-white px-1.5 py-1 text-[12px] text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="az">{strings.explorer.sortAlphabetical}</option>
              <option value="verified">{strings.explorer.sortVerified}</option>
              <option value="stars">{strings.explorer.sortStars}</option>
              {slug !== "mcp-servers" && slug !== "free-tiers" && slug !== "agent-tools" && (
                <option value="free-limit">{strings.explorer.sortFreeLimit}</option>
              )}
            </select>
          </div>
        </div>
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          available={FILTERS_BY_CATEGORY[slug] ?? ["active"]}
        />
      </div>

      <p className="py-2 text-[12px] text-slate-500 dark:text-slate-400" aria-live="polite">
        {strings.explorer.results} {visible.length} {strings.explorer.of} {filtered.length}
        {isFiltering && filtered.length !== entries.length ? ` (${entries.length} total)` : ""}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded border border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
          <p className="text-[13px] font-medium text-slate-700 dark:text-slate-200">
            {strings.explorer.none}
          </p>
          <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">
            {strings.explorer.noneHint}
          </p>
        </div>
      ) : (
        <div>
          {visible.map((entry) => (
            <ResourceCard key={`${slug}-${entry.id}`} entry={entry} slug={slug} />
          ))}
        </div>
      )}

    </div>
  );
}
