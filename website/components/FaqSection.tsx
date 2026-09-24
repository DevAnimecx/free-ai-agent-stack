import { faqSchema, graph } from "@/lib/schema";

/**
 * Answer-first block (AEO-1/AEO-2).
 *
 * Deliberately rendered as <h2>/<p> pairs rather than an accordion: the text
 * must be in the initial HTML for a crawler that does not run JavaScript, and
 * hidden-behind-a-click answers are the most common way sites mark up an FAQ
 * that an engine then declines to surface.
 *
 * The visible answer and the FAQPage structured data are generated from the
 * SAME array in the same render, so they cannot disagree — structured data that
 * contradicts the page is a manual-action risk, and an accordion with wording
 * that drifted from its schema is exactly how that happens.
 */
export function FaqSection({
  items,
  heading,
  id = "faq",
  path = "/",
}: {
  items: Array<{ q: string; a: string }>;
  heading: string;
  id?: string;
  /** The page this block sits on — scopes the FAQPage @id to this URL. */
  path?: string;
}) {
  if (items.length === 0) return null;

  return (
    <section className="mt-10 border-t border-slate-200 pt-6 dark:border-slate-800" aria-labelledby={id}>
      <h2 id={id} className="text-[15px] font-semibold text-slate-900 dark:text-slate-50">
        {heading}
      </h2>
      <div className="mt-3 divide-y divide-slate-200 dark:divide-slate-800">
        {items.map((item) => (
          <div key={item.q} className="py-3 first:pt-0">
            {/* h3, not a styled <p>: the question is a real heading in the
                document outline, which is how an engine pairs it with the
                answer beneath it. */}
            <h3 className="text-[14px] font-medium text-slate-900 dark:text-slate-100">{item.q}</h3>
            <p className="mt-1.5 max-w-prose text-[13px] leading-6 text-slate-600 dark:text-slate-400">
              {item.a}
            </p>
          </div>
        ))}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graph(faqSchema(items, path))) }}
      />
    </section>
  );
}
