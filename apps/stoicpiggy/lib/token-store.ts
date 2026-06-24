import * as SecureStore from 'expo-secure-store';

// The kid's bearer token, kept in memory for synchronous `getToken()` reads on
// every request and persisted to the device keychain via expo-secure-store.

const KEY = 'stoicpiggy_kid_token';

let token: string | null = null;

/** Synchronous getter handed to `ApiProvider`. */
export function getToken(): string | null {
  return token;
}

/** Load the persisted token into memory once on app start. */
export async function loadToken(): Promise<string | null> {
  try {
    token = await SecureStore.getItemAsync(KEY);
  } catch {
    token = null;
  }
  return token;
}

/** Persist (or clear) the token in memory + the keychain. */
export async function setToken(next: string | null): Promise<void> {
  token = next;
  try {
    if (next) await SecureStore.setItemAsync(KEY, next);
    else await SecureStore.deleteItemAsync(KEY);
  } catch {
    // Keychain can be unavailable (e.g. web / tests) — in-memory token still works.
  }
}
