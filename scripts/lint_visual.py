#!/usr/bin/env python3
import json
import sys
from pathlib import Path

FORBIDDEN_PATTERNS = [
    "eval(",
    "new Function(",
    "document.",
    "window.parent",
    "localStorage",
    "sessionStorage",
    "fetch(",
    "XMLHttpRequest",
    "WebSocket",
    "import(",
    "<script",
    "while (true)",
    "for (;;)",
]

ALLOWED_ENGINES = {"p5", "hydra"}
ALLOWED_ASPECTS = {"landscape", "portrait", "square", "ultrawide"}
REQUIRED_METADATA = {"id", "title", "engine", "created_at", "prompt", "author", "status"}


def fail(message: str) -> None:
    print(f"lint_visual: {message}", file=sys.stderr)
    raise SystemExit(1)


def load_json(path: Path) -> dict:
    try:
        return json.loads(path.read_text())
    except FileNotFoundError:
        fail(f"missing file: {path}")
    except json.JSONDecodeError as exc:
        fail(f"invalid JSON in {path}: {exc}")



def scan_js(path: Path) -> None:
    content = path.read_text()
    for pattern in FORBIDDEN_PATTERNS:
        if pattern in content:
            fail(f"forbidden pattern {pattern!r} found in {path}")



def main() -> None:
    if len(sys.argv) != 2:
        fail("usage: python3 scripts/lint_visual.py <visual-id>")

    repo_root = Path(__file__).resolve().parent.parent
    visual_id = sys.argv[1]
    sketch_dir = repo_root / "sketches" / visual_id
    if not sketch_dir.is_dir():
        fail(f"missing sketch directory: {sketch_dir}")

    metadata_path = sketch_dir / "sketch.json"
    js_path = sketch_dir / "sketch.js"
    metadata = load_json(metadata_path)

    missing = sorted(REQUIRED_METADATA - set(metadata))
    if missing:
        fail(f"metadata missing required keys: {', '.join(missing)}")
    if metadata["id"] != visual_id:
        fail(f"metadata id {metadata['id']!r} does not match {visual_id!r}")
    if metadata["engine"] not in ALLOWED_ENGINES:
        fail(f"unsupported engine: {metadata['engine']!r}")

    if not js_path.is_file():
        fail(f"missing sketch.js: {js_path}")
    scan_js(js_path)

    variants = []
    for variant_path in sorted(sketch_dir.glob("sketch.*.js")):
        parts = variant_path.name.split(".")
        if len(parts) != 3:
            fail(f"unexpected variant filename: {variant_path.name}")
        aspect = parts[1]
        if aspect not in ALLOWED_ASPECTS:
            fail(f"unsupported variant aspect {aspect!r} in {variant_path.name}")
        scan_js(variant_path)
        variants.append(aspect)

    print(json.dumps({
        "ok": True,
        "id": visual_id,
        "engine": metadata["engine"],
        "variants": variants,
    }))


if __name__ == "__main__":
    main()
