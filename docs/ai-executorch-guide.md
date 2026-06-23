# On-Device AI for Stoic Piggy — ExecuTorch Fast-Track Guide

A focused guide to learning **ExecuTorch** + **`react-native-executorch`** and applying it to Stoic Piggy. Everything here runs **on the device** — no servers, no per-call cost, and (critically for a kids' app) **kids' photos and chats never leave the phone**.

> Versions referenced: `react-native-executorch` 0.9.x, Expo SDK 56 (our mobile app). APIs evolve — confirm model/constant names in the [API reference](https://docs.swmansion.com/react-native-executorch/docs/api-reference).

---

## TL;DR (read this first)

- **ExecuTorch** is Meta's on-device runtime from the PyTorch Edge ecosystem. You ship a compiled model file (`.pte`) and run it locally. Think *"SQLite, but for AI models."*
- **`react-native-executorch`** wraps it in **declarative React hooks** (`useLLM`, `useObjectDetection`, `useOCR`, `useSpeechToText`, …). No AI/native expertise required.
- It needs the **New Architecture** (we already enabled it) and a **custom dev build** — **Expo Go will not work** (native modules).
- The model you'll use most for Stoic Piggy: a **small LLM** for the coach/task generation (e.g. SmolLM 2, Qwen 3, Hammer 2.1 for tool-calling) and a **vision LLM (VLM)** for photo task verification (LFM2.5-VL, Gemma 4).
- **Golden rule:** the model is a **UX layer, not a source of truth**. It *suggests*; your typed backend (zod + Prisma) *decides* anything involving money or rewards.

---

## 1. Mental model (10 minutes)

```
PyTorch model  ──export──►  model.pte (+ tokenizer)  ──fetch once──►  device
                                                                         │
                              react-native-executorch hook  ◄───────────┘
                              (useLLM / useObjectDetection / …)
                                         │
                              your React Native UI
```

Three things happen:

1. **Get a model.** Use a pre-exported `.pte` from Software Mansion's [HuggingFace](https://huggingface.co/software-mansion) (easiest), bundle your own, or export a custom PyTorch model with ExecuTorch's tooling.
2. **Load it.** The hook fetches the binary (bundled asset, remote URL, or local file), loads it into memory, and exposes `isReady`, `downloadProgress`, and `error`.
3. **Run it.** Call `generate` / `forward` / `sendMessage`. Output streams back as state.

That's the whole loop. The hard parts (C++ runtime, pre/post-processing, delegates like XNNPACK/Core ML) are handled for you.

---

## 2. What it can do (capability map)

| Hook | Task | Stoic Piggy use |
| --- | --- | --- |
| `useLLM` | Text generation, chat, **tool/function calling**, **structured (JSON) output**, **vision (VLM)** | Task coach, AI task generation, debt/credit scenarios, photo verification |
| `useObjectDetection` | Detect objects + bounding boxes (YOLO26, RF-DETR, SSDLite) | Lightweight "is the object there?" checks |
| `useClassification` | Single-label image classification | Quick image category checks |
| `useOCR` / `useVerticalOCR` | Read text from images (EasyOCR) | Scan a price tag / receipt for budgeting lessons |
| `useSpeechToText` | Whisper ASR (voice → text) | Hands-free coach for young, pre-typing kids |
| `useTextToSpeech` | Text → speech | Read tips/scenarios aloud to pre-readers |
| `useTextEmbeddings` / `useImageEmbeddings` | CLIP-style embeddings | RAG grounding, before/after photo similarity |
| `usePrivacyFilter` | Scrub PII from text | Defense-in-depth before anything ever syncs |
| `usePoseEstimation` | Body keypoints | "Do 10 jumping jacks" movement quests |

Full list: [hooks index](https://docs.swmansion.com/react-native-executorch/docs/fundamentals/getting-started).

---

## 3. Set it up in our app (`apps/stoicpiggy`)

We pre-added `react-native-executorch` to the mobile app. Add the Expo resource fetcher + helpers:

```bash
pnpm --filter @stoicpiggy/mobile add react-native-executorch-expo-resource-fetcher expo-file-system expo-asset
# camera/photos for the vision features:
pnpm --filter @stoicpiggy/mobile add expo-image-picker expo-camera
```

**Initialize once** at the app entry (`app/_layout.tsx`), before any model loads:

```tsx
import { initExecutorch } from 'react-native-executorch';
import { ExpoResourceFetcher } from 'react-native-executorch-expo-resource-fetcher';

initExecutorch({ resourceFetcher: ExpoResourceFetcher });
// ...then render your <Stack /> as normal
```

If you bundle `.pte` models as assets (vs. downloading them), allow the extensions in `apps/stoicpiggy/metro.config.js`:

```js
config.resolver.assetExts.push('pte', 'bin');
```

**Build & run** — you need a dev build, not Expo Go:

```bash
pnpm --filter @stoicpiggy/mobile exec expo run:ios -- -d      # real device (iOS release won't run on Simulator)
pnpm --filter @stoicpiggy/mobile exec expo run:android
```

New Architecture is already on (`newArchEnabled: true` in `app.json`), which the library requires.

---

## 4. Picking a model (the decision that matters most)

Smaller = faster + less memory, but lower quality. Start small, only go bigger if quality demands it. Check the [benchmarks](https://docs.swmansion.com/react-native-executorch/docs/benchmarks/inference-time) for real numbers per device.

| Need | Good starting model | Why |
| --- | --- | --- |
| Task coach / hints (text) | **SmolLM 2 (360M / 1.7B)** or **Qwen 3 (0.6B / 1.7B)**, quantized | Tiny, fast, fine for short kid-friendly guidance |
| **Task generation / structured JSON** | **Hammer 2.1 (1.5B)** or **Qwen 3 (4B)** | Hammer is purpose-built for **tool/function calling**; Qwen is strong at structured output |
| **Photo task verification (vision)** | **LFM2.5-VL (1.6B)** or **Gemma 4 (E2B)** | Multimodal — answer questions about an image |
| Object-only check | **YOLO26N** (object detection) | Smallest/fastest; COCO's 80 classes |
| Voice in / out | **Whisper** (`useSpeechToText`) + `useTextToSpeech` | Accessibility for young kids |

Always prefer **quantized** variants on phones to fit memory. Lower-end devices may not fit larger LLMs at all.

---

## 5. Performance & gotchas (save yourself a day)

- **Dev build required.** Expo Go can't load native modules. iOS *release* builds must run on a **real device**, not the Simulator.
- **First load is a download.** Models are tens-to-hundreds of MB. Show `downloadProgress` and cache (the lib stores them in the app's documents dir). Consider bundling the smallest model so the first run works offline.
- **Memory.** One model in memory at a time where possible. Load lazily with `preventLoad` and a "Start" action; don't hold a VLM + LLM simultaneously on a cheap phone.
- **Don't unmount mid-generation.** Call `interrupt()` and wait for `isGenerating === false` before navigating away, or the app can crash.
- **Token batching** is built in (~12 batches/sec) so streaming doesn't thrash React. Tune with `generationConfig`.
- **Latency expectations.** Modern phones do ~30–60 tok/s for small LLMs; VLM image analysis is a few seconds. Design the UX around "thinking…", not instant.
- **Quality.** Small models hallucinate. Keep them **on rails**: constrained system prompts, **structured output**, tool-calling, and optional **RAG** over *your* approved content.

---

## 6. Stoic Piggy AI features (designs + drop-in code)

All snippets go in `apps/stoicpiggy/features/ai/` and lean on the typed schemas in `@stoicpiggy/shared`. Treat them as reference implementations.

### 6.1 ✅ Verify a task with a photo (vision LLM)

**Goal:** kid taps "I did it", snaps a photo, and the app gives instant on-device feedback ("Looks done! 🎉"). **Parent still confirms the reward** — AI assists, humans decide.

**How:** a vision LLM looks at the photo and answers a per-task verification question as structured JSON.

```tsx
// features/ai/useTaskPhotoCheck.ts
import { useCallback } from 'react';
import {
  models,
  useLLM,
  getStructuredOutputPrompt,
  fixAndValidateStructuredOutput,
} from 'react-native-executorch';
import * as z from 'zod/v4';

const verdictSchema = z.object({
  completed: z.boolean().meta({ description: 'Does the photo show the task done?' }),
  confidence: z.number().meta({ description: '0..1 confidence' }),
  reason: z.string().meta({ description: 'One kid-friendly sentence.' }),
});
export type TaskVerdict = z.infer<typeof verdictSchema>;

export function useTaskPhotoCheck() {
  // 1.6B vision-language model; downloads on first use.
  const vlm = useLLM({ model: models.llm.lfm2_5_vl_1_6b() });

  const check = useCallback(
    async (photoUri: string, taskDescription: string): Promise<TaskVerdict> => {
      const system =
        'You verify whether a child completed a chore from a photo. ' +
        'Be encouraging but honest. ' +
        getStructuredOutputPrompt(verdictSchema);

      const response = await vlm.generate([
        { role: 'system', content: system },
        {
          role: 'user',
          content: `Task: "${taskDescription}". Is it done in this photo?`,
          mediaPath: photoUri, // local file path from expo-image-picker / expo-camera
        },
      ]);
      return fixAndValidateStructuredOutput(response, verdictSchema);
    },
    [vlm],
  );

  return { check, isReady: vlm.isReady, downloadProgress: vlm.downloadProgress };
}
```

**Notes:** for narrow checks ("is the toothbrush there?") `useObjectDetection` (YOLO26) is lighter, but it's limited to COCO's 80 classes — the VLM is far more flexible for real chores. Never auto-credit money from the verdict; surface it to the parent.

### 6.2 🧭 AI task coach — "what do I need to do?"

**Goal:** turn a terse task into kid-friendly, step-by-step guidance and answer follow-ups. This replaces the `useOnDeviceCoach` stub we already scaffolded.

```tsx
// features/ai/useTaskCoach.ts
import { useCallback, useEffect } from 'react';
import { models, useLLM, DEFAULT_SYSTEM_PROMPT } from 'react-native-executorch';

const COACH_RULES =
  'You are Penny, a kind money coach for kids aged 6-12. ' +
  'Use short, simple, encouraging sentences. Never ask for personal info. ' +
  'Stay on the topic of the chore or saving money.';

export function useTaskCoach() {
  const llm = useLLM({ model: models.llm.qwen3_0_6b() }); // tiny + fast

  useEffect(() => {
    llm.configure({ chatConfig: { systemPrompt: `${COACH_RULES} ${DEFAULT_SYSTEM_PROMPT}` } });
  }, [llm.configure]);

  const explainTask = useCallback(
    (taskTitle: string) =>
      llm.sendMessage(`Give me 3 short steps to do this chore: "${taskTitle}". Add one cheer at the end.`),
    [llm],
  );

  return {
    explainTask,
    ask: (q: string) => llm.sendMessage(q),
    response: llm.response, // streams token-by-token
    isGenerating: llm.isGenerating,
    isReady: llm.isReady,
  };
}
```

**Level up:** ground answers in *your* house rules with **RAG** — embed an approved "chore & money guide" with `useTextEmbeddings` and inject the top matches into the system prompt so the coach can't drift off-script.

### 6.3 🧱 "What if I borrow?" — debt & credit scenarios

**Goal:** teach the cost of debt through interactive, age-appropriate choose-your-own-adventure scenarios (the Stoic angle: delayed gratification, living within means).

```tsx
// features/ai/useDebtScenario.ts
import { useCallback } from 'react';
import {
  models, useLLM, getStructuredOutputPrompt, fixAndValidateStructuredOutput,
} from 'react-native-executorch';
import * as z from 'zod/v4';

const scenarioSchema = z.object({
  situation: z.string().meta({ description: 'A short money dilemma for a kid.' }),
  choices: z.array(z.object({
    label: z.string(),
    outcome: z.string().meta({ description: 'What happens next, kid-friendly.' }),
    lesson: z.string(),
    xpDelta: z.number().meta({ description: 'Reward/penalty XP, -20..+20' }),
  })).meta({ description: '2-3 choices, including borrowing vs saving.' }),
});
export type DebtScenario = z.infer<typeof scenarioSchema>;

export function useDebtScenario() {
  const llm = useLLM({ model: models.llm.qwen3_4b() });

  const generate = useCallback(async (wantPriceCents: number, savedCents: number): Promise<DebtScenario> => {
    const system =
      'Create a gentle, age-appropriate money lesson about wanting something you cannot afford yet. ' +
      'Show that borrowing means paying back MORE later. No scary debt; teach patience and saving. ' +
      getStructuredOutputPrompt(scenarioSchema);
    const res = await llm.generate([
      { role: 'system', content: system },
      { role: 'user', content: `The kid wants a toy costing $${wantPriceCents / 100} but has $${savedCents / 100}.` },
    ]);
    return fixAndValidateStructuredOutput(res, scenarioSchema);
  }, [llm]);

  return { generate, isReady: llm.isReady };
}
```

Each choice's `xpDelta` and `lesson` can feed a real follow-up savings goal — borrowing leads to a "pay it back" quest, saving unlocks a badge.

### 6.4 🛠️ AI task generation (with structured output / tool calling)

**Goal:** generate a batch of age-appropriate quests tailored to the child (age, level, interests, past completions). Output is **validated against a shared schema** before anything is created — and a **parent approves** before tasks go live.

```tsx
// features/ai/useQuestGenerator.ts
import { useCallback } from 'react';
import {
  models, useLLM, getStructuredOutputPrompt, fixAndValidateStructuredOutput,
} from 'react-native-executorch';
import * as z from 'zod/v4';

// Mirror @stoicpiggy/shared's Quest shape (without server-managed fields).
const generatedQuestSchema = z.object({
  title: z.string().max(60),
  description: z.string().max(160),
  rewardXp: z.number().int().min(0).max(100),
  rewardCents: z.number().int().min(0).max(1000),
});
const questBatchSchema = z.object({ quests: z.array(generatedQuestSchema).max(5) });
export type GeneratedQuest = z.infer<typeof generatedQuestSchema>;

export function useQuestGenerator() {
  const llm = useLLM({ model: models.llm.hammer2_1_1_5b() }); // strong at structured/tool output

  const generate = useCallback(
    async (childAge: number, level: number, interests: string[]): Promise<GeneratedQuest[]> => {
      const system =
        'You design safe, doable chores/quests for kids that build saving habits. ' +
        'Age-appropriate, no money handling, no leaving the house alone. ' +
        getStructuredOutputPrompt(questBatchSchema);
      const res = await llm.generate([
        { role: 'system', content: system },
        { role: 'user', content: `Age ${childAge}, level ${level}, likes: ${interests.join(', ')}.` },
      ]);
      return fixAndValidateStructuredOutput(res, questBatchSchema).quests;
    },
    [llm],
  );

  return { generate, isReady: llm.isReady };
}
```

`useLLM` also supports **real tool calling** (`toolsConfig.tools` + `executeToolCallback`) if you'd rather the model *call* a `createQuest` function than return JSON — handy for "do X, then schedule a follow-up."

---

## 7. Cross-cutting rules for a kids' finance app

1. **On-device = privacy by default.** Children's photos/voice never leave the phone — a big COPPA/GDPR-K win. Lean into it in your marketing and design. For any text that *does* sync, run `usePrivacyFilter` first.
2. **Human-in-the-loop for rewards.** AI verification and AI-generated tasks are **suggestions**; a parent confirms. This prevents false positives and "gaming the AI."
3. **The LLM never touches money math.** Balances, transactions, and goal progress come from the typed backend (`@stoicpiggy/shared` zod + Prisma). The model proposes content; deterministic code executes value changes.
4. **Constrain everything.** Short, explicit system prompts + structured output + (optionally) RAG over approved content. Validate every model output with zod before use.
5. **Graceful degradation.** Models download/fail/run slow. Every AI feature needs a non-AI fallback (manual "mark done", a fixed quest list) so the app works on day one and on a 5-year-old phone.
6. **Keep the seam.** Hide each model behind a hook (like `features/ai/*`) so the UI and tests don't depend on a loaded model, and you can swap models freely.

---

## 8. Fast-track learning path (about a week, part-time)

- **Day 0 — concepts (1–2h).** Read [Getting Started](https://docs.swmansion.com/react-native-executorch/docs/fundamentals/getting-started) + this guide. Understand `.pte`, hooks, dev-build requirement.
- **Day 1 — hello LLM.** Dev build of our app, `initExecutorch`, run `useLLM` with **SmolLM 2 / Qwen 3 0.6B**, render `response`. Watch `downloadProgress`.
- **Day 2 — structured output + tools.** Build `useQuestGenerator` (§6.4). Validate with a shared zod schema. This is the pattern you'll reuse everywhere.
- **Day 3 — vision.** Add `expo-image-picker`, build `useTaskPhotoCheck` (§6.1) with **LFM2.5-VL**. Try `useObjectDetection` (YOLO26) for contrast.
- **Day 4 — polish.** Lazy loading (`preventLoad`), `downloadProgress` UI, `interrupt` on unmount, `usePrivacyFilter`, pick final models from the [benchmarks](https://docs.swmansion.com/react-native-executorch/docs/benchmarks/inference-time).
- **Optional — voice/RAG.** `useSpeechToText` + `useTextToSpeech` for young kids; [React Native RAG](https://blog.swmansion.com/introducing-react-native-rag-fbb62efa4991) to ground the coach.

**Hands-on shortcut:** install **Private Mind** (Software Mansion's on-device chatbot, [iOS](https://apps.apple.com/app/private-mind/id6746713439)) to feel local LLM speed/quality on your own phone before writing code.

---

## 9. Resources

- Docs home: https://docs.swmansion.com/react-native-executorch/
- Getting Started: https://docs.swmansion.com/react-native-executorch/docs/fundamentals/getting-started
- Loading Models: https://docs.swmansion.com/react-native-executorch/docs/fundamentals/loading-models
- `useLLM` (chat, tools, structured output, VLM): https://docs.swmansion.com/react-native-executorch/docs/hooks/natural-language-processing/useLLM
- `useObjectDetection`: https://docs.swmansion.com/react-native-executorch/docs/hooks/computer-vision/useObjectDetection
- Benchmarks (inference time / memory / model size): https://docs.swmansion.com/react-native-executorch/docs/benchmarks/inference-time
- Pre-exported models (HuggingFace): https://huggingface.co/software-mansion
- GitHub: https://github.com/software-mansion/react-native-executorch
- ExecuTorch (Meta / PyTorch Edge): https://pytorch.org/executorch/stable/index.html
