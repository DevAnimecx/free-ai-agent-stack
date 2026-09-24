#!/usr/bin/env python3
"""
validate.py — CI gate for free-ai-agent-stack data files.

Checks (PRD §12.2):
  1. Parse every YAML file in /data
  2. Validate against the matching JSON Schema in /schemas
  3. Reject missing required fields
  4. Reject duplicate `id` or `url` across ALL files
  5. Reject `verified` dates in the future
  6. Reject non-HTTPS URLs
  7. Reject `requires_card` missing
  8. Near-duplicate detection on `name` and `description`
  9. Exit non-zero with a human-readable error list

Usage:
    python3 scripts/validate.py                 # human output
    python3 scripts/validate.py --json          # machine output for CI
    python3 scripts/validate.py --quiet         # errors only
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import date, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

try:
    from jsonschema import Draft202012Validator
except ImportError:  # pragma: no cover
    sys.exit("jsonschema is required: pip install jsonschema")

from datalib import (  # noqa: E402
    CATEGORY_MAP,
    DATA_DIR,
    MINIMUM_ENTRIES,
    SCHEMAS_DIR,
    STALE_AFTER_DAYS,
    load_category,
)
# Categories where an entry implies a developer signup with a vendor, so
# `requires_card` must be stated explicitly (PRD §12.2.7).
CARD_CATEGORIES = {"llm-apis", "agent-tools", "free-tiers"}
FLAG_AFFILIATE = re.compile(r"[?&](ref|via|aff|affiliate|fpr)=|utm_(source|medium)=affiliate", re.I)
URL_RE = re.compile(r"^https://")
KEBAB_RE = re.compile(r"^[a-z0-9-]+$")
HANDLE_RE = re.compile(r"^@[A-Za-z0-9-]+$")


class Report:
    def __init__(self) -> None:
        self.errors: list[str] = []
        self.warnings: list[str] = []
        self.stats: dict[str, int] = {}

    def error(self, where: str, msg: str) -> None:
        self.errors.append(f"[ERROR] {where}: {msg}")

    def warn(self, where: str, msg: str) -> None:
        self.warnings.append(f"[WARN]  {where}: {msg}")


def normalise(text: str) -> str:
    """Lowercase alphanumeric-only form, for near-duplicate comparison."""
    return re.sub(r"[^a-z0-9]", "", (text or "").lower())


def validate_schema(entries: list[dict], schema_path: Path, report: Report, label: str) -> None:
    """Validate the whole YAML document (a list) against the schema, and map each
    error back to a human-readable `category#entry-id.field` location."""
    schema = json.loads(schema_path.read_text(encoding="utf-8"))
    validator = Draft202012Validator(schema)
    for err in sorted(validator.iter_errors(entries), key=lambda e: list(e.path)):
        path = list(err.path)
        ident = f"<index {path[0]}>" if path else "(root)"
        if path and isinstance(path[0], int) and 0 <= path[0] < len(entries):
            entry = entries[path[0]]
            if isinstance(entry, dict):
                ident = str(entry.get("id", ident))
        field = ".".join(str(p) for p in path[1:]) or "(root)"
        report.error(f"{label}#{ident}.{field}", err.message)


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate free-ai-agent-stack data files.")
    parser.add_argument("--json", action="store_true", help="emit JSON report")
    parser.add_argument("--quiet", action="store_true", help="only print errors")
    args = parser.parse_args()

    report = Report()
    today = date.today()
    seen_ids: dict[str, str] = {}
    seen_urls: dict[str, str] = {}
    seen_names: dict[str, str] = {}
    seen_desc: dict[str, str] = {}
    all_entries: dict[str, list[dict]] = {}

    if not DATA_DIR.exists():
        sys.exit(f"data directory not found at {DATA_DIR}")

    for stem, schema_stem in CATEGORY_MAP.items():
        yaml_path = DATA_DIR / f"{stem}.yaml"
        schema_path = SCHEMAS_DIR / f"{schema_stem}.schema.json"
        if not yaml_path.exists():
            report.error(f"data/{stem}.yaml", "file is missing")
            continue
        if not schema_path.exists():
            report.error(f"schemas/{schema_stem}.schema.json", "schema is missing")
            continue

        try:
            entries = load_category(stem)
        except Exception as exc:  # noqa: BLE001
            report.error(f"data/{stem}.yaml", f"YAML parse failure: {exc}")
            continue

        label = stem
        all_entries[stem] = entries
        report.stats[stem] = len(entries)
        validate_schema(entries, schema_path, report, label)

        # data/skills.yaml holds two kinds in one file, so the pack ids have to
        # be collected before the per-entry loop can resolve `parent` links.
        skill_packs: set[str] = set()
        if stem == "skills":
            skill_packs = {
                str(e.get("id")) for e in entries
                if isinstance(e, dict) and e.get("kind") == "pack"
            }

        for entry in entries:
            if not isinstance(entry, dict):
                report.error(label, "entry is not a mapping")
                continue
            ident = str(entry.get("id", "")).strip()
            where = f"{label}#{ident or '<missing id>'}"

            # --- id rules -------------------------------------------------
            if ident:
                if not KEBAB_RE.match(ident):
                    report.error(where, "id must be kebab-case ([a-z0-9-])")
                if ident in seen_ids:
                    report.error(
                        f"{where}.id",
                        f"duplicate id, also defined in {seen_ids[ident]} (ids are immutable and unique)",
                    )
                else:
                    seen_ids[ident] = f"data/{stem}.yaml"

            # --- url rules ------------------------------------------------
            for field in ("url", "docs_url", "signup_url"):
                value = entry.get(field)
                if not value:
                    continue
                if not URL_RE.match(str(value)):
                    report.error(f"{where}.{field}", "URL must start with https://")
                if field == "url":
                    if value in seen_urls:
                        report.error(
                            f"{where}.url",
                            f"duplicate url, also used by {seen_urls[value]}",
                        )
                    else:
                        seen_urls[value] = ident or where
                    if FLAG_AFFILIATE.search(str(value)):
                        report.error(
                            f"{where}.url",
                            "affiliate/referral parameters are auto-rejected (see CONTRIBUTING.md)",
                        )

            # --- trust-field rules ---------------------------------------
            # Three shapes exist, so this is keyed explicitly rather than as an
            # if/else. requires_card applies to anything a developer signs up
            # for (PRD §12.2.7); MCP servers carry requires_auth instead,
            # because a self-hosted server has no billing relationship at all;
            # and skill packs are plain files with neither, which is why an
            # else-branch here previously mis-validated every non-MCP addition.
            if stem in CARD_CATEGORIES:
                if "requires_card" not in entry:
                    report.error(where, "requires_card is missing — must be explicit (default true)")
                elif not isinstance(entry["requires_card"], bool):
                    report.error(where, "requires_card must be a boolean")
            elif stem == "mcp-servers":
                if "requires_auth" not in entry:
                    report.error(where, "requires_auth is missing — MCP entries must state it explicitly")
                elif not isinstance(entry["requires_auth"], bool):
                    report.error(where, "requires_auth must be a boolean")

            # --- skills: pack vs individual skill ------------------------
            # Two kinds share one file. An individual skill must say what it is
            # about (domain) and, when it came from a pack in this file, which
            # one (parent); a pack must not carry skill-only fields, and a
            # count only means anything for a pack — one skill is one skill.
            if stem == "skills":
                kind = entry.get("kind")
                if kind == "skill":
                    if not entry.get("domain"):
                        report.error(where, "kind: skill requires a domain")
                    if entry.get("skill_count") is not None:
                        report.error(where, "skill_count belongs on a pack, not on an individual skill")
                    parent = entry.get("parent")
                    if parent and parent not in skill_packs:
                        report.error(
                            f"{where}.parent",
                            f"parent '{parent}' does not match any kind: pack id in data/skills.yaml",
                        )
                elif kind == "pack":
                    if entry.get("domain"):
                        report.error(where, "domain belongs on an individual skill, not on a pack")
                    if entry.get("parent"):
                        report.error(where, "a pack cannot have a parent")

            verified = entry.get("verified")
            if isinstance(verified, str):
                try:
                    verified_date = date.fromisoformat(verified)
                except ValueError:
                    report.error(where, f"verified '{verified}' is not an ISO date (YYYY-MM-DD)")
                    verified_date = None
                if verified_date is not None:
                    if verified_date > today:
                        report.error(where, f"verified date {verified_date} is in the future")
                    elif verified_date < today - timedelta(days=STALE_AFTER_DAYS):
                        report.warn(
                            where,
                            f"verified {verified_date} is {(today - verified_date).days} days old — needs re-verification",
                        )
            elif verified is not None:
                report.error(where, "verified must be an ISO date (YYYY-MM-DD)")

            verified_by = entry.get("verified_by")
            if verified_by is not None and not HANDLE_RE.match(str(verified_by)):
                report.error(where, f"verified_by '{verified_by}' must look like @handle")

            # --- duplicate-content rules ----------------------------------
            name_key = normalise(str(entry.get("name", "")))
            if name_key:
                if name_key in seen_names:
                    report.error(f"{where}.name", f"near-duplicate name, also used by {seen_names[name_key]}")
                else:
                    seen_names[name_key] = where

            desc_key = normalise(str(entry.get("description", "")))
            if len(desc_key) > 40:
                if desc_key in seen_desc:
                    report.error(
                        f"{where}.description",
                        f"description is duplicated verbatim from {seen_desc[desc_key]} (SEO-14: write unique copy)",
                    )
                else:
                    seen_desc[desc_key] = where

            # --- notes sanity ---------------------------------------------
            notes = entry.get("notes")
            if isinstance(notes, list) and not all(isinstance(n, str) for n in notes):
                report.error(where, "notes list may only contain strings")

    # --- per-category minimums (guards against accidental mass deletion) ---
    for stem, minimum in MINIMUM_ENTRIES.items():
        count = report.stats.get(stem, 0)
        if count and count < minimum:
            report.error(
                f"data/{stem}.yaml",
                f"contains {count} entries; refusing a drop below the minimum of {minimum} "
                "(delete guard — raise this in the PR description if intentional)",
            )

    total = sum(report.stats.values())

    if args.json:
        print(
            json.dumps(
                {
                    "ok": not report.errors,
                    "counts": report.stats,
                    "total": total,
                    "errors": report.errors,
                    "warnings": report.warnings,
                },
                indent=2,
            )
        )
    else:
        if not args.quiet:
            print("free-ai-agent-stack — data validation")
            print("-" * 52)
            for stem in CATEGORY_MAP:
                print(f"  {stem:<14} {report.stats.get(stem, 0):>4} entries")
            print(f"  {'TOTAL':<14} {total:>4} entries")
            print("-" * 52)
        for line in report.warnings:
            print(line)
        for line in report.errors:
            print(line)
        print()
        if report.errors:
            print(f"FAILED — {len(report.errors)} error(s), {len(report.warnings)} warning(s)")
        else:
            print(f"PASSED — {total} entries across {len(CATEGORY_MAP)} files, {len(report.warnings)} warning(s)")

    return 1 if report.errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
