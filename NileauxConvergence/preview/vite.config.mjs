import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: here,
  cacheDir: `${here}.cache`,
  server: { host: '127.0.0.1', port: 5187, strictPort: true },
  build: { outDir: `${here}dist`, emptyOutDir: true },
});
