import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  outDir: 'dist',
  // Inline @stoicpiggy/schemas into the bundle. esbuild can't enumerate an
  // *external* package's exports, so a bare `export *` would emit no CJS named
  // exports and break CJS consumers (the NestJS backend). Bundling keeps schemas
  // as the single source of truth while shipping a self-contained dist.
  noExternal: ['@stoicpiggy/schemas'],
});
