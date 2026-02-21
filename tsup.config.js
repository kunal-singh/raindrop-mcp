import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/main.ts'],
  format: ['cjs', 'esm'],
  dts: true,           // generates .d.ts via tsc internally
  sourcemap: true,
  clean: true,         // cleans dist before each build
  splitting: false,    // keep false for libraries
  treeshake: true,
});