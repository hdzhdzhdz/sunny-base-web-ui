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
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SunnyDesignerStudio',
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
    rollupOptions: {
      external: [
        'vue',
        'vue-router',
        '@arco-design/web-vue',
        '@sunny-base-web/designer-core',
        '@sunny-base-web/icons',
        '@sunny-base-web/locales',
        '@sunny-base-web/utils',
      ],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'vueRouter',
          '@arco-design/web-vue': 'ArcoVue',
          '@sunny-base-web/designer-core': 'SunnyDesignerCore',
          '@sunny-base-web/icons': 'SunnyBaseWebIcons',
          '@sunny-base-web/locales': 'SunnyBaseWebLocales',
          '@sunny-base-web/utils': 'SunnyBaseWebUtils',
        },
      },
    },
  },
})
