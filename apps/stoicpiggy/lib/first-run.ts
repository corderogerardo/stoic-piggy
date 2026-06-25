import * as SecureStore from 'expo-secure-store';

// Whether the kid has seen the one-time intro. Persisted so onboarding shows
// only on the very first launch. Not a secret, but SecureStore is already wired
// and avoids adding an async-storage dependency just for one boolean.

const KEY = 'stoicpiggy_onboarding_seen';

/** Read the flag on app start. Defaults to false (show onboarding) on any error. */
export async function loadOnboardingSeen(): Promise<boolean> {
  try {
    return (await SecureStore.getItemAsync(KEY)) === '1';
  } catch {
    return false;
  }
}

/** Mark the intro as seen so it never shows again. */
export async function setOnboardingSeen(): Promise<void> {
  try {
    await SecureStore.setItemAsync(KEY, '1');
  } catch {
    // Storage unavailable (web/tests) — worst case the intro shows again.
  }
}
