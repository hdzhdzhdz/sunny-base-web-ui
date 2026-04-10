import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    dts({
      tsconfigPath: './tsconfig.json',
      cleanVueFileName: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SunnyDesignerMaterials',
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
    rollupOptions: {
      external: [
        'vue',
        '@sunny-base-web/designer-core',
      ],
      output: {
        globals: {
          vue: 'Vue',
          '@sunny-base-web/designer-core': 'SunnyDesignerCore',
        },
      },
    },
  },
})
