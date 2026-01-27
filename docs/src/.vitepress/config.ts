import { defineConfig } from 'vitepress'
import { containerPreview, componentPreview } from '@vitepress-demo-preview/plugin'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "My Monorepo Docs",
  description: "Documentation for my Vue 3 Monorepo",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Components', link: '/components/basic/icon' }
    ],

    sidebar: [
      {
        text: 'Introduction 介绍',
        items: [
          { text: 'Packages 说明', link: '/intro' }
        ]
      },
      {
        text: 'Basic 基础组件',
        items: [
          { text: 'Icon 图标', link: '/components/basic/icon' },
          { text: 'Scrollbar 滚动条', link: '/components/basic/scrollbar' }
        ]
      },
      {
        text: 'Data 数据展示',
        items: [
          { text: 'Hover Card 悬停卡片', link: '/components/data/card' },
          { text: 'Upload 上传', link: '/components/data/upload' },
          { text: 'QueryGrid 查询表格', link: '/components/data/query-grid' }
        ]
      },
      {
        text: 'Entry 数据录入',
        items: [
          { text: 'Form 表单', link: '/components/entry/form' },
          { text: 'Select 选择器', link: '/components/entry/select' },
          { text: 'BatchSelect 批量选择器', link: '/components/entry/batch-select' },
          { text: 'SearchInputTag 公共查询', link: '/components/entry/search-input-tag' }
        ]
      },
      {
        text: 'Feedback 反馈组件',
        items: [
          { text: 'Modal 弹窗', link: '/components/feedback/modal' }
        ]
      },
      {
        text: 'Utilities 工具',
        items: [
          {
            text: 'Composables 组合式函数',
            items: [
              { text: 'useNamespace', link: '/utilities/composables/use-namespace' }
            ]
          },
          {
            text: 'Common 常用',
            items: [
              { text: 'Regex 正则表达式', link: '/utilities/regex' }
            ]
          }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  },
  markdown: {
    config(md) {
      md.use(containerPreview)
      md.use(componentPreview)
    }
  },
  vite: {
    resolve: {
      alias: {
        '@utils': path.resolve(__dirname, '../../../packages/@utils/src'),
        '@kunkka/ui': path.resolve(__dirname, '../../../packages/@kunkka/src/index.ts'),
        '@kunkka': path.resolve(__dirname, '../../../packages/@kunkka/src')
      }
    },
    ssr: {
      noExternal: ['element-plus', '@kunkka/ui']
    },
    plugins: [
      {
        name: 'vite-plugin-jsx-support',
        config() {
          return {
            esbuild: {
              jsxFactory: 'h',
              jsxFragment: 'Fragment',
              jsxInject: `import { h } from 'vue'`
            }
          }
        }
      }
    ]
  }
})
