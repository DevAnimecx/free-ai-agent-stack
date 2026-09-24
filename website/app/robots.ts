import type { MetadataRoute } from "next";

import { strings } from "@/lib/strings";

// SEO-4: allow everything, point at the sitemap. AI crawlers are explicitly
// welcome — being cited by an agent is a goal, not a threat (US-4.1).
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
    ],
    sitemap: `${strings.site.url}/sitemap.xml`,
    host: strings.site.url,
  };
}
