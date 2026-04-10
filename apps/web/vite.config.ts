import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      '#': fileURLToPath(new URL('./src', import.meta.url)),
      '@sunny-base-web/utils': fileURLToPath(new URL('../../packages/@utils/src', import.meta.url)),
      '@sunny-base-web/stores': fileURLToPath(new URL('../../packages/@stores/src', import.meta.url)),
      '@sunny-base-web/constants': fileURLToPath(new URL('../../packages/@config/constants/src', import.meta.url)),
      '@sunny-base-web/effects': fileURLToPath(new URL('../../packages/@effects/src', import.meta.url)),
      '@sunny-base-web/locales': fileURLToPath(new URL('../../packages/@locales/src', import.meta.url)),
      '@sunny-base-web/designer-core': fileURLToPath(new URL('../../packages/@designer/core/src', import.meta.url)),
      '@sunny-base-web/designer-render': fileURLToPath(new URL('../../packages/@designer/render/src', import.meta.url)),
      '@sunny-base-web/designer-studio': fileURLToPath(new URL('../../packages/@designer/studio/src', import.meta.url)),
    }
  },
  server: {
    port: 5001,
    proxy: {
      '/base/test': {
        target: 'https://basetest.pcloud.sunnyoptical.cn',
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/base\/test/, ''),
      },
    },
  },
})
