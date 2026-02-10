import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue()
    // dts({
    //   tsconfigPath: './tsconfig.json',
    //   cleanVueFileName: true,
    // }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SunnyBaseWebEffects',
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
    rollupOptions: {
      external: [
        'vue',
        '@sunny-base-web/ui',
        '@sunny-base-web/utils',
        '@sunny-base-web/stores',
        '@sunny-base-web/icons',
        '@sunny-base-web/constants',
        'axios',
        'jsencrypt',
        'qs',
        'vue3-slide-verify',
        'vue-i18n',
        '@arco-design/web-vue',
        '@vueuse/core',
         'reka-ui',
         'vue-router',
         '@sunny-base-web/locales',
         '#/preferences',
       ],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
