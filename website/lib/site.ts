// Single source of truth for where this site lives and who makes it.
//
// The site moved from a placeholder domain (freeaiagentstack.dev) to a real
// host, so every absolute URL in the build — canonicals, Open Graph, JSON-LD,
// sitemap, RSS, llms.txt — is derived from ONE value. Changing host is then a
// single environment variable rather than a search-and-replace across nine
// files, which is exactly the kind of edit that leaves a stale canonical
// behind and quietly splits a site's SEO across two domains.
//
//   NEXT_PUBLIC_SITE_URL   default: the GitHub Pages project URL
//   BASE_PATH              default: derived from SITE_URL's path, or "" for a
//                          custom domain at the root. Overriding it without
//                          also changing SITE_URL will produce links that build
//                          but 404, so they are derived from each other on
//                          purpose.

const DEFAULT_SITE_URL = "https://devanimecx.github.io/free-ai-agent-stack";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, "");

const parsed = new URL(SITE_URL);
export const SITE_ORIGIN = parsed.origin;

/** "" for a root domain, "/free-ai-agent-stack" for a Pages project site. */
export const SITE_BASE_PATH =
  process.env.BASE_PATH !== undefined
    ? process.env.BASE_PATH.replace(/\/+$/, "")
    : parsed.pathname.replace(/\/+$/, "");

/** Absolute URL for a site-relative path. Handles the subpath exactly once. */
export function abs(path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${clean === "/" ? "/" : clean}`;
}

/** True when the build is being served from a project page (a subpath). */
export const IS_PROJECT_PAGE = SITE_BASE_PATH !== "";

/**
 * Attribution. Kept as data rather than copy so the header, footer, structured
 * data, Open Graph images and README all name the same person, spelled the
 * same way — a name that disagrees with itself across a site is worse than no
 * name at all, for both trust and entity recognition by answer engines.
 */
export const BRAND = {
  author: "Adarsh Kushwah",
  studio: "Dev Animecx",
  /** "Adarsh Kushwah (Dev Animecx)" — the canonical attribution string. */
  byline: "Adarsh Kushwah (Dev Animecx)",
  github: "https://github.com/DevAnimecx",
  repo: "https://github.com/DevAnimecx/free-ai-agent-stack",
  /** schema.org sameAs targets. Only profiles that verifiably exist. */
  sameAs: ["https://github.com/DevAnimecx", "https://github.com/DevAnimecx/free-ai-agent-stack"],
} as const;
