#!/usr/bin/env python3
"""
verify_links.py — daily link-health checker (PRD §12.3).

Behaviour
  1. HEAD-requests every `url` (and `docs_url` / `signup_url`) with a 10s timeout
  2. Retries once on 5xx or timeout
  3. Treats 200-399 as alive; 405/403 fall back to a ranged GET
  4. After 3 consecutive daily failures sets `status: broken` and opens an issue
  5. On recovery sets `status: active` and closes the issue
  6. Respects robots.txt, max 5 concurrent requests, polite user-agent
  7. Writes a summary to $GITHUB_STEP_SUMMARY when running in Actions

State lives in `.linkstate.json` (committed back by CI so the 3-strike counter
survives between runs).

Usage
    python3 scripts/verify_links.py                    # report only
    python3 scripts/verify_links.py --apply            # write status changes into YAML
    python3 scripts/verify_links.py --apply --open-issues   # + gh issue create/close
    python3 scripts/verify_links.py --limit 20         # smoke-test subset
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import time
import urllib.robotparser as robotparser
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import date, datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

sys.path.insert(0, str(Path(__file__).resolve().parent))

import requests  # noqa: E402
from requests.adapters import HTTPAdapter  # noqa: E402
from urllib3.util.retry import Retry  # noqa: E402

from datalib import CATEGORY_MAP, DATA_DIR, REPO_ROOT, load_category  # noqa: E402

STATE_FILE = REPO_ROOT / ".linkstate.json"
USER_AGENT = (
    "free-ai-agent-stack-linkchecker/1.0 (+https://github.com/free-ai-agent-stack; "
    "link health verification; contact: maintainers@freeaiagentstack.dev)"
)
TIMEOUT = 10
MAX_WORKERS = 5
FAILURES_BEFORE_BROKEN = 3
FIELDS = ("url", "docs_url", "signup_url")

session = requests.Session()
session.headers.update({"User-Agent": USER_AGENT, "Accept": "*/*"})
_retry = Retry(total=1, backoff_factor=1.5, status_forcelist=[429, 500, 502, 503, 504], allowed_methods=["HEAD", "GET"])
session.mount("https://", HTTPAdapter(max_retries=_retry))
session.mount("http://", HTTPAdapter(max_retries=_retry))

_robots_cache: dict[str, robotparser.RobotFileParser | None] = {}


def robots_allows(url: str) -> bool:
    """Respect robots.txt (best effort — a missing or broken robots.txt means allow)."""
    parsed = urlparse(url)
    origin = f"{parsed.scheme}://{parsed.netloc}"
    if origin not in _robots_cache:
        parser = robotparser.RobotFileParser()
        try:
            resp = session.get(f"{origin}/robots.txt", timeout=TIMEOUT)
            if resp.status_code == 200:
                parser.parse(resp.text.splitlines())
                _robots_cache[origin] = parser
            else:
                _robots_cache[origin] = None
        except Exception:  # noqa: BLE001
            _robots_cache[origin] = None
    parser = _robots_cache[origin]
    if parser is None:
        return True
    try:
        return parser.can_fetch(USER_AGENT, url) or parser.can_fetch("*", url)
    except Exception:  # noqa: BLE001
        return True


def check_url(url: str) -> dict:
    """Returns {ok, status, reason}. HEAD first, ranged GET as a fallback.

    Status semantics:
      200-399  alive
      401/403  alive but gated — the page exists and requires auth or blocks
               bots. A signup page that answers 403 is a working link, so this
               must not count towards the 3-strike broken counter (otherwise
               every vendor with a WAF would be marked broken within a week).
      405/501  retried as GET before judging
      429      alive but rate-limited
      4xx/5xx  failure, one strike
    """
    if not robots_allows(url):
        return {"ok": True, "status": 0, "reason": "skipped: disallowed by robots.txt", "skipped": True}
    try:
        resp = session.head(url, timeout=TIMEOUT, allow_redirects=True)
        # Retry with a ranged GET when HEAD is refused, errors, or reports a
        # 4xx. Plenty of hosts (Kaggle, several CDNs) answer HEAD with 404 and
        # GET with 200, and a false "broken" would flip a listing's status after
        # three days — too expensive to leave to a HEAD-only verdict.
        if resp.status_code >= 400:
            resp = session.get(url, timeout=TIMEOUT, allow_redirects=True, stream=True,
                               headers={"Range": "bytes=0-2047"})
        status = resp.status_code
        if 200 <= status < 400:
            return {"ok": True, "status": status, "reason": resp.reason or ""}
        if status in (401, 403):
            return {"ok": True, "status": status, "reason": f"gated (HTTP {status}) — link resolves"}
        if status == 429:
            return {"ok": True, "status": status, "reason": "rate-limited — link resolves"}
        return {"ok": False, "status": status, "reason": resp.reason or ""}
    except requests.exceptions.Timeout:
        return {"ok": False, "status": 0, "reason": "timeout"}
    except requests.exceptions.SSLError as exc:
        return {"ok": False, "status": 0, "reason": f"ssl error: {exc}"}
    except requests.exceptions.RequestException as exc:
        return {"ok": False, "status": 0, "reason": type(exc).__name__}


def load_state() -> dict:
    if STATE_FILE.exists():
        try:
            return json.loads(STATE_FILE.read_text())
        except json.JSONDecodeError:
            pass
    return {"entries": {}}


def save_state(state: dict) -> None:
    state["last_run"] = datetime.now(timezone.utc).isoformat(timespec="seconds")
    STATE_FILE.write_text(json.dumps(state, indent=2, sort_keys=True) + "\n")


def set_status_in_file(stem: str, entry_id: str, new_status: str) -> bool:
    """Rewrite only the `status:` line inside an entry block, preserving comments.

    Returns True if the file changed. Doing this with a regex instead of a YAML
    round-trip is deliberate: a round-trip would strip every comment in the file,
    which is most of the file's value to a human reviewer.
    """
    path = DATA_DIR / f"{stem}.yaml"
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines(keepends=True)
    block_start = None
    for idx, line in enumerate(lines):
        if re.match(rf"^- id:\s*{re.escape(entry_id)}\s*$", line):
            block_start = idx
            break
    if block_start is None:
        return False
    changed = False
    for idx in range(block_start + 1, len(lines)):
        if re.match(r"^- id:", lines[idx]):  # next entry
            break
        m = re.match(r"^(\s+status:\s*)(\S+)(\s*)$", lines[idx])
        if m:
            if m.group(2) != new_status:
                lines[idx] = f"{m.group(1)}{new_status}{m.group(3)}"
                changed = True
            break
    if changed:
        path.write_text("".join(lines), encoding="utf-8")
    return changed


def gh_available() -> bool:
    try:
        subprocess.run(["gh", "--version"], capture_output=True, check=True)
        return bool(os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN"))
    except Exception:  # noqa: BLE001
        return False


def gh_issue(action: str, title: str, body: str, labels: str = "broken-link") -> None:
    if not gh_available():
        print(f"  (skipping gh issue {action}: gh CLI or token unavailable)")
        return
    try:
        if action == "create":
            subprocess.run(
                ["gh", "issue", "create", "--title", title, "--body", body, "--label", labels],
                capture_output=True, check=True,
            )
        else:
            subprocess.run(
                ["gh", "issue", "close", "--comment", body, "--search", title],
                capture_output=True, check=True,
            )
    except subprocess.CalledProcessError as exc:  # pragma: no cover
        print(f"  (gh issue {action} failed: {exc})")


def main() -> int:
    parser = argparse.ArgumentParser(description="Verify every outbound link in the dataset.")
    parser.add_argument("--apply", action="store_true", help="write status changes back into the YAML")
    parser.add_argument("--open-issues", action="store_true", help="create/close GitHub issues")
    parser.add_argument("--limit", type=int, default=0, help="only check the first N URLs (smoke test)")
    parser.add_argument("--changed-only", action="store_true",
                        help="only check entries in data files changed by this PR (used by validate.yml)")
    parser.add_argument("--json", action="store_true", help="print a JSON report")
    args = parser.parse_args()

    state = load_state()
    entries_state: dict = state.setdefault("entries", {})
    today = date.today().isoformat()

    checked_stems = list(CATEGORY_MAP)
    if args.changed_only:
        base = os.environ.get("GITHUB_BASE_REF") or "main"
        try:
            diff = subprocess.run(
                ["git", "diff", "--name-only", f"origin/{base}...HEAD"],
                capture_output=True, text=True, check=True, cwd=REPO_ROOT,
            ).stdout
        except subprocess.CalledProcessError:
            diff = ""
        changed = {Path(line.strip()).stem for line in diff.splitlines() if line.strip().endswith(".yaml")}
        checked_stems = [s for s in CATEGORY_MAP if s in changed]
        if not checked_stems:
            print("No data files changed in this PR — nothing to verify.")
            return 0
        print(f"Changed categories: {', '.join(checked_stems)}")

    targets: list[tuple[str, str, str, str]] = []  # (stem, id, field, url)
    for stem in checked_stems:
        for entry in load_category(stem):
            for field in FIELDS:
                url = entry.get(field)
                if url:
                    targets.append((stem, str(entry["id"]), field, str(url)))
    if args.limit:
        targets = targets[: args.limit]

    results: list[dict] = []
    started = time.time()
    print(f"Checking {len(targets)} URLs across {len(CATEGORY_MAP)} categories "
          f"(max {MAX_WORKERS} concurrent, {TIMEOUT}s timeout)\n")

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        futures = {pool.submit(check_url, url): (stem, ident, field, url) for stem, ident, field, url in targets}
        for future in as_completed(futures):
            stem, ident, field, url = futures[future]
            outcome = future.result()
            key = f"{stem}/{ident}"
            record = entries_state.setdefault(key, {})
            record.setdefault("failures", 0)
            record[f"last_status_{field}"] = outcome.get("status")
            record["last_checked"] = today
            record["last_reason"] = outcome.get("reason")

            if outcome.get("skipped"):
                verdict = "SKIP"
            elif outcome["ok"]:
                if record["failures"]:
                    record["recovered_from"] = record["failures"]
                record["failures"] = 0
                verdict = "ok"
            else:
                record["failures"] = int(record.get("failures", 0)) + 1
                verdict = "FAIL"

            result = {
                "key": key, "stem": stem, "id": ident, "field": field, "url": url,
                "ok": bool(outcome["ok"]), "status": outcome.get("status"),
                "reason": outcome.get("reason"), "failures": record["failures"],
                "verdict": verdict,
            }
            results.append(result)
            if verdict != "ok":
                print(f"  {verdict:4} {key:<42} {field:<10} {outcome.get('status')} {outcome.get('reason')}")

    # --- status transitions ------------------------------------------------
    broken_now, recovered = [], []
    for result in results:
        record = entries_state.get(result["key"], {})
        if result["failures"] >= FAILURES_BEFORE_BROKEN:
            broken_now.append(result)
        if result.get("ok") and record.get("recovered_from"):
            recovered.append(result)

    if args.apply:
        for result in broken_now:
            if set_status_in_file(result["stem"], result["id"], "broken"):
                print(f"  ↳ set status: broken on {result['key']}")
        for result in recovered:
            if set_status_in_file(result["stem"], result["id"], "active"):
                print(f"  ↳ set status: active on {result['key']}")

    if args.open_issues:
        if broken_now:
            body = "The daily link check failed 3 consecutive times for:\n\n" + "\n".join(
                f"- `{r['key']}` — {r['url']} (HTTP {r['status']}, {r['reason']})" for r in broken_now
            ) + "\n\nA maintainer should re-verify the entry and update it, or deprecate it."
            gh_issue("create", f"[auto] {len(broken_now)} broken link(s) detected", body)
        for result in recovered:
            gh_issue("close", f"[auto] broken link(s) detected", f"`{result['key']}` is reachable again.")

    save_state(state)

    total = len(results)
    alive = sum(1 for r in results if r["ok"])
    failed = total - alive
    elapsed = time.time() - started
    freshness = (alive / total * 100) if total else 100.0

    summary = [
        "## Link verification",
        "",
        f"- URLs checked: **{total}**",
        f"- Alive: **{alive}** ({freshness:.1f}%)",
        f"- Failing: **{failed}**",
        f"- Newly flagged broken (3+ consecutive failures): **{len(broken_now)}**",
        f"- Recovered: **{len(recovered)}**",
        f"- Duration: {elapsed:.1f}s",
        "",
    ]
    if broken_now:
        summary += ["### Broken", "", "| Entry | URL | Status |", "|---|---|---|"]
        summary += [f"| `{r['key']}` | {r['url']} | {r['status']} |" for r in broken_now]
        summary.append("")

    text = "\n".join(summary)
    step_summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if step_summary:
        with open(step_summary, "a", encoding="utf-8") as fh:
            fh.write(text + "\n")
    print(text)

    if args.json:
        print(json.dumps({"total": total, "alive": alive, "failing": failed, "results": results}, indent=2))

    # Guardrail (PRD §4.3): link rot must stay under 5%.
    rot_rate = (failed / total * 100) if total else 0.0
    if rot_rate > 5:
        print(f"::warning::link rot rate is {rot_rate:.1f}% (guardrail: <5%)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
