#!/usr/bin/env python3
"""datalib.py — shared loading helpers for the free-ai-agent-stack toolchain.

Importing this keeps `validate.py`, `generate_stats.py`, `export_json.py` and
`verify_links.py` in agreement about:
  * where the data lives
  * which data file maps to which schema
  * how YAML scalars are normalised (unquoted `verified: 2026-09-24` becomes a string)

Contributors are encouraged to write dates unquoted (it reads better in a diff),
so normalisation happens once, here, instead of in every consumer.
"""

from __future__ import annotations

from datetime import date, datetime
from pathlib import Path
from typing import Any

import yaml

REPO_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = REPO_ROOT / "data"
SCHEMAS_DIR = REPO_ROOT / "schemas"

# data file stem -> schema stem (order defines display order everywhere)
CATEGORY_MAP: dict[str, str] = {
    "llm-apis": "llm-api",
    "mcp-servers": "mcp-server",
    "agent-tools": "agent-tool",
    "free-tiers": "free-tier",
    "skills": "skill",
}

CATEGORY_LABELS: dict[str, str] = {
    "llm-apis": "Free LLM APIs",
    "mcp-servers": "MCP Servers",
    "agent-tools": "Agent Tools",
    "free-tiers": "Free Tiers",
    "skills": "Agent Skills",
}

MINIMUM_ENTRIES: dict[str, int] = {
    "llm-apis": 50,
    "mcp-servers": 35,
    "agent-tools": 20,
    "free-tiers": 30,
    "skills": 8,
}

STALE_AFTER_DAYS = 30


def _normalise(value: Any) -> Any:
    """Recursively turn dates into ISO strings so JSON Schemas and JSON exports
    see exactly what a contributor typed in the YAML."""
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, dict):
        return {k: _normalise(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_normalise(v) for v in value]
    return value


def load_category(stem: str, normalise: bool = True) -> list[dict]:
    """Load one data/<stem>.yaml file as a list of normalised dicts."""
    path = DATA_DIR / f"{stem}.yaml"
    with path.open("r", encoding="utf-8") as fh:
        doc = yaml.safe_load(fh)
    if doc is None:
        return []
    if not isinstance(doc, list):
        raise ValueError(f"{path.name} must be a YAML list of entries, got {type(doc).__name__}")
    return [_normalise(entry) for entry in doc] if normalise else doc


def load_all(normalise: bool = True) -> dict[str, list[dict]]:
    """Load every category in CATEGORY_MAP order."""
    return {stem: load_category(stem, normalise=normalise) for stem in CATEGORY_MAP}


def entry_url(entry: dict) -> str:
    return str(entry.get("url", ""))


def has_notes(entry: dict) -> bool:
    notes = entry.get("notes")
    return bool(notes) if not isinstance(notes, list) else len(notes) > 0
