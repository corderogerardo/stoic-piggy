#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# LoRA fine-tune Gemma 4 2B (E2B) on Maestro E2E patterns using MLX.
# Runs natively on Apple Silicon — no Docker needed for training.
#
# After training, convert adapters for Docker serving:
#   bash export_for_ollama.sh    # → exports GGUF for Ollama
#   bash export_for_docker.sh    # → exports to HF format for ai/gemma4 image
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# ── activate venv ──
if [ -f .venv/bin/activate ]; then
  source .venv/bin/activate
fi

# ── configuratio ──
MODEL="${MODEL:-mlx-community/gemma-4-e2b-it-OptiQ-4bit}"
DATASET="${DATASET:-dataset.jsonl}"
ADAPTER_DIR="${ADAPTER_DIR:-adapters}"
ITERS="${ITERS:-200}"
LR="${LR:-1e-4}"
LORA_RANK="${LORA_RANK:-16}"
BATCH_SIZE="${BATCH_SIZE:-4}"
STEPS_PER_EVAL="${STEPS_PER_EVAL:-50}"
SEED="${SEED:-42}"
HF_TOKEN="${HF_TOKEN:-}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --model)    MODEL="$2";   shift 2 ;;
    --iters)    ITERS="$2";   shift 2 ;;
    --dataset)  DATASET="$2"; shift 2 ;;
    --lr)       LR="$2";      shift 2 ;;
    --rank)     LORA_RANK="$2"; shift 2 ;;
    --batch)    BATCH_SIZE="$2"; shift 2 ;;
    *)          echo "Unknown: $1"; exit 1 ;;
  esac
done

# ── validate ──
if [ ! -f "$DATASET" ]; then
  echo "Dataset not found: $DATASET — run: python generate_dataset.py"
  exit 1
fi
if ! python3 -c "import mlx_lm" 2>/dev/null; then
  echo "mlx_lm not found — run: bash setup.sh"
  exit 1
fi

# ── convert JSONL messages format → MLX text format ──
echo "→ Converting dataset to MLX text format..."
TEXT_DATA=".tmp_text.jsonl"
TRAIN_DATA=".tmp_train.jsonl"
VAL_DATA=".tmp_val.jsonl"

python3 -c "
import json
with open('$DATASET') as f:
    lines = [json.loads(l) for l in f if l.strip()]
with open('$TEXT_DATA', 'w') as out:
    for ex in lines:
        parts = []
        for msg in ex:
            if msg['role'] == 'user':
                parts.append(f'<start_of_turn>user\\n{msg[\"content\"]}<end_of_turn>\\n')
            elif msg['role'] == 'assistant':
                parts.append(f'<start_of_turn>model\\n{msg[\"content\"]}<end_of_turn>\\n')
        out.write(json.dumps({'text': ''.join(parts)}) + '\\n')

with open('$TEXT_DATA') as f:
    data = [json.loads(l) for l in f]
split = int(len(data) * 0.9)
with open('$TRAIN_DATA', 'w') as f:
    for d in data[:split]:
        f.write(json.dumps(d) + '\\n')
with open('$VAL_DATA', 'w') as f:
    for d in data[split:]:
        f.write(json.dumps(d) + '\\n')
print(f'  Train: {split}, Val: {len(data) - split}')
"

# ── train ──
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Model:     $MODEL"
echo "  Dataset:   $DATASET ($(wc -l < "$DATASET") examples)"
echo "  Iters:     $ITERS   LR: $LR   Rank: $LORA_RANK   Batch: $BATCH_SIZE"
echo "  Adapters → $ADAPTER_DIR/"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

HF_TOKEN_ARG=""
[ -n "$HF_TOKEN" ] && HF_TOKEN_ARG="--hf-token $HF_TOKEN"

mlx_lm.lora \
  --model "$MODEL" \
  --train \
  --data "$TRAIN_DATA" \
  --val-data "$VAL_DATA" \
  --iters "$ITERS" \
  --batch-size "$BATCH_SIZE" \
  --lora-rank "$LORA_RANK" \
  --learning-rate "$LR" \
  --steps-per-eval "$STEPS_PER_EVAL" \
  --seed "$SEED" \
  --adapter-path "$ADAPTER_DIR" \
  $HF_TOKEN_ARG

echo ""
echo "✓ Training complete!"
echo "  Adapters: $ADAPTER_DIR/"
echo ""
echo "Next:"
echo "  Test with:   mlx_lm.generate --model $MODEL --adapter-path $ADAPTER_DIR \\"
echo "    --prompt \"<start_of_turn>user\\nWrite a Maestro E2E flow that tests the Tasks screen<end_of_turn>\\n<start_of_turn>model\\n\""
echo "  Export:      bash export_for_ollama.sh"
echo "  Export:      bash export_for_docker.sh"
