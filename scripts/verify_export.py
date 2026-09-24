#!/usr/bin/env python3
"""verify_export.py — assert the built site will be indexed correctly.

This is the check that a browser cannot perform for you. A site whose canonical
URL points at the wrong host, whose Open Graph image 404s or whose feed is
missing renders perfectly and ranks as nothing, so those facts are asserted
mechanically before anything is deployed.

Run after `npm run build`. Exits non-zero with a list of failures.

    python3 scripts/verify_export.py
    python3 scripts/verify_export.py --base-path /free-ai-agent-stack \
        --site-url https://example.github.io/free-ai-agent-stack
"""

from __future__ import annotations

import argparse
import json
import os
import urllib.parse
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from datalib import CATEGORY_MAP, REPO_ROOT  # noqa: E402

OUT = REPO_ROOT / "website" / "out"


class Check:
    def __init__(self) -> None:
        self.failures: list[str] = []
        self.passes = 0

    def ok(self, condition: bool, label: str, detail: str = "") -> bool:
        if condition:
            self.passes += 1
        else:
            self.failures.append(f"{label}{(' — ' + detail) if detail else ''}")
        return condition


def main() -> int:
    parser = argparse.ArgumentParser(description="Verify the static export is deployable and indexable.")
    parser.add_argument("--site-url", default=os.environ.get(
        "SITE_URL", "https://devanimecx.github.io/free-ai-agent-stack"))
    # `--base-path` is read from SITE_URL, exactly as next.config.js does it. A
    # hardcoded default here made the checker assert the wrong thing the moment
    # the site moved to a root domain or to a fork with a different repo name,
    # reporting a broken deployment that was in fact correct.
    parser.add_argument("--base-path", default=None)
    args = parser.parse_args()

    site_url = args.site_url.rstrip("/")
    # resolve the base path AFTER site_url exists: the default depends on it
    base_path = (
        args.base_path
        if args.base_path is not None
        else os.environ.get("BASE_PATH", urllib.parse.urlparse(site_url).path)
    )
    base = "" if base_path in ("", "/") else base_path.rstrip("/")
    c = Check()

    if not OUT.exists():
        sys.exit("website/out does not exist — run `npm run build --prefix website` first")

    # --- 1. the pages exist ------------------------------------------------
    pages = ["index.html", "about/index.html", "contribute/index.html", "404.html"]
    pages += [f"{slug}/index.html" for slug in CATEGORY_MAP]
    for page in pages:
        c.ok((OUT / page).exists(), f"page missing: {page}")

    # --- 2. machine-readable endpoints exist -------------------------------
    for asset in (
        "llms.txt",
        "llms-full.txt",
        "feed.xml",
        "sitemap.xml",
        "robots.txt",
        "manifest.webmanifest",
        "favicon.ico",
        "icon.svg",
        "icon-192.png",
        "icon-512.png",
        "apple-icon.png",
        "og/home.png",
        ".nojekyll",
    ):
        c.ok((OUT / asset).exists(), f"asset missing: /{asset}")

    for slug in CATEGORY_MAP:
        c.ok((OUT / "og" / f"{slug}.png").exists(), f"Open Graph card missing: /og/{slug}.png")

    for schema in sorted((REPO_ROOT / "schemas").glob("*.schema.json")):
        c.ok((OUT / "schemas" / schema.name).exists(), f"schema not published: /schemas/{schema.name}")

    home_path = OUT / "index.html"
    if not home_path.exists():
        print("\n".join(c.failures), file=sys.stderr)
        return 1
    home = home_path.read_text(encoding="utf-8")

    # --- 3. the canonical host is consistent -------------------------------
    canonical = re.search(r'<link rel="canonical" href="([^"]+)"', home)
    c.ok(bool(canonical), "home page has no canonical link")
    if canonical:
        c.ok(
            canonical.group(1).rstrip("/") == site_url,
            "canonical does not match the deploy URL",
            f"{canonical.group(1)} != {site_url}",
        )

    # A doubled base path is the specific bug this catches: metadataBase already
    # carries the subpath, so any URL that also prefixed it manually lands here.
    # Only meaningful when a base path exists: with base == "" this expression
    # collapses to the bare site URL, which every page contains by definition as
    # its canonical, so the check reported a doubling that was not there.
    if base:
        doubled = f"{site_url}{base}{base}"
        c.ok(doubled not in home, "base path applied twice in a URL", doubled)
    else:
        c.ok(True, "root-domain build: no base path to double")

    # --- 4. social + icon tags resolve -------------------------------------
    def meta(pattern: str) -> str | None:
        """First capture group, or None. Only for single-group patterns."""
        m = re.search(pattern, home)
        return m.group(1) if m else None

    def present(pattern: str) -> bool:
        """Existence only — for patterns with no capture group."""
        return re.search(pattern, home) is not None

    og_image = meta(r'<meta property="og:image" content="([^"]+)"')
    c.ok(bool(og_image), "no og:image tag")
    if og_image:
        c.ok(og_image.startswith("https://"), "og:image is not an absolute URL", og_image)
        on_disk = og_image.replace(f"{site_url}/", "")
        c.ok((OUT / on_disk).exists(), "og:image does not exist in the export", on_disk)

    c.ok(present(r'<meta name="twitter:card" content="summary_large_image"'), "missing twitter:card")
    c.ok(present(r'<link rel="icon"'), "no favicon link")
    c.ok(present(r'<link rel="manifest"'), "no web manifest link")
    c.ok(present(r'<link rel="alternate"[^>]*application/rss\+xml'), "no RSS discovery link")

    # --- 5. base path applied exactly once to internal links ---------------
    if base:
        c.ok(f'href="{base}/llms.txt"' in home, f"internal data links missing the {base} prefix")
        c.ok(f'href="{base}{base}' not in home, "internal links carry a doubled base path")
        c.ok(f'src="{base}/' in home or f'href="{base}/_next' in home, "assets missing the base path")

    # --- 6. structured data parses and says the right things --------------
    graphs = [json.loads(m) for m in re.findall(r'<script type="application/ld\+json">(.*?)</script>', home, re.S)]
    types: set[str] = set()
    for g in graphs:
        for node in g.get("@graph", [g]):
            if "@type" in node:
                types.add(node["@type"])
    for expected in ("WebSite", "Organization", "Person", "Dataset", "FAQPage"):
        c.ok(expected in types, f"home page JSON-LD missing {expected}")

    org = next(
        (n for g in graphs for n in g.get("@graph", [g]) if n.get("@type") == "Organization"), None
    )
    if org:
        c.ok(org.get("url", "").rstrip("/") == site_url, "Organization url does not match the site",
             str(org.get("url")))
        founder = org.get("founder") or {}
        c.ok(bool(founder), "Organization has no founder")
    person = next(
        (n for g in graphs for n in g.get("@graph", [g]) if n.get("@type") == "Person"), None
    )
    if person:
        c.ok("Adarsh Kushwah" in str(person.get("name")), "Person node does not name the author")
        c.ok(bool(person.get("sameAs")), "Person node has no sameAs profile link")

    # --- 7. every category page carries an ItemList + breadcrumb ----------
    for slug in CATEGORY_MAP:
        path = OUT / slug / "index.html"
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")
        page_types: set[str] = set()
        for m in re.findall(r'<script type="application/ld\+json">(.*?)</script>', text, re.S):
            doc = json.loads(m)
            for node in doc.get("@graph", [doc]):
                page_types.add(node.get("@type"))
        c.ok("ItemList" in page_types, f"/{slug}/ missing ItemList schema")
        c.ok("FAQPage" in page_types, f"/{slug}/ missing FAQPage schema")
        c.ok("BreadcrumbList" in page_types, f"/{slug}/ missing BreadcrumbList schema")
        c.ok('id="answer-summary"' in text, f"/{slug}/ has no answer summary block")

    # --- 8. the sitemap lists every page ----------------------------------
    sitemap = (OUT / "sitemap.xml")
    if sitemap.exists():
        xml = sitemap.read_text(encoding="utf-8")
        for slug in CATEGORY_MAP:
            c.ok(f"{site_url}/{slug}/" in xml, f"sitemap missing /{slug}/")
        c.ok(xml.count("<url>") >= len(CATEGORY_MAP) + 4, "sitemap has too few URLs")

    # --- 9. robots.txt welcomes the answer engines ------------------------
    robots = OUT / "robots.txt"
    if robots.exists():
        text = robots.read_text(encoding="utf-8")
        for bot in ("GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"):
            c.ok(bot in text, f"robots.txt does not name {bot}")
        c.ok("Sitemap:" in text, "robots.txt has no Sitemap directive")

    # --- 10. the agent-facing files are real -----------------------------
    llms = OUT / "llms.txt"
    if llms.exists():
        text = llms.read_text(encoding="utf-8")
        c.ok(site_url in text, "llms.txt does not carry the canonical site URL")
        c.ok("Adarsh Kushwah" in text, "llms.txt does not carry the byline")
    feed = OUT / "feed.xml"
    if feed.exists():
        text = feed.read_text(encoding="utf-8")
        c.ok("<rss" in text and "<item>" in text, "feed.xml is not a populated RSS feed")
        c.ok(site_url in text, "feed.xml does not carry the canonical site URL")

    # --- report -----------------------------------------------------------
    print(f"verify_export.py — {c.passes} checks passed, {len(c.failures)} failed")
    print(f"  site: {site_url}/   base path: {base or '/'}")
    if c.failures:
        print()
        for failure in c.failures:
            print(f"  ✗ {failure}")
        return 1
    print("  ✓ the export is deployable and indexable")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
