import type { ChildPatterns } from '@stoicpiggy/shared';
import { useCallback } from 'react';
import { isAvailable, type Message, QWEN3_0_6B_QUANTIZED, useLLM } from 'react-native-executorch';
import { coachSystemPrompt, type Lang } from './coach';

// Qwen3 0.6B (quantized): small, multilingual (ES/EN) — a good fit for a kid
// coach that must run on-device for free. ~300MB download, fetched lazily.
const MODEL = QWEN3_0_6B_QUANTIZED;

/**
 * Tier 2 coach: a free, on-device LLM. No API calls, no tokens billed.
 *
 * `preventLoad` keeps the model from downloading until `enabled` flips true (the
 * kid opts in), so we never pull ~300MB onto a phone unprompted. `ask` returns
 * `null` whenever the model can't answer — the caller falls back to the Tier 1
 * template, so the coach always replies.
 */
export function useCoachLLM(enabled: boolean, patterns: ChildPatterns | undefined, lang: Lang) {
  const llm = useLLM({ model: MODEL, preventLoad: !enabled || !isAvailable });

  const ask = useCallback(
    async (question: string): Promise<string | null> => {
      if (!isAvailable || !llm.isReady) return null;
      const messages: Message[] = [
        { role: 'system', content: coachSystemPrompt(patterns, lang) },
        { role: 'user', content: question },
      ];
      try {
        const out = await llm.generate(messages);
        return out.trim() || null;
      } catch {
        return null; // ponytail: any inference failure → caller uses the template
      }
    },
    [llm, patterns, lang],
  );

  return {
    ask,
    /** Native runtime present + model loaded + not mid-generation. */
    ready: isAvailable && llm.isReady,
    available: isAvailable,
    isGenerating: llm.isGenerating,
    downloadProgress: llm.downloadProgress,
  };
}
