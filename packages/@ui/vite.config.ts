import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    dts({
      tsconfigPath: './tsconfig.json',
      cleanVueFileName: true,
      exclude: ['src/test/**', 'src/**/*.spec.ts', 'src/**/*.test.ts'],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SunnyBaseWebUI',
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
    rollupOptions: {
      external: [
        'vue',
        'vue-i18n',
        '@arco-design/web-vue',
        '@sunny-base-web/icons',
        '@sunny-base-web/utils',
        '@sunny-base-web/locales',
        '@tanstack/store',
        '@tanstack/vue-store',
        '@vee-validate/zod',
        '@vueuse/core',
        'axios',
        'lodash-es',
        'nprogress',
        'reka-ui',
        'vee-validate',
        'vue-router',
        'vxe-pc-ui',
        'vxe-table',
        'zod',
      ],
      output: {
        globals: {
          vue: 'Vue',
          'vue-i18n': 'vueI18n',
          '@arco-design/web-vue': 'ArcoVue',
          '@sunny-base-web/icons': 'SunnyBaseWebIcons',
          '@sunny-base-web/utils': 'SunnyBaseWebUtils',
          '@sunny-base-web/locales': 'SunnyBaseWebLocales',
        },
      },
    },
  },
})
