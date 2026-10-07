import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    cloudflare(),
    {
      name: 'strip-ort-wasm-assets',
      generateBundle(_options, bundle) {
        for (const fileName of Object.keys(bundle)) {
          if (fileName.endsWith('.wasm')) delete bundle[fileName]
        }
      },
    },
  ],
  optimizeDeps: {
    exclude: ['@huggingface/transformers'],
  },
})