import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      tsconfigPath: './tsconfig.json',
      cleanVueFileName: true,
      rollupTypes: true,
    }),
    "@vue/babel-plugin-jsx"
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
          '@sunny-base-web/ui': 'SunnyBaseWebUI',
          '@sunny-base-web/utils': 'SunnyBaseWebUtils',
          '@sunny-base-web/stores': 'SunnyBaseWebStores',
          '@sunny-base-web/icons': 'SunnyBaseWebIcons',
          '@sunny-base-web/constants': 'SunnyBaseWebConstants',
          '@sunny-base-web/locales': 'SunnyBaseWebLocales',
          axios: 'axios',
          jsencrypt: 'JSEncrypt',
          qs: 'qs',
          'vue3-slide-verify': 'SlideVerify',
          'vue-i18n': 'vueI18n',
          '@arco-design/web-vue': 'ArcoVue',
          '@vueuse/core': 'VueUse',
          'reka-ui': 'RekaUI',
          'vue-router': 'vueRouter',
        },
      },
    },
  },
})
