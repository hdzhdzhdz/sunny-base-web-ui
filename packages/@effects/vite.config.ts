import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    dts({ tsconfigPath: './tsconfig.json', cleanVueFileName: true })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SunnyBaseWebEffects',
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`
    },
    rollupOptions: {
      // 确保排除所有依赖
      external: ['vue', '@sunny-base-web/ui', '@sunny-base-web/utils', '@sunny-base-web/stores', 'axios', 'jsencrypt', 'qs', 'vue3-slide-verify', 'vue-i18n']
    }
  }
})