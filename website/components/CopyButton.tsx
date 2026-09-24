"use client";

import { useCallback, useState } from "react";

import { strings } from "@/lib/strings";

/**
 * <CopyButton text="npx -y @upstash/context7-mcp" />
 *
 * FR-W-7. Clipboard API with a graceful fallback: the sandboxed preview and some
 * http contexts refuse clipboard writes, so the text stays selectable either way
 * and we say "select and copy" rather than silently doing nothing.
 */
export function CopyButton({ text, label }: { text: string; label?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  const onCopy = useCallback(async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        throw new Error("no clipboard api");
      }
      setState("copied");
      window.setTimeout(() => setState("idle"), 1600);
    } catch {
      setState("failed");
      window.setTimeout(() => setState("idle"), 2400);
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={onCopy}
      className="shrink-0 rounded border border-slate-300 px-2 py-1 font-mono text-[11px] leading-none text-slate-600 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-500 dark:hover:text-slate-100"
      aria-live="polite"
    >
      {state === "copied"
        ? strings.card.copied
        : state === "failed"
          ? "select + copy"
          : (label ?? strings.card.copy)}
    </button>
  );
}
