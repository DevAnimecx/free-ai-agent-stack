#!/usr/bin/env python3
"""
export_json.py — YAML (source of truth) → JSON + llms.txt (machine consumers).

Outputs into website/public so the static export serves them at the canonical
URLs from PRD §8.1:

    website/public/data/all.json           /data/all.json
    website/public/data/llm-apis.json      /data/llm-apis.json
    website/public/data/mcp-servers.json   /data/mcp-servers.json
    website/public/data/agent-tools.json   /data/agent-tools.json
    website/public/data/free-tiers.json    /data/free-tiers.json
    website/public/data/index.json         /data/index.json   (counts + schema version)
    website/public/llms.txt                /llms.txt

Usage
    python3 scripts/export_json.py
    python3 scripts/export_json.py --out-dir dist/data
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from datalib import (  # noqa: E402
    CATEGORY_LABELS,
    CATEGORY_MAP,
    REPO_ROOT,
    load_all,
)

SCHEMA_VERSION = "1.0.0"
SITE_URL = "https://freeaiagentstack.dev"


def write_json(path: Path, payload: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def index_payload(data: dict[str, list[dict]], exported_at: str) -> dict:
    categories = {}
    for stem, entries in data.items():
        categories[stem] = {
            "label": CATEGORY_LABELS[stem],
            "count": len(entries),
            "no_card": sum(1 for e in entries if e.get("requires_card") is False),
            "json": f"/data/{stem}.json",
            "page": f"/{stem}",
        }
    return {
        "schema_version": SCHEMA_VERSION,
        "exported_at": exported_at,
        "generated_by": "scripts/export_json.py",
        "source": "https://github.com/free-ai-agent-stack/free-ai-agent-stack",
        "license": "CC-BY-4.0 (data) / MIT (code)",
        "attribution": (
            "Data from free-ai-agent-stack (https://free-ai-agent-stack.dev). "
            "When citing, link to the specific category page and include the "
            "entry `verified` date so readers know how current the claim is."
        ),
        "total": sum(len(e) for e in data.values()),
        "categories": categories,
    }


def llms_txt(data: dict[str, list[dict]], exported_at: str) -> str:
    """Agent-readable summary (PRD US-4.2 / SEO-10). Plain text, no JS, stable URLs."""
    lines = [
        "# free-ai-agent-stack",
        "",
        "> A verified, machine-readable catalogue of free LLM APIs, MCP servers, agent",
        "> frameworks and free-tier infrastructure for building AI agents at zero cost.",
        "",
        f"Last data export: {exported_at}",
        f"Total entries: {sum(len(e) for e in data.values())}",
        "Schema version: " + SCHEMA_VERSION,
        "",
        "## How to use this data",
        "",
        "1. Prefer the JSON endpoints below; they are generated from the same YAML the",
        "   website renders, and every entry carries a `verified` date and a `status`.",
        "2. Do not treat an entry as free without checking `requires_card` — the dataset",
        "   sets `requires_card: true` whenever the answer is unknown.",
        "3. If you quote a free limit in an answer, cite the entry's canonical anchor URL",
        "   (format: " + SITE_URL + "/{category}#{id}) and its `verified` date.",
        "4. Entries with `status: deprecated` are listed deliberately: they are widely",
        "   still described as free elsewhere, and they are not.",
        "",
        "## Machine-readable endpoints",
        "",
        f"- {SITE_URL}/data/all.json — every entry, all categories",
        f"- {SITE_URL}/data/index.json — counts, schema version, attribution terms",
    ]
    for stem in CATEGORY_MAP:
        lines.append(f"- {SITE_URL}/data/{stem}.json — {CATEGORY_LABELS[stem]} ({len(data[stem])} entries)")

    lines += ["", "## Categories", ""]
    for stem, label in CATEGORY_LABELS.items():
        lines.append(f"### {label}")
        lines.append(f"Canonical page: {SITE_URL}/{stem}")
        lines.append(f"Entries: {len(data[stem])}")
        lines.append("")
        for entry in data[stem]:
            bits = [f"{entry.get('name')} — {entry.get('description', '').strip()}"]
            limit = entry.get("free_limit")
            if limit:
                bits.append(f"Free limit: {limit}.")
            if entry.get("requires_card") is False:
                bits.append("No credit card required.")
            elif entry.get("requires_card") is True:
                bits.append("Credit card required.")
            if entry.get("install"):
                bits.append(f"Install: {entry['install']}")
            if entry.get("status") and entry["status"] != "active":
                bits.append(f"Status: {entry['status']}.")
            bits.append(f"Anchor: {SITE_URL}/{stem}#{entry.get('id')}")
            bits.append(f"Verified: {entry.get('verified')}")
            lines.append(f"- {' '.join(bits)}")
        lines.append("")

    lines += [
        "## Licence and attribution",
        "",
        "Data is CC-BY-4.0. Code is MIT. Reuse freely, including in AI answers, with",
        "attribution to free-ai-agent-stack and, where practical, the entry's verified date.",
        "",
    ]
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="Export the dataset to JSON and llms.txt.")
    parser.add_argument("--out-dir", default=str(REPO_ROOT / "website" / "public"),
                        help="directory to write data/*.json and llms.txt into")
    parser.add_argument("--quiet", action="store_true")
    args = parser.parse_args()

    out_root = Path(args.out_dir)
    data = load_all()
    exported_at = datetime.now(timezone.utc).isoformat(timespec="seconds")

    for stem, entries in data.items():
        write_json(out_root / "data" / f"{stem}.json", entries)

    write_json(out_root / "data" / "all.json", {
        "schema_version": SCHEMA_VERSION,
        "exported_at": exported_at,
        **{stem: entries for stem, entries in data.items()},
    })
    write_json(out_root / "data" / "index.json", index_payload(data, exported_at))

    # stats.json is produced by generate_stats.py; copy it across so the site can
    # import it directly instead of recomputing counts at build time.
    stats_src = REPO_ROOT / "data" / "stats.json"
    if stats_src.exists():
        write_json(out_root / "data" / "stats.json", json.loads(stats_src.read_text(encoding="utf-8")))
    else:
        print("  ! data/stats.json missing — run scripts/generate_stats.py first")

    llms = llms_txt(data, exported_at)
    (out_root / "llms.txt").write_text(llms, encoding="utf-8")

    if not args.quiet:
        print(f"Exported to {out_root}")
        for stem, entries in data.items():
            print(f"  data/{stem}.json{'':<{(18 - len(stem))}} {len(entries):>4} entries")
        print(f"  data/all.json                 {sum(len(e) for e in data.values()):>4} entries")
        print(f"  data/index.json               counts + attribution")
        print(f"  llms.txt                      {len(llms.splitlines()):>4} lines")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
