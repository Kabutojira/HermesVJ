#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "usage: ./scripts/create_visual.sh \"your visual prompt\"" >&2
  exit 1
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROMPT="$*"

if command -v hermes >/dev/null 2>&1; then
  HERMES_BIN="$(command -v hermes)"
elif [ -x /opt/data/home/venvs/hermes-cli/bin/hermes ]; then
  HERMES_BIN="/opt/data/home/venvs/hermes-cli/bin/hermes"
else
  echo "create_visual: hermes CLI not found in PATH and fallback binary missing" >&2
  exit 1
fi

read -r -d '' QUERY <<EOF || true
You are working inside the HermesVJ repository at ${REPO_ROOT}.
Read and follow these repo-local skills in order:
1. ${REPO_ROOT}/hermes/skills/update-graphics/SKILL.md
2. ${REPO_ROOT}/hermes/skills/hermesvj/SKILL.md

User request: create visual: ${PROMPT}

Do the full job end-to-end in this repository:
- inspect current visuals and at least one recent preview or sketch
- derive a stronger internal art brief than the raw prompt
- generate a better-looking new visual
- lint it
- if available, run node scripts/capture_visual_preview.mjs <id> before publishing and allow one refinement pass if the preview is still generic or muddy
- publish it
- push it
- return the new visual id, title, and the one-command operator command for future runs

Do not ask follow-up questions unless a hard blocker prevents publishing.
EOF

exec "$HERMES_BIN" chat \
  -Q \
  -t terminal,file,skills,vision,browser,todo,session_search \
  -q "$QUERY"
