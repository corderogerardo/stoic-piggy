# Maestro E2E Master — Fine-tune Gemma 4

Train Gemma 4 2B (E2B) to write Maestro E2E flows in your project's conventions.

## Architecture

```
┌─────────────────────────────────────────────┐
│  1. Generate dataset from your Maestro flows │
│     (python generate_dataset.py)             │
└──────────────┬──────────────────────────────┘
               ▼
┌─────────────────────────────────────────────┐
│  2. LoRA fine-tune via MLX on Apple Silicon  │
│     (bash train.sh)  ← runs natively on Mac │
└──────────────┬──────────────────────────────┘
               ▼
               ├──▶ 3a. Export for ai/gemma4 Docker image
               │      (bash export_for_docker.sh)
               │
               └──▶ 3b. Export as GGUF + Ollama Modelfile
                      (bash export_for_ollama.sh)
```

## Prerequisites

- **Apple Silicon Mac** (M1/M2/M3/M4) — the training runs on MLX natively
- **Homebrew** — for Python 3.12 if needed
- ~8 GB free RAM (Gemma 4 2B fits in memory on any M-series)

## Quick Start

```bash
# One-shot setup + training
cd maestro-training
bash setup.sh        # installs Python 3.12, creates venv, installs MLX
source .venv/bin/activate
bash train.sh        # LoRA fine-tune (200 iters, ~10-15 min on M2 Pro)
```

## Dataset

The generator (`generate_dataset.py`) creates 36 training examples from:

| Type | Count | Description |
|------|-------|-------------|
| Ground-truth flows | 8 | Your existing Maestro YAML files verbatim |
| Auth screen + variation flows | 11 | Per-tab flows + randomised variations + direct navigation |
| Negative/error tests | 2 | Wrong password, logout flow |
| Navigation flow | 1 | Multi-tab navigation across all screens |
| Keyboard regression | 1 | Keyboard-avoidance behavior (coach send) |
| Smoke test | 1 | Quick allowance CTA tap |
| Performance | 1 | Cold-start timing check |
| Unauth state | 1 | Onboarding screen without login |
| Subflow creation | 3 | Launch, sign-in, dismiss-save-password |
| Multi-turn assistant | 3 | Conversational troubleshooting (dialog handling, cold-start, screen assertions) |
| Concept Q&A | 7 | Explanations of conventions, commands, patterns |

## Training Options

```bash
# Customize training
bash train.sh \
  --model mlx-community/gemma-4-e2b-it-OptiQ-4bit \
  --iters 500 \
  --lr 5e-5 \
  --rank 32

# Test the adapter after training
python test_adapter.py "Write a Maestro E2E flow for the Tasks screen"
```

## Export for Docker Serving

### Option A: Ollama (recommended)

```bash
# Install llama.cpp for GGUF conversion
brew install llama.cpp

# Export
bash export_for_ollama.sh

# Build & run
ollama create stoicpiggy-maestro -f Modelfile
docker run -d --name ollama-maestro -p 11434:11434 \
  -v ~/.ollama:/root/.ollama \
  ollama/ollama
```

### Option B: ai/gemma4 official image

```bash
# Export to SafeTensors format
bash export_for_docker.sh

# Pull and run
docker pull docker.io/ai/gemma4
docker run -it --rm \
  -v "$PWD/exported_model:/model" \
  ai/gemma4
```

## Architecture Decisions

- **Why MLX over Docker for training?** The ai/gemma4 Docker image is built for
  inference only. MLX runs natively on Apple Silicon and provides proper LoRA
  training support.
- **Why LoRA/QLoRA?** Full fine-tuning of 2B parameters would take hours and
  produce a 5 GB+ model. LoRA trains ~0.1% of the weights and produces a 2 MB
  adapter file.
- **Why Gemma 4 2B?** The smallest Gemma 4 variant (2.3B effective params)
  fits comfortably on any Apple Silicon Mac and is sufficient for YAML pattern
  generation.
