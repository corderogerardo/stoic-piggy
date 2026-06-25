// Schemas now live in @stoicpiggy/schemas (the single source of truth, also used
// by the form layer). Re-exported here so existing `@stoicpiggy/shared` imports
// across the backend, api, and web apps keep working unchanged.
export * from '@stoicpiggy/schemas';
