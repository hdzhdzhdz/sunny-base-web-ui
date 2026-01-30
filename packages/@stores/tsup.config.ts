import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  shims: true,
  splitting: false,
  // 将 workspace 依赖打包进去，确保发布后可用
  noExternal: ['@sunny-base-web/constants', 'secure-ls']
})
