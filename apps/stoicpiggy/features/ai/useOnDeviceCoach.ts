import { useCallback, useState } from 'react';

/**
 * On-device AI "money coach" powered by ExecuTorch (react-native-executorch).
 *
 * This is a typed seam so the rest of the app can build against a stable
 * interface today. To run a real on-device model, import `useLLM` from
 * 'react-native-executorch', load a model/tokenizer source, and stream tokens
 * into `tip` / out of `ask`. Keeping the native call behind this hook means the
 * UI and tests don't depend on a loaded model.
 */
export interface OnDeviceCoach {
  tip: string;
  isReady: boolean;
  ask: (prompt: string) => Promise<string>;
}

const STARTER_TIPS = [
  'Save a little every week — small habits compound.',
  'Name your goal. A piggy bank with a purpose fills faster.',
  'Wait a day before a big spend. Future-you will thank you.',
] as const;

export function useOnDeviceCoach(): OnDeviceCoach {
  const [tip] = useState<string>(
    () => STARTER_TIPS[Math.floor(Math.random() * STARTER_TIPS.length)] ?? STARTER_TIPS[0],
  );

  const ask = useCallback(async (prompt: string): Promise<string> => {
    // TODO: replace with react-native-executorch `useLLM(...)` generation.
    return `Coach is thinking about "${prompt}"…`;
  }, []);

  return { tip, isReady: true, ask };
}
