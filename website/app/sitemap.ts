import type { MetadataRoute } from "next";

import { CATEGORIES, getStats } from "@/lib/loadData";
import { strings } from "@/lib/strings";

// SEO-3: generated at build time, submitted to Google and Bing.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const stats = getStats();
  const lastModified = new Date(stats.generated_at);

  return [
    {
      url: `${strings.site.url}/`,
      lastModified,
      changeFrequency: "daily",
      priority: 1,
    },
    ...CATEGORIES.map((category) => ({
      url: `${strings.site.url}/${category.slug}/`,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    {
      url: `${strings.site.url}/about/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${strings.site.url}/contribute/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
