import type { AnyEntry, CategoryConfig } from "./types";

// JSON-LD builders (SEO-5, US-4.3). Kept in one place so every page emits the
// same shapes and a crawler gets consistent structured data.
const SITE = "https://freeaiagentstack.dev";

export function itemListSchema(
  category: CategoryConfig,
  entries: AnyEntry[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: category.label,
    description: category.metaDescription,
    url: `${SITE}/${category.slug}`,
    numberOfItems: entries.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: entries.slice(0, 100).map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      description: entry.description,
      url: `${SITE}/${category.slug}#${entry.id}`,
      item: {
        "@type": "WebPage",
        name: entry.name,
        url: entry.url,
        // `dateModified` carries the verification date: the claim's freshness is
        // the whole point of this dataset, so it belongs in the structured data.
        dateModified: entry.verified,
      },
    })),
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "free-ai-agent-stack",
    url: SITE,
    logo: `${SITE}/badge.svg`,
    description:
      "A verified, machine-readable catalogue of free LLM APIs, MCP servers, agent frameworks and free-tier infrastructure.",
    sameAs: ["https://github.com/free-ai-agent-stack/free-ai-agent-stack"],
    license: "https://creativecommons.org/licenses/by/4.0/",
  };
}

export function datasetSchema(stats?: { total: number; generated_at?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "free-ai-agent-stack dataset",
    description:
      "Free LLM APIs, MCP servers, agent tools and free-tier infrastructure with free limits, credit-card requirements and verification dates.",
    license: "https://creativecommons.org/licenses/by/4.0/",
    isAccessibleForFree: true,
    creator: { "@type": "Organization", name: "free-ai-agent-stack", url: SITE },
    distribution: [
      { "@type": "DataDownload", encodingFormat: "application/json", contentUrl: `${SITE}/data/all.json` },
      { "@type": "DataDownload", encodingFormat: "text/plain", contentUrl: `${SITE}/llms.txt` },
    ],
    ...(stats ? { size: `${stats.total} entries` } : {}),
  };
}
