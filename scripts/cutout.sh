#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$project_root"

mkdir -p public/media/cutouts

if [[ ! -x .venv/bin/rembg ]]; then
  echo "Missing .venv/bin/rembg. Run: python3 -m venv .venv && .venv/bin/pip install 'rembg[cpu,cli]' onnxruntime" >&2
  exit 1
fi

.venv/bin/rembg i \
  public/media/raw/tower-hero.jpg \
  public/media/cutouts/tower-hero.png

echo "Created public/media/cutouts/tower-hero.png"
