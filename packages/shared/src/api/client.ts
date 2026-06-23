import type { CreateTransactionInput } from '../schemas';
import type { PiggyBank, Transaction } from '../types';

export interface ApiClientOptions {
  baseUrl: string;
  getAuthToken?: () => string | null | Promise<string | null>;
  fetchFn?: typeof fetch;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Minimal, fully-typed client for the Stoic Piggy backend.
 * Shared by the landing site, parents dashboard, and the mobile app.
 */
export function createApiClient(options: ApiClientOptions) {
  const fetchFn = options.fetchFn ?? globalThis.fetch;

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const token = options.getAuthToken ? await options.getAuthToken() : null;
    const response = await fetchFn(`${options.baseUrl}${path}`, {
      ...init,
      headers: {
        'content-type': 'application/json',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    });

    if (!response.ok) {
      throw new ApiError(response.status, `Request to ${path} failed with ${response.status}`);
    }

    return (await response.json()) as T;
  }

  return {
    health: () => request<{ status: string }>('/health'),
    listPiggyBanks: (childId: string) => request<PiggyBank[]>(`/children/${childId}/piggy-banks`),
    createTransaction: (input: CreateTransactionInput) =>
      request<Transaction>('/transactions', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
