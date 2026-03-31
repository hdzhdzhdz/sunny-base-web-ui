import { resolve } from 'node:path';

import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      name: 'SunnyBaseWebLocales',
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['vue', 'vue-i18n'],
      output: {
        globals: {
          vue: 'Vue',
          'vue-i18n': 'vueI18n',
        },
      },
    },
  },
});
