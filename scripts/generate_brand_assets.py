#!/usr/bin/env python3
"""generate_brand_assets.py — Open Graph cards and site icons.

Social cards are the one image most people will ever see of this project: they
are what a link looks like in Slack, X, LinkedIn, Discord and every AI chat that
renders previews. They are generated here rather than committed as binary blobs
so that the count on the card comes from data/stats.json and cannot drift from
the count on the page — a social card advertising "235 resources" on a site that
lists 384 is worse than having no card at all.

Outputs into website/public/:
    og/home.png, og/<category>.png, og/about.png, og/contribute.png   1200×630
    icon-192.png, icon-512.png, apple-icon.png, favicon.ico

Usage
    python3 scripts/generate_brand_assets.py
    python3 scripts/generate_brand_assets.py --quiet
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:  # pragma: no cover
    sys.exit("Pillow is required: pip install pillow")

sys.path.insert(0, str(Path(__file__).resolve().parent))
from datalib import CATEGORY_LABELS, REPO_ROOT  # noqa: E402

PUBLIC = REPO_ROOT / "website" / "public"
OG_DIR = PUBLIC / "og"

W, H = 1200, 630

# Palette mirrors the Tailwind classes the site uses, so the card and the page
# look like the same project.
BG = (15, 23, 42)          # slate-900
BG_ACCENT = (30, 41, 59)   # slate-800
INK = (248, 250, 252)      # slate-50
MUTED = (148, 163, 184)    # slate-400
BLUE = (96, 165, 250)      # blue-400
BLUE_DEEP = (29, 78, 216)  # blue-700
GREEN = (74, 222, 128)     # green-400

SITE = "free-ai-agent-stack"
BYLINE = "By Adarsh Kushwah · Dev Animecx"
DOMAIN = "devanimecx.github.io/free-ai-agent-stack"
VERIFIED = "VERIFIED CATALOGUE"

FONT_CANDIDATES = {
    "regular": [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf",
    ],
    "bold": [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf",
    ],
    "mono": [
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf",
    ],
}


def font(kind: str, size: int):
    """Resolve a real TTF, falling back to Pillow's bundled scalable default."""
    for path in FONT_CANDIDATES.get(kind, []):
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default(size=size)


def wrap(draw: ImageDraw.ImageDraw, text: str, fnt, max_width: int) -> list[str]:
    words, lines, current = text.split(), [], ""
    for word in words:
        trial = f"{current} {word}".strip()
        if draw.textlength(trial, font=fnt) <= max_width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def draw_mark(draw: ImageDraw.ImageDraw, x: int, y: int, scale: float = 1.0) -> None:
    """The three-bar stack with a check — the site's mark, drawn not imported."""
    bar_h = max(3, int(7 * scale))
    gap = max(5, int(12 * scale))
    widths = [int(72 * scale), int(72 * scale), int(46 * scale)]
    for i, w in enumerate(widths):
        top = y + i * (bar_h + gap)
        draw.rounded_rectangle([x, top, x + w, top + bar_h], radius=bar_h // 2, fill=BLUE if i < 2 else BLUE_DEEP)
    cx = x + widths[2] + int(16 * scale)
    cy = y + int(10 * scale)
    r = int(15 * scale)
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=INK)
    draw.line(
        [(cx - int(6 * scale), cy + int(1 * scale)), (cx - int(1 * scale), cy + int(6 * scale)), (cx + int(8 * scale), cy - int(7 * scale))],
        fill=BLUE_DEEP, width=max(2, int(4 * scale)), joint="curve",
    )


def card(title: str, subtitle: str, count_line: str, *, eyebrow: str = VERIFIED) -> Image.Image:
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)

    # Subtle dot grid — texture without pulling in an asset.
    for gx in range(0, W, 40):
        for gy in range(0, H, 40):
            d.point((gx, gy), fill=BG_ACCENT)

    # Left accent rule, echoing the card borders on the site.
    d.rectangle([0, 0, 8, H], fill=BLUE_DEEP)

    pad = 72
    draw_mark(d, pad, 62, scale=0.8)

    # Wordmark beside the mark, eyebrow right-aligned on the same line. The
    # earlier layout centred the domain in the footer and it collided with the
    # right-aligned byline — three text anchors on one 1200px row was one too
    # many, so the name moved up here where there is room for it.
    mark_font = font("bold", 34)
    d.text((pad + 118, 66), SITE, font=mark_font, fill=INK)
    eyebrow_font = font("mono", 18)
    eyebrow_w = d.textlength(eyebrow, font=eyebrow_font)
    d.text((W - pad - eyebrow_w, 78), eyebrow, font=eyebrow_font, fill=BLUE)

    title_font = font("bold", 68)
    y = 190
    for line in wrap(d, title, title_font, W - pad * 2)[:3]:
        d.text((pad, y), line, font=title_font, fill=INK)
        y += 78

    y += 14
    sub_font = font("regular", 30)
    for line in wrap(d, subtitle, sub_font, W - pad * 2)[:3]:
        d.text((pad, y), line, font=sub_font, fill=MUTED)
        y += 42

    # Count chip — the number that must never disagree with the site.
    chip_font = font("bold", 26)
    chip_w = int(d.textlength(count_line, font=chip_font)) + 44
    chip_y = H - 132
    d.rounded_rectangle([pad, chip_y, pad + chip_w, chip_y + 52], radius=26, fill=(30, 58, 138))
    d.text((pad + 22, chip_y + 12), count_line, font=chip_font, fill=(219, 234, 254))

    d.line([(pad, H - 58), (W - pad, H - 58)], fill=BG_ACCENT, width=2)
    # Two anchors only: domain left, byline right.
    mono = font("mono", 20)
    d.text((pad, H - 43), DOMAIN, font=mono, fill=(100, 116, 139))
    foot = font("regular", 22)
    byline_w = d.textlength(BYLINE, font=foot)
    d.text((W - pad - byline_w, H - 44), BYLINE, font=foot, fill=BLUE)
    return img


def icon(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    s = size / 180
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=int(36 * s), fill=BG)
    draw_mark(d, int(34 * s), int(58 * s), scale=s * 1.15)
    return img


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate Open Graph cards and icons.")
    parser.add_argument("--quiet", action="store_true")
    args = parser.parse_args()

    stats_path = REPO_ROOT / "data" / "stats.json"
    if not stats_path.exists():
        sys.exit("data/stats.json missing — run scripts/generate_stats.py first")
    stats = json.loads(stats_path.read_text(encoding="utf-8"))
    total = stats["total"]
    no_card = stats["total_no_card"]
    updated = stats["generated_at"][:10]

    OG_DIR.mkdir(parents=True, exist_ok=True)
    written: list[Path] = []

    cards = {
        "home": (
            "Free AI agent tools, checked by hand and by robot",
            f"{no_card} of {total} entries need no credit card. Re-verified {updated}.",
            f"{total} entries",
        ),
        "about": (
            "Methodology",
            "What counts as free, who verified each claim, and what automation may change.",
            f"{total} entries · verified {updated}",
        ),
        "contribute": (
            "Contribute a resource",
            "Twelve lines of YAML. CI checks the schema, the duplicates and the link.",
            "Open to pull requests",
        ),
    }
    for slug, (title, subtitle, chip) in cards.items():
        img = card(title, subtitle, chip)
        path = OG_DIR / f"{slug}.png"
        img.save(path, "PNG", optimize=True)
        written.append(path)

    for slug, label in CATEGORY_LABELS.items():
        count = stats["counts"].get(slug, 0)
        free = stats["no_card"].get(slug, 0)
        img = card(
            label,
            f"{count} verified entries, {free} of which need no credit card. Last checked {updated}.",
            f"{count} entries",
            eyebrow="FREE AI AGENT STACK",
        )
        path = OG_DIR / f"{slug}.png"
        img.save(path, "PNG", optimize=True)
        written.append(path)

    # Icons. The wordmark in icon.svg carries the byline; these are the raster
    # fallbacks Apple and Android need.
    for size, name in ((192, "icon-192.png"), (512, "icon-512.png"), (180, "apple-icon.png")):
        path = PUBLIC / name
        icon(size).save(path, "PNG", optimize=True)
        written.append(path)

    ico = PUBLIC / "favicon.ico"
    icon(64).save(ico, sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    written.append(ico)

    if not args.quiet:
        print(f"Brand assets → {PUBLIC}")
        for path in written:
            print(f"  {path.relative_to(PUBLIC)!s:<24} {path.stat().st_size / 1024:>6.1f} KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
