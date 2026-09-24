import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

// SEO-4 / AEO-4: allow everything, point at the sitemap, and name the AI
// crawlers explicitly. Being cited inside an agent's answer is the goal here, so
// every answer-engine user agent is listed by name rather than left to the
// wildcard — an explicit allow survives a provider tightening its default.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const allowed = [
    "GPTBot",          // OpenAI training/retrieval
    "OAI-SearchBot",   // ChatGPT Search index
    "ChatGPT-User",    // user-triggered fetches from ChatGPT
    "ClaudeBot",       // Anthropic crawl
    "Claude-User",     // user-triggered fetches from Claude
    "Claude-SearchBot",
    "PerplexityBot",
    "Perplexity-User",
    "Google-Extended", // Gemini / Vertex grounding
    "Applebot",
    "Applebot-Extended",
    "Amazonbot",
    "Bingbot",
    "DuckDuckBot",
    "CCBot",
    "meta-externalagent",
    "cohere-ai",
    "YouBot",
  ];

  return {
    rules: [
      ...allowed.map((userAgent) => ({ userAgent, allow: "/" })),
      { userAgent: "*", allow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
