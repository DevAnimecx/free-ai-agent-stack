"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { strings } from "@/lib/strings";

/**
 * <CategoryNav categories={[{slug,label,count}]} />
 * Sticky top nav (PRD §10.3). Server-rendered markup, client-only for the
 * active-route highlight.
 */
export function CategoryNav({
  categories,
}: {
  categories: Array<{ slug: string; label: string; count: number }>;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label={strings.nav.categories} className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {categories.map((category) => {
        const href = `/${category.slug}/`;
        const isActive = pathname === href || pathname.startsWith(`/${category.slug}`);
        return (
          <Link
            key={category.slug}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`group inline-flex items-baseline gap-1.5 text-[13px] transition ${
              isActive
                ? "font-semibold text-slate-900 dark:text-slate-50"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            }`}
          >
            {category.label}
            <span className="font-mono text-[11px] tabular-nums text-slate-400 dark:text-slate-500">
              {category.count}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
