import type { Metadata } from "next";
import Link from "next/link";

import { CategoryNav } from "@/components/CategoryNav";
import { CATEGORIES, getStats } from "@/lib/loadData";
import { organizationSchema } from "@/lib/schema";
import { strings } from "@/lib/strings";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(strings.site.url),
  title: {
    default: `${strings.site.name} — ${strings.site.tagline}`,
    template: `%s · ${strings.site.name}`,
  },
  description: strings.site.description,
  applicationName: strings.site.name,
  keywords: [
    "free AI agent tools",
    "free LLM API",
    "MCP servers list",
    "free AI APIs 2026",
    "awesome MCP servers",
    "free tier hosting",
  ],
  authors: [{ name: strings.site.name, url: strings.site.repo }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: strings.site.name,
    url: strings.site.url,
    title: `${strings.site.name} — ${strings.site.tagline}`,
    description: strings.site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${strings.site.name} — ${strings.site.tagline}`,
    description: strings.site.description,
  },
  robots: { index: true, follow: true },
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
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-slate-900 focus:px-3 focus:py-1.5 focus:text-[13px] focus:text-white"
        >
          {strings.nav.skip}
        </a>

        <header className="border-b border-slate-200 dark:border-slate-800">
          <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="flex items-baseline gap-2">
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
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <Link href="/about/" className="hover:text-slate-900 dark:hover:text-slate-100">
                {strings.nav.about}
              </Link>
              <Link href="/contribute/" className="hover:text-slate-900 dark:hover:text-slate-100">
                {strings.nav.contribute}
              </Link>
              <a
                href="/data/all.json"
                className="font-mono hover:text-slate-900 dark:hover:text-slate-100"
              >
                /data/all.json
              </a>
              <a href="/llms.txt" className="font-mono hover:text-slate-900 dark:hover:text-slate-100">
                /llms.txt
              </a>
              <a
                href={strings.site.repo}
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
                href={`${strings.site.repo}/issues/new?template=report-broken-link.yml`}
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

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()) }}
        />
      </body>
    </html>
  );
}
