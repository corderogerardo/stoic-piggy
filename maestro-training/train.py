"""
Fine-tune Gemma 4 (or any Gemma variant) with LoRA via MLX on a Maestro E2E dataset.
Runs natively on Apple Silicon — no Docker or CUDA needed.

Usage:
    python train.py                          # uses default dataset.jsonl + Gemma 4
    python train.py --model google/gemma-4-4b-it --dataset mydata.jsonl --iters 500
"""

import json
import time
import argparse
from pathlib import Path

from mlx_lm import load, generate
from mlx_lm.tuner import LoRATuningConfig, train_model
from mlx_lm.utils import save_config

BASE_DIR = Path(__file__).parent


def load_dataset(path: str) -> list[dict]:
    """Load JSONL with each line as a `messages` array (chat format)."""
    data = []
    with open(path) as f:
        for line in f:
            data.append(json.loads(line.strip()))
    print(f"Loaded {len(data)} examples from {path}")
    return data


def to_text(example: list[dict]) -> str:
    """
    Convert a messages array to a prompt-completion string for MLX.
    Uses a simple chat format that works well with Gemma's tokenizer.
    """
    parts = []
    for msg in example:
        role = msg["role"]
        content = msg["content"]
        if role == "user":
            parts.append(f"<start_of_turn>user\n{content}<end_of_turn>\n")
        elif role == "assistant":
            parts.append(f"<start_of_turn>model\n{content}<end_of_turn>\n")
        else:
            parts.append(f"{content}\n")
    return "".join(parts)


def format_text(example: list[dict]) -> str:
    """
    MLX LoRA trainer expects examples with a prompt-completion format.
    We return the full text; the trainer will split at the first `<end_of_turn>`
    or we provide an explicit `train` function that handles the split.
    """
    # For the default MLX LoRA trainer: concatenate user + assistant,
    # store in a list of {"text": "..."} dicts.
    return to_text(example)


def prepare_data(dataset: list[dict]) -> list[dict]:
    """Convert messages-format to MLX text format."""
    return [{"text": format_text(ex)} for ex in dataset]


def main():
    parser = argparse.ArgumentParser(description="LoRA fine-tune Gemma 4 on Maestro E2E patterns")
    parser.add_argument("--model", default="mlx-community/gemma-4-e2b-it-OptiQ-4bit",
                        help="Hugging Face or MLX Hub model ID (4-bit quantized recommended)")
    parser.add_argument("--dataset", default=str(BASE_DIR / "dataset.jsonl"),
                        help="Path to JSONL dataset file")
    parser.add_argument("--iters", type=int, default=200,
                        help="Number of training iterations")
    parser.add_argument("--steps-per-eval", type=int, default=50,
                        help="Steps between eval and checkpoint saves")
    parser.add_argument("--lr", type=float, default=1e-4,
                        help="Learning rate for LoRA")
    parser.add_argument("--lora-rank", type=int, default=16,
                        help="LoRA rank (r)")
    parser.add_argument("--lora-alpha", type=float, default=32.0,
                        help="LoRA alpha scaling")
    parser.add_argument("--batch-size", type=int, default=4,
                        help="Per-device batch size")
    parser.add_argument("--adapter-path", default=str(BASE_DIR / "adapters"),
                        help="Where to save the LoRA adapter weights")
    parser.add_argument("--hf-token", default=None,
                        help="Hugging Face token for gated models (Gemma 4 is gated)")
    args = parser.parse_args()

    # ── Load dataset ──
    raw = load_dataset(args.dataset)
    data = prepare_data(raw)

    # Split
    split = int(len(data) * 0.9)
    train_data, val_data = data[:split], data[split:]
    print(f"Train: {len(train_data)}, Val: {len(val_data)}")

    # ── Load model ──
    print(f"Loading model: {args.model} ...")
    model, tokenizer = load(
        args.model,
        token=args.hf_token,
    )
    print("Model loaded.")

    # ── LoRA config ──
    lora_config = LoRATuningConfig(
        rank=args.lora_rank,
        alpha=args.lora_alpha,
        scale=args.lora_alpha / args.lora_rank,
        dropout=0.05,
    )

    # ── Training ──
    print(f"Starting LoRA training for {args.iters} iterations ...")
    start = time.time()

    train_model(
        model=model,
        tokenizer=tokenizer,
        args=args,  # passes through --iters, --batch-size, --lr, etc.
        train_data=train_data,
        val_data=val_data,
        lora_config=lora_config,
        adapter_path=args.adapter_path,
    )

    elapsed = time.time() - start
    print(f"Training complete in {elapsed:.1f}s")
    print(f"LoRA adapters saved to {args.adapter_path}")


if __name__ == "__main__":
    main()
