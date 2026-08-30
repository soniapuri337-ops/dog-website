import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';

/* Target list is deliberately long-tailed: iOS 12 (Safari 12, 2018) still turns
   up on iPhone 6 and older iPads, and it predates optional chaining, clamp(),
   flex gap and IntersectionObserver. The legacy plugin ships a second, fully
   transpiled bundle plus core-js polyfills for those browsers, while modern
   phones download the small modern bundle. */
const LEGACY_TARGETS = [
  'ios_saf >= 12',
  'safari >= 12',
  'chrome >= 64',
  'android >= 6',
  'firefox >= 67',
  'edge >= 79',
];

export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: LEGACY_TARGETS,
      // Features Safari 12 and early Chrome lack that our bundle relies on.
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      modernPolyfills: true,
      renderLegacyChunks: true,
    }),
  ],
  server: {
    // Honour the port the harness assigns via PORT, fall back to Vite's default.
    port: Number(process.env.PORT) || 5173,
    host: true,
  },
  build: {
    // Syntax floor for the modern bundle. Safari 12 has no optional chaining
    // or nullish coalescing, so esbuild must down-level them.
    target: ['es2015', 'safari12', 'chrome64', 'firefox67', 'edge79'],
    cssTarget: ['safari12', 'chrome64'],
    assetsInlineLimit: 0,
    minify: 'terser',
    terserOptions: { safari10: true },
  },
});
