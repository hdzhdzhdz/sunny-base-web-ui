import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SunnyBaseWebDesigner',
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
    rollupOptions: {
      external: [
        'vue',
        'vue-router',
        'vue-i18n',
        '@arco-design/web-vue',
        '@sunny-base-web/icons',
        '@sunny-base-web/ui',
        '@sunny-base-web/utils',
        '@sunny-base-web/locales',
      ],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          'vue-i18n': 'vueI18n',
          '@arco-design/web-vue': 'ArcoVue',
          '@sunny-base-web/icons': 'SunnyBaseWebIcons',
          '@sunny-base-web/ui': 'SunnyBaseWebUI',
          '@sunny-base-web/utils': 'SunnyBaseWebUtils',
          '@sunny-base-web/locales': 'SunnyBaseWebLocales',
        },
      },
    },
  },
})
