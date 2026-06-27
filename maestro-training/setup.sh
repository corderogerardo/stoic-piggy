#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# Setup — install Python 3.12 (if missing), create venv, install MLX + deps.
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "━━━━━━ Stoic Piggy Maestro Trainer — Setup ━━━━━━"

# 1. Ensure Python 3.12 is available
PYTHON=""
for candidate in python3.12 python3.13 python3; do
  if command -v "$candidate" &>/dev/null; then
    ver=$("$candidate" --version 2>&1 | awk '{print $2}' | cut -d. -f1-2)
    major=$(echo "$ver" | cut -d. -f1)
    minor=$(echo "$ver" | cut -d. -f2)
    if [ "$major" -ge 3 ] && [ "$minor" -ge 10 ]; then
      PYTHON="$candidate"
      break
    fi
  fi
done

if [ -z "$PYTHON" ]; then
  echo "→ Installing Python 3.12 via Homebrew..."
  brew install python@3.12
  PYTHON="$(brew --prefix python@3.12)/bin/python3.12"
fi

echo "Using: $($PYTHON --version)"

# 2. Create virtual environment
if [ ! -d .venv ]; then
  echo "→ Creating virtual environment..."
  "$PYTHON" -m venv .venv
fi
source .venv/bin/activate

# 3. Install dependencies
echo "→ Installing MLX + dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# 4. Generate dataset
echo "→ Generating training dataset from Maestro flows..."
python generate_dataset.py --output dataset.jsonl

echo ""
echo "✓ Setup complete!"
echo ""
echo "Next step:"
echo "  source .venv/bin/activate"
echo "  bash train.sh"
