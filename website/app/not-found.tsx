import Link from "next/link";

import { CATEGORIES, getStats } from "@/lib/loadData";
import { strings } from "@/lib/strings";

export const metadata = {
  title: "Not found",
  // A 404 must never be indexed or followed: it is the one page on the site
  // where both defaults would actively hurt.
  robots: { index: false, follow: false },
};

export default function NotFound() {
  const stats = getStats();
  return (
    <>
      <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
        That page does not exist
      </h1>
      <p className="mt-2 max-w-prose text-[13px] leading-6 text-slate-600 dark:text-slate-400">
        Individual resources do not have their own pages — they are anchored on a category page, so
        links stay consolidated and nothing here is thin content. Try one of these:
      </p>
      <ul className="mt-4 space-y-1.5 text-[13px]">
        {CATEGORIES.map((category) => (
          <li key={category.slug}>
            <Link
              href={`/${category.slug}/`}
              className="text-blue-700 hover:underline dark:text-blue-400"
            >
              {category.label}
            </Link>{" "}
            <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
              {stats.counts[category.slug] ?? 0} entries
            </span>
          </li>
        ))}
        <li>
          <Link href="/" className="text-blue-700 hover:underline dark:text-blue-400">
            Home
          </Link>
        </li>
        <li>
          <Link href="/about/" className="text-blue-700 hover:underline dark:text-blue-400">
            {strings.nav.about}
          </Link>
        </li>
      </ul>
    </>
  );
}
