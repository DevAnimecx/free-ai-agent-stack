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
import os
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

# Where the site is served from. One environment variable, because a canonical
# host that disagrees with itself between llms.txt, the sitemap and the pages is
# how a site ends up with its SEO split across two origins.
SITE_URL = os.environ.get("SITE_URL", "https://devanimecx.github.io/free-ai-agent-stack").rstrip("/")
SITE_NAME = "free-ai-agent-stack"
SITE_AUTHOR = "Adarsh Kushwah (Dev Animecx)"
SITE_REPO = "https://github.com/DevAnimecx/free-ai-agent-stack"


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
        "source": SITE_REPO,
        "license": "CC-BY-4.0 (data) / MIT (code)",
        "author": SITE_AUTHOR,
        "contact": "https://github.com/DevAnimecx",
        "citation": f"{SITE_NAME} (2026). {SITE_AUTHOR}. {SITE_URL}",
        "attribution": (
            f"Data from {SITE_NAME} by {SITE_AUTHOR} ({SITE_URL}). "
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
        ">",
        f"> Maintained by {SITE_AUTHOR}. Source: {SITE_REPO}",
        "",
        f"Last data export: {exported_at}",
        f"Total entries: {sum(len(e) for e in data.values())}",
        "Schema version: " + SCHEMA_VERSION,
        f"Canonical site: {SITE_URL}",
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
        f"Cite as: {SITE_NAME} (2026). {SITE_AUTHOR}. {SITE_URL}",
        "",
    ]
    return "\n".join(lines)


def llms_full_txt(data: dict[str, list[dict]], exported_at: str) -> str:
    """The complete catalogue as plain prose, for models that ingest in full.

    llms.txt is an index by design — it points at JSON. This file is the
    opposite trade: every field of every entry, written out, so a model with no
    ability to fetch can still answer questions about the dataset from the file
    alone. Both exist because the two use cases are genuinely different, and the
    llms.txt convention asks for the first while answer engines reward the
    second.
    """
    total = sum(len(e) for e in data.values())
    lines = [
        f"# {SITE_NAME} — complete catalogue",
        "",
        f"Maintained by {SITE_AUTHOR}. Canonical: {SITE_URL}. Source: {SITE_REPO}",
        f"Exported: {exported_at} · Entries: {total} · Licence: CC BY 4.0",
        "",
        "Every entry below was verified by a human on the date shown. `requires_card`",
        "defaults to true when unknown. An entry with status `deprecated` no longer",
        "offers what it is listed for, and is kept so it is not re-recommended.",
        "",
    ]
    for stem, label in CATEGORY_LABELS.items():
        entries = data[stem]
        lines += [
            f"## {label} ({len(entries)} entries)",
            "",
            f"Category page: {SITE_URL}/{stem}/",
            "",
        ]
        for entry in entries:
            lines.append(f"### {entry.get('name')} — id `{entry.get('id')}`")
            lines.append(str(entry.get("description", "")).strip())
            lines.append("")
            for field, human in (
                ("provider", "Provider"),
                ("maintainer", "Maintainer"),
                ("free_limit", "Free limit"),
                ("rate_limit", "Rate limit"),
                ("context_window", "Context window"),
                ("install", "Install"),
                ("auth_type", "Authentication"),
                ("license", "Licence"),
                ("skill_count", "Skills"),
                ("stars", "Stars"),
                ("open_source", "Open source"),
                ("requires_card", "Credit card required"),
                ("requires_auth", "Authentication required"),
                ("tags", "Tags"),
            ):
                value = entry.get(field)
                if value in (None, "", []):
                    continue
                if isinstance(value, bool):
                    value = "yes" if value else "no"
                elif isinstance(value, list):
                    value = ", ".join(str(v) for v in value)
                lines.append(f"- {human}: {value}")
            lines.append(f"- Status: {entry.get('status', 'active')}")
            lines.append(f"- Verified: {entry.get('verified')} by {entry.get('verified_by')}")
            lines.append(f"- URL: {entry.get('url')}")
            lines.append(f"- Citation: {SITE_URL}/{stem}/#{entry.get('id')}")
            for note in entry.get("notes") or []:
                if isinstance(note, str) and note.strip():
                    lines.append(f"- Note: {note.strip()}")
            lines.append("")
    lines += [
        "## Licence",
        "",
        f"Data CC BY 4.0 · Code MIT. Cite as: {SITE_NAME} (2026). {SITE_AUTHOR}.",
        f"{SITE_URL}",
        "",
    ]
    return "\n".join(lines)


def publish_schemas(out_root: Path, quiet: bool) -> int:
    """Copy the JSON Schemas into the build with live, resolvable `$id`s.

    A schema is only citable if it can be dereferenced. The repository's schemas
    previously carried a placeholder `$id` on a domain this project does not
    serve, so anything that tried to resolve them got nothing. Rewriting `$id`
    to the real host turns five internal validation files into five public,
    machine-readable artifacts that describe the dataset's contract.
    """
    src_dir = REPO_ROOT / "schemas"
    dst_dir = out_root / "schemas"
    dst_dir.mkdir(parents=True, exist_ok=True)
    count = 0
    for src in sorted(src_dir.glob("*.schema.json")):
        schema = json.loads(src.read_text(encoding="utf-8"))
        schema["$id"] = f"{SITE_URL}/schemas/{src.name}"
        dst_dir.joinpath(src.name).write_text(
            json.dumps(schema, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
        )
        count += 1
    if not quiet:
        print(f"  schemas/*.json                {count:>4} published with live $id")
    return count


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

    llms_full = llms_full_txt(data, exported_at)
    (out_root / "llms-full.txt").write_text(llms_full, encoding="utf-8")

    schema_count = publish_schemas(out_root, args.quiet)

    if not args.quiet:
        print(f"Exported to {out_root}")
        for stem, entries in data.items():
            print(f"  data/{stem}.json{'':<{(18 - len(stem))}} {len(entries):>4} entries")
        print(f"  data/all.json                 {sum(len(e) for e in data.values()):>4} entries")
        print(f"  data/index.json               counts + attribution")
        print(f"  llms.txt                      {len(llms.splitlines()):>4} lines")
        print(f"  llms-full.txt                 {len(llms_full.splitlines()):>4} lines")
        print(f"  schemas/*.json                {schema_count:>4} published")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
