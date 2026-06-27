#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# Fuse LoRA adapters into base model + export to Hugging Face SafeTensors format.
# The resulting model can be mounted into the `ai/gemma4` Docker serving image.
#
# Usage:
#   bash export_for_docker.sh
#
# Output: ./exported_model/  ← mount this into your Docker container
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

if [ -f .venv/bin/activate ]; then
  source .venv/bin/activate
fi

MODEL="${MODEL:-mlx-community/gemma-4-e2b-it-OptiQ-4bit}"
ADAPTER_DIR="${ADAPTER_DIR:-adapters}"
EXPORT_DIR="${EXPORT_DIR:-exported_model}"

if [ ! -f "$ADAPTER_DIR/adapters.safetensors" ]; then
  echo "No adapters found at $ADAPTER_DIR/ — run train.sh first."
  exit 1
fi

echo "→ Fusing LoRA adapters into base model..."
echo "  Base:     $MODEL"
echo "  Adapters: $ADAPTER_DIR/"
echo "  Output:   $EXPORT_DIR/"

# Fuse the LoRA weights into the base model
mlx_lm.fuse \
  --model "$MODEL" \
  --adapter-path "$ADAPTER_DIR" \
  --save-path "$EXPORT_DIR" \
  --de-quantize

echo ""
echo "✓ Model exported to: $EXPORT_DIR/"
echo ""
echo "To serve with the Docker image:"
echo ""
echo "  docker run -it --rm \\"
echo "    -v \"$EXPORT_DIR:/model\" \\"
echo "    ai/gemma4 \\"
echo '    "Write a Maestro E2E flow for the Tasks screen"'
echo ""
echo "Note: The ai/gemma4 image expects the model at a specific path."
echo "Check the image docs for the exact mount convention:"
echo "  https://hub.docker.com/r/ai/gemma4"
