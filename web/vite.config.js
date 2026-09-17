import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/* Built into ../react so GitHub Pages serves it at /nash-site/react/ beside the prototype. */
export default defineConfig({
  plugins: [react()],
  base: '/nash-site/react/',
  build: { outDir: '../react', emptyOutDir: true },
});
