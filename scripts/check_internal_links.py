#!/usr/bin/env python3
"""Validate local Markdown and HTML links in the Business360 repository.

External URLs are intentionally not fetched: this check is deterministic, fast,
and does not fail because a third-party website is temporarily unavailable.
"""
from __future__ import annotations

import html.parser
import re
import sys
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
SKIP_DIRS = {".git", ".venv", "node_modules", "__pycache__"}
MD_LINK = re.compile(r"(?<!!)\[[^\]]*\]\((?:<([^>]+)>|([^\s)]+))(?:\s+[^)]*)?\)")


class Hrefs(html.parser.HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.values: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        for key, value in attrs:
            if key in {"href", "src"} and value:
                self.values.append(value)


def files_to_check() -> list[Path]:
    return [
        path for path in ROOT.rglob("*")
        if path.is_file()
        and path.suffix.lower() in {".md", ".html"}
        and not any(part in SKIP_DIRS for part in path.parts)
    ]


def local_target(source: Path, raw_url: str) -> Path | None:
    parsed = urlsplit(raw_url.strip())
    if parsed.scheme or parsed.netloc or not parsed.path:
        return None
    target_text = unquote(parsed.path)
    base = source.parent if not target_text.startswith("/") else ROOT
    target = (base / target_text.lstrip("/")).resolve()
    try:
        target.relative_to(ROOT.resolve())
    except ValueError:
        return None
    if target.is_dir():
        target = target / "index.html"
    return target


def extract_links(path: Path) -> list[str]:
    content = path.read_text(encoding="utf-8")
    links = [a or b for a, b in MD_LINK.findall(content)]
    if path.suffix.lower() == ".html":
        parser = Hrefs()
        parser.feed(content)
        links.extend(parser.values)
    return links


def main() -> int:
    failures: list[str] = []
    checked = 0
    for source in files_to_check():
        for raw in extract_links(source):
            target = local_target(source, raw)
            if target is None:
                continue
            checked += 1
            if not target.exists():
                failures.append(f"{source.relative_to(ROOT)} -> {raw}")
    if failures:
        print("Broken internal links:")
        for item in failures:
            print(f"  - {item}")
        print(f"\n{len(failures)} broken link(s); {checked} internal link(s) checked.")
        return 1
    print(f"Internal-link check passed: {checked} local link(s) checked.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
