import type { Metadata, Viewport } from "next";
import Link from "next/link";

import { CategoryNav } from "@/components/CategoryNav";
import { CATEGORIES, getStats } from "@/lib/loadData";
import { graph, organizationSchema, personSchema, websiteSchema } from "@/lib/schema";
import { BRAND, SITE_BASE_PATH, SITE_URL, abs } from "@/lib/site";
import { strings } from "@/lib/strings";
import "./globals.css";

// Next serves public/ files from the base path, but a root-relative href in
// markup is emitted verbatim — so on a GitHub Pages project site every icon and
// feed link would 404 without the prefix. One helper, used everywhere.
const withBase = (path: string) => `${SITE_BASE_PATH}${path}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${strings.site.name} — ${strings.site.tagline}`,
    template: `%s · ${strings.site.name}`,
  },
  description: strings.site.description,
  applicationName: strings.site.name,
  // Ordered by search intent rather than by our own vocabulary: the head terms
  // people actually type ("free llm api", "mcp servers") come first.
  keywords: [
    "free llm api",
    "free ai api 2026",
    "mcp servers list",
    "free mcp servers",
    "free ai agent tools",
    "ai agent frameworks",
    "free tier hosting",
    "free tier database",
    "agent skills",
    "no credit card ai api",
    "open source ai coding agent",
    "free gpu for ai",
  ],
  authors: [{ name: BRAND.author, url: BRAND.github }],
  creator: BRAND.author,
  publisher: BRAND.studio,
  category: "technology",
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": [
        { url: "/feed.xml", title: `${strings.site.name} — recently verified` },
      ],
      "application/json": [{ url: "/data/all.json", title: "Whole catalogue as JSON" }],
      "text/plain": [{ url: "/llms.txt", title: "llms.txt summary" }],
    },
  },
  openGraph: {
    type: "website",
    siteName: strings.site.name,
    locale: "en",
    url: abs("/"),
    title: `${strings.site.name} — ${strings.site.tagline}`,
    description: strings.site.description,
    images: [
      {
        url: "/og/home.png",
        width: 1200,
        height: 630,
        alt: `${strings.site.name} — free AI agent tools, checked by hand and by robot`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${strings.site.name} — ${strings.site.tagline}`,
    description: strings.site.description,
    images: ["/og/home.png"],
  },
  // Icons declared once, from public/, with the base path applied — Next's
  // app/icon.svg convention emits a root-relative href that would 404 on a
  // project page, and declaring them twice would fight over the same tag.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Let Google use full-length snippets and large image previews: for a
      // reference catalogue, being quoted at length is the goal.
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  other: {
    // Explicit, machine-readable attribution. Not a ranking signal, but it is
    // what scrapers and answer engines lift when they need a source name.
    author: BRAND.byline,
    "article:author": BRAND.author,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const stats = getStats();
  const nav = CATEGORIES.map((category) => ({
    slug: category.slug,
    label: category.label,
    count: stats.counts[category.slug] ?? 0,
  }));

  return (
    <html lang="en">
      <head>
        <link rel="alternate" type="application/rss+xml" title="Recently verified" href={withBase("/feed.xml")} />
        <link rel="author" href={BRAND.github} />
        {/* AEO-3: the machine-readable summary is advertised in markup, not just
            buried in a footer link, so an agent that reads <head> finds it. */}
        <link rel="alternate" type="text/plain" href={withBase("/llms.txt")} title="llms.txt" />
        <link rel="alternate" type="text/plain" href={withBase("/llms-full.txt")} title="llms-full.txt" />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-slate-900 focus:px-3 focus:py-1.5 focus:text-[13px] focus:text-white"
        >
          {strings.nav.skip}
        </a>

        <header className="border-b border-slate-200 dark:border-slate-800">
          <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="flex items-baseline gap-2" aria-label={`${strings.site.name} home`}>
              <span className="font-mono text-[15px] font-semibold text-slate-900 dark:text-slate-50">
                free-ai-agent-stack
              </span>
              <span className="hidden text-[11px] text-slate-400 sm:inline dark:text-slate-500">
                {stats.total} {strings.footer.entries}
              </span>
            </Link>
            <CategoryNav categories={nav} />
          </div>
        </header>

        <main id="main" className="mx-auto max-w-5xl px-4 py-6">
          {children}
        </main>

        <footer className="mt-10 border-t border-slate-200 dark:border-slate-800">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-6 text-[12px] text-slate-500 dark:text-slate-400">
            {/* Named authorship, above the legal line and in the footer of every
                page: a byline that appears once on an about page is a claim, one
                that appears on every page is an entity. */}
            <p className="text-slate-600 dark:text-slate-300">
              {strings.footer.by}{" "}
              <a
                href={BRAND.github}
                target="_blank"
                rel="noopener noreferrer author"
                className="font-medium text-slate-900 hover:underline dark:text-slate-100"
              >
                {BRAND.author}
              </a>{" "}
              {strings.footer.at}{" "}
              <a
                href={BRAND.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-slate-900 hover:underline dark:text-slate-100"
              >
                {BRAND.studio}
              </a>
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <Link href="/about/" className="hover:text-slate-900 dark:hover:text-slate-100">
                {strings.nav.about}
              </Link>
              <Link href="/contribute/" className="hover:text-slate-900 dark:hover:text-slate-100">
                {strings.nav.contribute}
              </Link>
              <a href={withBase("/data/all.json")} className="font-mono hover:text-slate-900 dark:hover:text-slate-100">
                /data/all.json
              </a>
              <a href={withBase("/llms.txt")} className="font-mono hover:text-slate-900 dark:hover:text-slate-100">
                /llms.txt
              </a>
              <a href={withBase("/llms-full.txt")} className="font-mono hover:text-slate-900 dark:hover:text-slate-100">
                /llms-full.txt
              </a>
              <a href={withBase("/feed.xml")} className="font-mono hover:text-slate-900 dark:hover:text-slate-100">
                /feed.xml
              </a>
              <a
                href={BRAND.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-900 dark:hover:text-slate-100"
              >
                GitHub
              </a>
            </div>
            <p>
              {strings.footer.lastVerified} {stats.generated_at.slice(0, 10)} ·{" "}
              {stats.total} entries · {strings.site.license}
            </p>
            <p>
              {strings.footer.corrections}{" "}
              <a
                href={`${BRAND.repo}/issues/new`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-dotted hover:text-slate-900 dark:hover:text-slate-100"
              >
                {strings.footer.correctionsCta}
              </a>
            </p>
            <p className="text-slate-400 dark:text-slate-500">{strings.footer.disclaimer}</p>
          </div>
        </footer>

        {/* One @graph per page rather than three loose <script> blocks: linked
            data resolves as a single graph, and an engine crawling any page
            gets the same publisher, author and site identity. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(graph(personSchema(), organizationSchema(), websiteSchema())),
          }}
        />
      </body>
    </html>
  );
}
