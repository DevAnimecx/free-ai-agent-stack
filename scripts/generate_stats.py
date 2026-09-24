#!/usr/bin/env python3
"""
generate_stats.py — refresh the numbers that go stale (PRD §11.2, US-5.1).

What it does
  * counts entries, no-card entries, status mix and verification freshness
  * builds the featured-entry shortlist used by the website home page
  * optionally refreshes GitHub star counts for MCP servers and agent tools
  * writes data/stats.json (consumed by the site build)
  * rewrites the README between the STATS and CONTRIBUTORS markers, leaving
    every other byte of the README untouched

Usage
    python3 scripts/generate_stats.py                 # refresh README + stats.json
    python3 scripts/generate_stats.py --update-stars  # also refresh GitHub stars
    python3 scripts/generate_stats.py --check         # exit 1 if README is stale (CI)
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from datetime import date, datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import requests  # noqa: E402

from datalib import (  # noqa: E402
    CATEGORY_LABELS,
    CATEGORY_MAP,
    DATA_DIR,
    REPO_ROOT,
    STALE_AFTER_DAYS,
    load_all,
)

README = REPO_ROOT / "README.md"
STATS_JSON = DATA_DIR / "stats.json"
STATS_START, STATS_END = "<!-- STATS:START -->", "<!-- STATS:END -->"
CONTRIB_START, CONTRIB_END = "<!-- CONTRIBUTORS:START -->", "<!-- CONTRIBUTORS:END -->"

# Categories whose entries can carry a GitHub star count (auto-refreshed).
STAR_CATEGORIES = ("mcp-servers", "agent-tools")
GITHUB_REPO_RE = re.compile(r"^https://github\.com/([^/]+)/([^/#?]+)")


def github_repo(url: str) -> str | None:
    m = GITHUB_REPO_RE.match(url or "")
    if not m:
        return None
    owner, repo = m.group(1), m.group(2)
    if owner in {"modelcontextprotocol"} and repo == "servers":
        return None  # monorepo: a star count would be misleading per-server
    return f"{owner}/{repo}"


def fetch_stars(repos: list[str]) -> dict[str, int]:
    """Unauthenticated GitHub API works at 60 req/hr; CI passes GITHUB_TOKEN for 5,000/hr."""
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    headers = {"Accept": "application/vnd.github+json", "User-Agent": "free-ai-agent-stack-stats"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    stars: dict[str, int] = {}
    for repo in repos:
        try:
            resp = requests.get(f"https://api.github.com/repos/{repo}", headers=headers, timeout=10)
            if resp.status_code == 200:
                stars[repo] = int(resp.json().get("stargazers_count", 0))
            elif resp.status_code in (403, 429):
                print(f"  ! GitHub rate limit hit after {len(stars)} repos — stopping")
                break
        except requests.RequestException as exc:
            print(f"  ! {repo}: {type(exc).__name__}")
    return stars


def update_stars_in_file(stem: str, stars: dict[str, int]) -> int:
    """Insert/refresh a `stars:` line under matching entries, preserving comments."""
    path = DATA_DIR / f"{stem}.yaml"
    lines = path.read_text(encoding="utf-8").splitlines(keepends=True)
    changed = 0
    current: str | None = None
    current_repo: str | None = None
    insert_at: int | None = None

    def commit(idx: int) -> None:
        nonlocal changed, current_repo, insert_at
        if current_repo and current_repo in stars and insert_at is not None:
            lines.insert(insert_at, f"  stars: {stars[current_repo]}\n")
            changed += 1
        insert_at = None

    for idx, line in enumerate(lines):
        m = re.match(r"^- id:\s*(\S+)\s*$", line)
        if m:
            commit(idx)
            current = m.group(1)
            current_repo = None
            continue
        m = re.match(r"^  url:\s*(\S+)\s*$", line)
        if m and current:
            current_repo = github_repo(m.group(1))
        m = re.match(r"^  (stars:\s*\S+)\s*$", line)
        if m and current_repo:
            if current_repo in stars:
                new = f"  stars: {stars[current_repo]}\n"
                if lines[idx] != new:
                    lines[idx] = new
                    changed += 1
                current_repo = None  # already handled, do not insert again
            continue
        if current_repo and insert_at is None and re.match(r"^  (clients|tags|verified):", line):
            insert_at = idx
    commit(len(lines))
    if changed:
        path.write_text("".join(lines), encoding="utf-8")
    return changed


def compute(data: dict[str, list[dict]]) -> dict:
    today = date.today()
    counts, no_card, fresh7, fresh30, statuses = {}, {}, {}, {}, {}
    contributors: dict[str, int] = {}
    tags: dict[str, int] = {}
    deprecated: list[str] = []

    for stem, entries in data.items():
        counts[stem] = len(entries)
        no_card[stem] = sum(1 for e in entries if e.get("requires_card") is False)
        fresh7[stem] = 0
        fresh30[stem] = 0
        statuses[stem] = {}
        for entry in entries:
            status = entry.get("status", "active")
            statuses[stem][status] = statuses[stem].get(status, 0) + 1
            if status == "deprecated":
                deprecated.append(f"{stem}#{entry['id']}")
            try:
                verified = date.fromisoformat(str(entry.get("verified")))
                age = (today - verified).days
                if age <= 7:
                    fresh7[stem] += 1
                if age <= STALE_AFTER_DAYS:
                    fresh30[stem] += 1
            except (TypeError, ValueError):
                pass
            handle = str(entry.get("verified_by", "")).lstrip("@")
            if handle:
                contributors[handle] = contributors.get(handle, 0) + 1
            for tag in entry.get("tags", []) or []:
                tags[tag] = tags.get(tag, 0) + 1

    total = sum(counts.values())
    total_no_card = sum(no_card.values())
    total_fresh30 = sum(fresh30.values())
    freshness_pct = (total_fresh30 / total * 100) if total else 100.0

    featured: dict[str, list[str]] = {}
    for stem, entries in data.items():
        if stem == "mcp-servers":
            picks = sorted(entries, key=lambda e: (-int(e.get("stars", 0) or 0), e["name"]))
        else:
            # Editorial weighting: essentials first, then generous free tiers, then A-Z.
            def score(entry: dict) -> tuple:
                tag_score = 0
                entry_tags = entry.get("tags", []) or []
                if "essential" in entry_tags:
                    tag_score -= 2
                if entry.get("requires_card") is False:
                    tag_score -= 1
                if entry.get("status") != "active":
                    tag_score += 3
                return (tag_score, entry.get("name", ""))

            picks = sorted(entries, key=score)

        # Breadth rule: the home page grid is a sampler, not a leaderboard, so
        # keep at most one entry per `category` (free-tiers, agent-tools) or
        # per provider (llm-apis). Without this the six slots fill with four
        # Cloudflare products or six Google models and the grid reads as spam.
        def diversify(items: list[dict], limit: int = 6) -> list[dict]:
            seen: set[str] = set()
            out: list[dict] = []
            # Pass 1: one per group so the grid shows breadth.
            for entry in items:
                group = (entry.get("category") or entry.get("provider") or entry["id"]).lower()
                if group in seen:
                    continue
                seen.add(group)
                out.append(entry)
            # Pass 2: top up in score order when a category has fewer than
            # `limit` groups (agent-tools only has four), so the grid is full.
            if len(out) < limit:
                for entry in items:
                    if entry not in out:
                        out.append(entry)
                    if len(out) == limit:
                        break
            return out

        featured[stem] = [e["id"] for e in diversify(picks)[:6]]

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "total": total,
        "counts": counts,
        "no_card": no_card,
        "total_no_card": total_no_card,
        "fresh_within_7_days": fresh7,
        "fresh_within_30_days": fresh30,
        "freshness_pct_30d": round(freshness_pct, 1),
        "statuses": statuses,
        "contributors": dict(sorted(contributors.items(), key=lambda kv: (-kv[1], kv[0]))),
        "top_tags": dict(sorted(tags.items(), key=lambda kv: (-kv[1], kv[0]))[:25]),
        "deprecated_entries": deprecated,
        "featured": featured,
    }


def readme_stats_block(stats: dict, data: dict[str, list[dict]]) -> str:
    lines = [
        "| Category | Count | No credit card | Verified <30d | Top pick |",
        "|---|---:|---:|---:|---|",
    ]
    first = {stem: (entries[0]["name"] if entries else "—") for stem, entries in data.items()}
    for stem, label in CATEGORY_LABELS.items():
        count = stats["counts"].get(stem, 0)
        card_free = stats["no_card"].get(stem, 0)
        fresh = stats["fresh_within_30_days"].get(stem, 0)
        lines.append(f"| [{label}](data/{stem}.yaml) | {count} | {card_free} | {fresh} | {first.get(stem, '—')} |")
    lines.append(
        f"| **Total** | **{stats['total']}** | **{stats['total_no_card']}** | "
        f"**{sum(stats['fresh_within_30_days'].values())}** | — |"
    )
    lines.append("")
    lines.append(
        f"_Auto-generated {stats['generated_at']} · link freshness {stats['freshness_pct_30d']}% "
        f"verified within 30 days (target 95%)._"
    )
    return "\n".join(lines)


def readme_contributors_block(stats: dict) -> str:
    people = stats["contributors"]
    if not people:
        return "_No verified entries yet._"
    parts = [f"@{handle} ({count})" for handle, count in people.items()]
    return " ".join(parts)


def replace_block(text: str, start: str, end: str, body: str) -> str:
    pattern = re.compile(rf"{re.escape(start)}.*?{re.escape(end)}", re.S)
    replacement = f"{start}\n{body}\n{end}"
    if not pattern.search(text):
        raise SystemExit(f"README is missing the {start} / {end} markers")
    return pattern.sub(lambda _: replacement, text, count=1)


def main() -> int:
    parser = argparse.ArgumentParser(description="Refresh README stats, contributor wall and stats.json.")
    parser.add_argument("--update-stars", action="store_true", help="refresh GitHub star counts into the YAML")
    parser.add_argument("--check", action="store_true", help="exit 1 if the README would change")
    args = parser.parse_args()

    if args.update_stars:
        data = load_all()
        repos: dict[str, list[str]] = {}
        for stem in STAR_CATEGORIES:
            repos[stem] = sorted({r for e in data[stem] if (r := github_repo(e.get("url", "")))})
        all_repos = sorted({r for rs in repos.values() for r in rs})
        print(f"Fetching star counts for {len(all_repos)} repositories…")
        stars = fetch_stars(all_repos)
        for stem in STAR_CATEGORIES:
            changed = update_stars_in_file(stem, stars)
            print(f"  {stem}: {changed} star field(s) updated")

    data = load_all()
    stats = compute(data)
    STATS_JSON.write_text(json.dumps(stats, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {STATS_JSON.relative_to(REPO_ROOT)} — {stats['total']} entries, "
          f"{stats['total_no_card']} without a credit card, {stats['freshness_pct_30d']}% fresh")

    if not README.exists():
        print("README.md not found — skipping README refresh (create it first)")
        return 0

    original = README.read_text(encoding="utf-8")
    updated = replace_block(original, STATS_START, STATS_END, readme_stats_block(stats, data))
    updated = replace_block(updated, CONTRIB_START, CONTRIB_END, readme_contributors_block(stats))

    # The rendered block carries a generation timestamp, which changes on every
    # run. `--check` exists to catch *content* drift (counts, contributor wall),
    # so the volatile line is excluded from the comparison — otherwise the gate
    # would fail every time CI ran it and would be ignored within a week.
    def volatile_free(text: str) -> str:
        return "\n".join(
            line for line in text.splitlines() if not line.startswith("_Auto-generated")
        )

    if volatile_free(updated) == volatile_free(original):
        print("README is already up to date")
        return 0

    if args.check:
        print("README is stale — run `python3 scripts/generate_stats.py` and commit the result")
        return 1

    README.write_text(updated, encoding="utf-8")
    print("README stats and contributor blocks refreshed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
