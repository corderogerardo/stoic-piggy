// A tiny module-level token holder shared by the tRPC client's `getToken` and the
// auth context. Keeping it outside React lets `ApiProvider` read the latest token
// synchronously on every request without caring where the provider sits in the tree.

const STORAGE_KEY = 'stoicpiggy.parent.token';

let token: string | null = null;

/** Hydrate the in-memory token from localStorage (browser only). Call once on load. */
export function loadToken(): string | null {
  if (typeof window !== 'undefined') {
    token = window.localStorage.getItem(STORAGE_KEY);
  }
  return token;
}

/** Synchronous getter handed to `ApiProvider` — runs on every request. */
export function getToken(): string | null {
  return token;
}

/** Persist (or clear) the token both in memory and in localStorage. */
export function setToken(next: string | null): void {
  token = next;
  if (typeof window === 'undefined') return;
  if (next) window.localStorage.setItem(STORAGE_KEY, next);
  else window.localStorage.removeItem(STORAGE_KEY);
}

// Hydrate eagerly so the very first request carries the saved token.
loadToken();
