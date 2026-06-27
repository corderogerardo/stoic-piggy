#!/usr/bin/env python3
"""
Test a fine-tuned LoRA adapter by generating a Maestro flow from a prompt.

Usage:
    python test_adapter.py "Write a Maestro E2E flow for the Tasks screen"
    python test_adapter.py --adapter-path ./adapters --model mlx-community/gemma-4-2b-it-4bit
"""

import argparse
import sys

from mlx_lm import load, generate


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("prompt", nargs="?", default="Write a Maestro E2E flow that tests the Tasks screen: sign in as a demo kid, navigate via the tab bar, and verify the screen is visible.",
                        help="The instruction prompt")
    parser.add_argument("--model", default="mlx-community/gemma-4-e2b-it-OptiQ-4bit")
    parser.add_argument("--adapter-path", default="adapters")
    parser.add_argument("--max-tokens", type=int, default=512)
    parser.add_argument("--temperature", type=float, default=0.3)
    args = parser.parse_args()

    # Format prompt for Gemma 4 chat template
    prompt = (
        f"<start_of_turn>user\n{args.prompt}<end_of_turn>\n"
        f"<start_of_turn>model\n"
    )

    print(f"Loading model: {args.model}")
    model, tokenizer = load(args.model, adapter_path=args.adapter_path)

    print(f"Generating (temp={args.temperature}, max_tokens={args.max_tokens})...")
    print("─" * 50)
    print()

    response = generate(
        model,
        tokenizer,
        prompt=prompt,
        max_tokens=args.max_tokens,
        temperature=args.temperature,
        top_p=0.9,
    )

    print(response)
    print()
    print("─" * 50)


if __name__ == "__main__":
    main()
