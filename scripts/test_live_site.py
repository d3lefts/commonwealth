#!/usr/bin/env python3
"""Read-only external origin test: exact bytes and available routes after Pages deployment."""
from __future__ import annotations
import hashlib
import json
from pathlib import Path
import time
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site"
manifest = json.loads((SITE / "build-manifest.json").read_text(encoding="utf-8"))
base = manifest["site_origin"]
assert base == "https://d3lefts.github.io/commonwealth/"
# Verify every manifest-pinned asset, canonical root, manifest and sitemap.
paths = sorted(set(manifest["files"]) | {"", "build-manifest.json", "sitemap.xml"})
for path in paths:
    local = SITE / (path or "index.html")
    expected = hashlib.sha256(local.read_bytes()).hexdigest()
    last = ""
    for attempt in range(22):
        try:
            request = Request(base + path, headers={
                "User-Agent": "CommonwealthIndependentCICD/1.0",
                "Cache-Control": "no-cache",
                "Accept": "*/*"})
            with urlopen(request, timeout=22) as response:
                data = response.read()
                content_type = response.headers.get("Content-Type", "")
                assert response.status == 200, (path, response.status)
                assert hashlib.sha256(data).hexdigest() == expected, (
                    path, "body differs from committed static release", len(data), len(local.read_bytes()))
                if path.endswith(".html") or path == "":
                    assert "html" in content_type, (path, content_type)
                if path.endswith(".css"):
                    assert "css" in content_type, (path, content_type)
                if path.endswith((".js", ".mjs")):
                    assert "javascript" in content_type or "ecmascript" in content_type, (path, content_type)
                assert response.geturl().startswith(base), (path, response.geturl())
                print("PASS", path or "/", len(data), expected[:16], flush=True)
                break
        except (HTTPError, URLError, AssertionError, TimeoutError, OSError) as exc:
            last = str(exc)
            if attempt < 21:
                time.sleep(6)
    else:
        raise AssertionError("PUBLIC WEB DELIVERY FAILED " + (path or "/") + ": " + last)
print("PASS all listed exact-byte external Pages routes and assets", flush=True)
