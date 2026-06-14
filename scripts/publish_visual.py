#!/usr/bin/env python3
import json
import subprocess
import sys
from pathlib import Path


def fail(message: str) -> None:
    print(f"publish_visual: {message}", file=sys.stderr)
    raise SystemExit(1)



def run(command: list[str], repo_root: Path) -> None:
    result = subprocess.run(command, cwd=repo_root)
    if result.returncode != 0:
        fail(f"command failed: {' '.join(command)}")



def load_json(path: Path) -> dict:
    try:
        return json.loads(path.read_text())
    except FileNotFoundError:
        fail(f"missing file: {path}")
    except json.JSONDecodeError as exc:
        fail(f"invalid JSON in {path}: {exc}")



def detect_variants(sketch_dir: Path) -> list[dict]:
    variants = []
    dimensions = {
        "landscape": (1920, 1080),
        "portrait": (1080, 1920),
        "square": (1080, 1080),
        "ultrawide": (2560, 1080),
    }
    for aspect, (width, height) in dimensions.items():
        path = sketch_dir / f"sketch.{aspect}.js"
        if path.is_file():
            variants.append({
                "name": aspect,
                "path": str(path.relative_to(sketch_dir.parent.parent)).replace('\\', '/'),
                "width": width,
                "height": height,
                "aspect": aspect,
            })
    return variants



def main() -> None:
    if len(sys.argv) != 2:
        fail("usage: python3 scripts/publish_visual.py <visual-id>")

    repo_root = Path(__file__).resolve().parent.parent
    visual_id = sys.argv[1]
    sketch_dir = repo_root / "sketches" / visual_id
    metadata_path = sketch_dir / "sketch.json"
    sketch_path = sketch_dir / "sketch.js"
    manifest_path = repo_root / "manifest.json"

    if not sketch_dir.is_dir():
        fail(f"missing sketch directory: {sketch_dir}")
    if not sketch_path.is_file():
        fail(f"missing sketch.js: {sketch_path}")

    metadata = load_json(metadata_path)
    manifest = load_json(manifest_path)

    entry = {
        "id": metadata["id"],
        "title": metadata["title"],
        "engine": metadata["engine"],
        "path": str(sketch_path.relative_to(repo_root)).replace('\\', '/'),
        "metadata": str(metadata_path.relative_to(repo_root)).replace('\\', '/'),
        "created_at": metadata["created_at"],
        "prompt": metadata["prompt"],
    }

    variants = detect_variants(sketch_dir)
    if variants:
        entry["variants"] = variants

    sketches = [item for item in manifest.get("sketches", []) if item.get("id") != visual_id]
    sketches.append(entry)
    manifest["version"] = manifest.get("version", 1)
    manifest["latest"] = visual_id
    manifest["sketches"] = sketches
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")

    slug = visual_id.split("-", 5)[-1]
    run(["git", "add", str(manifest_path.relative_to(repo_root)), str(sketch_dir.relative_to(repo_root))], repo_root)
    run(["git", "commit", "-m", f"visual: add {slug}"], repo_root)
    run(["git", "push", "origin", "main"], repo_root)

    print(json.dumps({
        "ok": True,
        "id": visual_id,
        "commit": f"visual: add {slug}",
    }))


if __name__ == "__main__":
    main()
