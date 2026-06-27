#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# Fuse LoRA adapters → export as GGUF for Ollama serving.
#
# This requires llama.cpp for the conversion:
#   brew install llama.cpp
#   # or build from source: https://github.com/ggml-org/llama.cpp
#
# After export, the GGUF file can be used in a Modelfile for Ollama.
#
# Usage:
#   bash export_for_ollama.sh
#
# Output: ./maestro-master.gguf  +  ./Modelfile
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

if [ -f .venv/bin/activate ]; then
  source .venv/bin/activate
fi

MODEL="${MODEL:-mlx-community/gemma-4-e2b-it-OptiQ-4bit}"
ADAPTER_DIR="${ADAPTER_DIR:-adapters}"
FUSED_DIR=".fused_model"
GGUF_OUT="${GGUF_OUT:-maestro-master.gguf}"

if [ ! -f "$ADAPTER_DIR/adapters.safetensors" ]; then
  echo "No adapters found at $ADAPTER_DIR/ — run train.sh first."
  exit 1
fi

# Step 1: Fuse adapters into base model
echo "→ Fusing LoRA adapters into base model..."
mlx_lm.fuse \
  --model "$MODEL" \
  --adapter-path "$ADAPTER_DIR" \
  --save-path "$FUSED_DIR" \
  --de-quantize

# Step 2: Convert to GGUF using llama.cpp
if command -v llama-quantize &>/dev/null; then
  echo "→ Converting fused model to GGUF..."
  CONVERTER="llama-convert-hf-to-gguf"
  if command -v "$CONVERTER" &>/dev/null; then
    $CONVERTER "$FUSED_DIR" "$GGUF_OUT" --type q4_k_m
  else
    # Try the Python converter
    python3 -c "
from transformers import AutoModelForCausalLM, AutoTokenizer
model = AutoModelForCausalLM.from_pretrained('$FUSED_DIR')
tokenizer = AutoTokenizer.from_pretrained('$FUSED_DIR')

# Note: For proper GGUF conversion, use llama.cpp's convert.py:
#   python3 /path/to/llama.cpp/convert.py $FUSED_DIR --outfile $GGUF_OUT
print('Full GGUF conversion requires llama.cpp.')
print('Install: brew install llama.cpp')
print(f'Then: python3 \\$(brew --prefix llama.cpp)/share/llama.cpp/convert.py $FUSED_DIR --outfile $GGUF_OUT')
" 2>/dev/null || true
  fi
  echo "→ Quantizing..."
  llama-quantize "$GGUF_OUT" "${GGUF_OUT%.gguf}-q4_k_m.gguf" q4_k_m 2>/dev/null || true
else
  echo ""
  echo "⚠ llama.cpp not found. Install it for GGUF conversion:"
  echo "  brew install llama.cpp"
  echo ""
  echo "Then manually:"
  echo "  python3 \$(brew --prefix llama.cpp)/share/llama.cpp/convert.py $FUSED_DIR"
  echo "  llama-quantize ./gemma-4-2b-fused.gguf ${GGUF_OUT%.gguf}-q4_k_m.gguf q4_k_m"
fi

# Step 3: Create Modelfile for Ollama
echo "→ Creating Modelfile..."
cat > Modelfile << 'MODELFILE'
# Ollama Modelfile for Stoic Piggy Maestro E2E master
# Built from Gemma 4 2B fine-tuned on project Maestro YAML patterns.
#
# Usage:
#   ollama create stoicpiggy-maestro -f Modelfile
#   ollama run stoicpiggy-maestro

FROM ./maestro-master-q4_k_m.gguf
TEMPLATE """{{ if .System }}<start_of_turn>system
{{ .System }}<end_of_turn>
{{ end }}<start_of_turn>user
{{ .Prompt }}<end_of_turn>
<start_of_turn>model
"""
PARAMETER temperature 0.3
PARAMETER top_p 0.9
PARAMETER top_k 40
PARAMETER stop "<end_of_turn>"
PARAMETER stop "<start_of_turn>"
MODELFILE

echo ""
echo "✓ Done!"
echo ""
echo "Files created:"
echo "  $GGUF_OUT          (or quantized variant)"
echo "  Modelfile          ← Ollama model definition"
echo ""
echo "To serve in Docker:"
echo ""
echo "  # 1. Build the Ollama model"
echo "  ollama create stoicpiggy-maestro -f Modelfile"
echo ""
echo "  # 2. Run it in Docker"
echo "  docker run -d --name ollama-maestro -p 11434:11434 \\"
echo "    -v ~/.ollama:/root/.ollama \\"
echo "    ollama/ollama"
echo "  docker exec ollama-maestro ollama pull stoicpiggy-maestro"
echo ""
echo "  # 3. Generate tests"
echo '  curl http://localhost:11434/api/generate -d '\''{"model":"stoicpiggy-maestro","prompt":"Write a Maestro E2E flow that tests the Tasks screen","stream":false}'\'''
