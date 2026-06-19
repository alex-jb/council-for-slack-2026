#!/usr/bin/env bash
# Build docs/case-studies/four-fires-static-demo.pdf
#
# Devpost Fallback #1 from docs/SUBMISSION-RUNBOOK-7-13.md. Compiles the 4
# real /council fires (KILL / GO / WAIT-investor / WAIT-engineer) into one
# self-contained PDF so the submission ships even if the 60s Loom recording
# fails on 7/6 + 7/10 + 7/12.
#
# Pipeline: pandoc → standalone HTML5 → Chrome headless --print-to-pdf.
# Same chain Alex uses for the Jason / Professor / YU Dean decks.
#
# Usage:
#   bash scripts/build-static-demo-pdf.sh
#
# Output:
#   docs/case-studies/four-fires-static-demo.pdf  (~12-15 pages)
#   docs/case-studies/.build/four-fires.html      (intermediate, gitignored)

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CASE_DIR="$REPO_ROOT/docs/case-studies"
BUILD_DIR="$CASE_DIR/.build"
OUT_PDF="$CASE_DIR/four-fires-static-demo.pdf"
OUT_HTML="$BUILD_DIR/four-fires.html"

mkdir -p "$BUILD_DIR"

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
if [ ! -x "$CHROME" ]; then
  echo "❌ Google Chrome not found at $CHROME" >&2
  exit 1
fi

if ! command -v pandoc >/dev/null 2>&1; then
  echo "❌ pandoc not on PATH" >&2
  exit 1
fi

TITLE_MD="$BUILD_DIR/00-title.md"
cat > "$TITLE_MD" <<'EOF'
---
title: "Council for Slack — Four Real Fires"
subtitle: "Devpost Fallback Demo · 2026-07"
---

# Council for Slack

## Four real `council.deliberate()` fires

> Devpost submission Fallback #1. Each section is a real fire from the
> Council for Slack production database on the `AJ Bot` workspace, 2026-06-15
> through 2026-06-16. No fixtures, no synthetic data. Cost per fire: ~$0.03.
> Latency: 6-10 seconds for 5 parallel Anthropic Sonnet 4.6 persona calls.

The four cases below span the full **GO → WAIT → KILL** verdict spectrum.
The shape of the question determined the shape of the verdict — not the
other way around. That's the calibration claim, and it is the differentiator
vs every single-LLM "should I do X" answer.

| # | Case | Domain | Verdict | Agreement | Voice spread |
|---|---|---|---|---|---|
| 1 | Crypto payments on B2B SaaS | founder | **KILL** | **0.94** | 4 → 12 (tightest) |
| 2 | Annual billing at 2 months free | founder | **GO** | 0.89 | 72 → 88 |
| 3 | GOOGL Q3 2026 — Druckenmiller vs Berkshire | investor | **WAIT** | 0.78 | 38 → 72 |
| 4 | Rust rewrite of Python inference router | engineer | **WAIT** | 0.62 | 22 → 72 (widest) |

**Agreement range: 0.62 → 0.94. Voice spread range: 8 → 50 points.**

A single case study is a demo. A quartet is a calibration claim.

---

EOF

# Concatenate in the order from the README at-a-glance table
echo "→ Concatenating 4 case studies via pandoc..."
pandoc \
  "$TITLE_MD" \
  "$CASE_DIR/crypto-payments-2026-06.md" \
  "$CASE_DIR/annual-billing-2026-06.md" \
  "$CASE_DIR/googl-q3-2026.md" \
  "$CASE_DIR/rust-rewrite-2026-06.md" \
  -f markdown \
  -t html5 \
  --standalone \
  --metadata title="Council for Slack — Four Real Fires" \
  --css="data:text/css;base64,$(base64 < "$REPO_ROOT/scripts/pdf-print.css" | tr -d '\n')" \
  -o "$OUT_HTML"

echo "→ Rendering PDF via Chrome headless..."
"$CHROME" \
  --headless \
  --disable-gpu \
  --no-pdf-header-footer \
  --print-to-pdf="$OUT_PDF" \
  "file://$OUT_HTML" \
  2>/dev/null

if [ ! -s "$OUT_PDF" ]; then
  echo "❌ PDF render failed — output empty" >&2
  exit 1
fi

SIZE=$(du -h "$OUT_PDF" | cut -f1)
echo "✅ Wrote $OUT_PDF ($SIZE)"
echo ""
echo "Next steps for Devpost:"
echo "  1. Upload PDF to GitHub release or paste into Devpost description"
echo "  2. Link in submission description as: 'Live demo deferred — see four-fires-static-demo.pdf'"
echo "  3. Keep regenerating from this script if case studies change"
