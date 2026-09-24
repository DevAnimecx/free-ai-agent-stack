import type { MetadataRoute } from "next";

import { CATEGORIES, getStats } from "@/lib/loadData";
import { SITE_URL } from "@/lib/site";

// SEO-3: generated at build time. Priorities reflect what this site is for —
// the category pages are the product, so they sit above the home page's 0.9
// rather than below it, and the machine-readable endpoints are listed so a
// crawler discovers them without needing the footer links.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const stats = getStats();
  const lastModified = new Date(stats.generated_at);

  const categories: MetadataRoute.Sitemap = CATEGORIES.map((category) => ({
    url: `${SITE_URL}/${category.slug}/`,
    lastModified,
    changeFrequency: "daily" as const,
    priority: 1,
  }));

  return [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...categories,
    {
      url: `${SITE_URL}/about/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/contribute/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/llms.txt`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/llms-full.txt`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.3,
    },
  ];
}
