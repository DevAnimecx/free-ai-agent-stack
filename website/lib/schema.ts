import { BRAND, SITE_URL, abs } from "./site";
import type { AnyEntry, CategoryConfig } from "./types";

// JSON-LD builders (SEO-5, US-4.3). One place, so every page emits consistent
// structured data. Two rules hold throughout:
//
//  1. Every @id is an absolute URL built with abs(), so a move between the
//     Pages subpath and a custom domain cannot leave dangling references.
//  2. Nothing is asserted that the page does not also show a human. Structured
//     data that disagrees with the visible page is a manual-action risk, and
//     inventing an aggregateRating or a search endpoint this site does not have
//     would be exactly that.
//
// `@id` values are stable and cross-referenced (WebSite ↔ Person ↔ Dataset) so
// a crawler can resolve the whole graph from any single page.

const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;
const AUTHOR_ID = `${SITE_URL}/#author`;
const DATASET_ID = `${SITE_URL}/#dataset`;

/** The person credited on every page. */
export function personSchema() {
  return {
    "@type": "Person",
    "@id": AUTHOR_ID,
    name: BRAND.author,
    alternateName: BRAND.studio,
    url: BRAND.github,
    sameAs: [...BRAND.sameAs],
    knowsAbout: [
      "AI agents",
      "LLM APIs",
      "Model Context Protocol",
      "developer tooling",
      "free-tier infrastructure",
    ],
  };
}

/**
 * The publishing entity. Modelled as an Organization with a Person founder
 * rather than a Person alone: the byline is a person, but the catalogue is a
 * project with its own name, licence and repository, and answer engines resolve
 * "who publishes this" from the Organization.
 */
export function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: "free-ai-agent-stack",
    alternateName: `${BRAND.studio} — free-ai-agent-stack`,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: abs("/icon-512.png"),
      width: 512,
      height: 512,
    },
    description:
      "A verified, machine-readable catalogue of free LLM APIs, MCP servers, agent frameworks and free-tier infrastructure.",
    slogan: "Every free tier, checked by hand and by robot.",
    foundingDate: "2026",
    founder: { "@id": AUTHOR_ID },
    sameAs: [...BRAND.sameAs],
    license: "https://creativecommons.org/licenses/by/4.0/",
  };
}

/**
 * Site-level graph. `speakable` marks the summary paragraph voice assistants
 * may read aloud. Deliberately NO SearchAction: sitelinks searchbox requires a
 * real ?q= endpoint, and this site's search is client-side only — claiming
 * otherwise in structured data is the kind of thing that gets rich results
 * withdrawn sitewide.
 */
export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": SITE_ID,
    name: "free-ai-agent-stack",
    url: SITE_URL,
    description:
      "Every free LLM API, MCP server, agent framework and free-tier infrastructure service you need to build an AI agent in 2026 — with free limits, credit-card requirements and verification dates.",
    inLanguage: "en",
    publisher: { "@id": ORG_ID },
    author: { "@id": AUTHOR_ID },
    license: "https://creativecommons.org/licenses/by/4.0/",
    isAccessibleForFree: true,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "#answer-summary"],
    },
  };
}

/**
 * The catalogue itself, described as a Dataset so answer engines and dataset
 * search (Google Dataset Search, Hugging Face, Kaggle-adjacent tooling) can
 * ingest it directly instead of scraping the rendered page.
 */
export function datasetSchema(stats?: {
  total: number;
  generated_at?: string;
  counts?: Record<string, number>;
  total_no_card?: number;
}) {
  return {
    "@type": "Dataset",
    "@id": DATASET_ID,
    name: "free-ai-agent-stack dataset",
    alternateName: "Free AI agent stack — LLM APIs, MCP servers, agent tools and free tiers",
    description:
      "Free LLM APIs, MCP servers, agent tools and free-tier infrastructure with free limits, rate limits, credit-card requirements, status and verification dates. Every row records who verified it and when.",
    license: "https://creativecommons.org/licenses/by/4.0/",
    isAccessibleForFree: true,
    creator: { "@id": AUTHOR_ID },
    publisher: { "@id": ORG_ID },
    ...(stats?.generated_at ? { dateModified: stats.generated_at } : {}),
    datePublished: "2026-01-15",
    version: stats ? `${stats.total}` : undefined,
    keywords: [
      "free LLM API",
      "free AI API",
      "MCP servers",
      "Model Context Protocol",
      "AI agent frameworks",
      "free tier hosting",
      "agent skills",
      "no credit card AI",
    ],
    variableMeasured: [
      { "@type": "PropertyValue", name: "free limit", description: "The vendor's own phrasing of what is free" },
      { "@type": "PropertyValue", name: "requires_card", description: "Whether a credit card is required to start" },
      { "@type": "PropertyValue", name: "verified", description: "ISO date a human last confirmed the claim" },
      { "@type": "PropertyValue", name: "status", description: "active, degraded, broken or no-longer-free" },
    ],
    ...(stats
      ? {
          size: `${stats.total} entries`,
          // A ready-made citation string, so anything quoting this dataset has
          // an unambiguous way to attribute it.
          citation: `free-ai-agent-stack (2026). ${BRAND.byline}. ${SITE_URL}`,
        }
      : {}),
    distribution: [
      {
        "@type": "DataDownload",
        name: "Whole catalogue as JSON",
        encodingFormat: "application/json",
        contentUrl: abs("/data/all.json"),
      },
      {
        "@type": "DataDownload",
        name: "Index and counts",
        encodingFormat: "application/json",
        contentUrl: abs("/data/index.json"),
      },
      {
        "@type": "DataDownload",
        name: "llms.txt summary",
        encodingFormat: "text/plain",
        contentUrl: abs("/llms.txt"),
      },
      {
        "@type": "DataDownload",
        name: "llms-full.txt (complete catalogue text)",
        encodingFormat: "text/plain",
        contentUrl: abs("/llms-full.txt"),
      },
    ],
    includedInDataCatalog: {
      "@type": "DataCatalog",
      name: "free-ai-agent-stack",
      url: SITE_URL,
      description: "A hand-verified catalogue of free AI agent infrastructure.",
    },
  };
}

/**
 * A Dataset node for one category page.
 *
 * The home page publishes the catalogue as a single Dataset. Each category is a
 * real subset with its own JSON endpoint and its own anchor space, so marking it
 * as its own Dataset — linked back with `isPartOf` rather than duplicating the
 * whole description — lets the category page be understood as data in its own
 * right without competing with the parent as a separate entity.
 */
export function categoryDatasetSchema(category: { slug: string; label: string }, count: number) {
  return {
    "@type": "Dataset",
    "@id": `${SITE_URL}/#dataset-${category.slug}`,
    name: `${category.label} — free-ai-agent-stack`,
    description: `The ${category.label} section of the free-ai-agent-stack catalogue: ${count} entries with free limits, rate limits, credit-card requirements, status and the date each was last verified by a human.`,
    isAccessibleForFree: true,
    license: "https://creativecommons.org/licenses/by/4.0/",
    creator: { "@id": AUTHOR_ID },
    publisher: { "@id": ORG_ID },
    isPartOf: { "@id": DATASET_ID },
    size: `${count} entries`,
    citation: `free-ai-agent-stack (2026). ${BRAND.byline}. ${abs(`/${category.slug}/`)}`,
    distribution: [
      {
        "@type": "DataDownload",
        name: `${category.label} as JSON`,
        encodingFormat: "application/json",
        contentUrl: abs(`/data/${category.slug}.json`),
      },
      {
        "@type": "DataDownload",
        name: "Whole catalogue as JSON",
        encodingFormat: "application/json",
        contentUrl: abs("/data/all.json"),
      },
    ],
  };
}

export function breadcrumbSchema(trail: Array<{ name: string; path: string }>) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: abs(item.path),
    })),
  };
}

/**
 * FAQPage for the answer-first block at the foot of every category page and on
 * the home page. Answer Engine Optimization is mostly this: a real question as
 * the heading, a self-contained answer of 40–60 words immediately under it,
 * marked up so an engine can lift it whole.
 */
export function faqSchema(items: Array<{ q: string; a: string }>) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function itemListSchema(category: CategoryConfig, entries: AnyEntry[]) {
  return {
    "@type": "ItemList",
    "@id": `${SITE_URL}/${category.slug}/#list`,
    name: category.label,
    description: category.metaDescription,
    url: abs(`/${category.slug}/`),
    numberOfItems: entries.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    isPartOf: { "@id": SITE_ID },
    // 100 is the practical ceiling: beyond it the payload stops earning its
    // bytes, and Google truncates deep lists in rich results anyway.
    itemListElement: entries.slice(0, 100).map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      description: entry.description,
      url: `${SITE_URL}/${category.slug}/#${entry.id}`,
      item: {
        "@type": "WebPage",
        name: entry.name,
        url: entry.url,
        // The claim's freshness is the whole point of this dataset, so the
        // verification date belongs in the structured data.
        dateModified: entry.verified,
      },
    })),
  };
}

/** Assembles any combination of the above into one @graph document. */
export function graph(...nodes: unknown[]) {
  return { "@context": "https://schema.org", "@graph": nodes.filter(Boolean) };
}
