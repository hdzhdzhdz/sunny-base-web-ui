import { defineConfig } from 'vitepress'
import { containerPreview, componentPreview } from '@vitepress-demo-preview/plugin'

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
          { text: 'Upload 上传', link: '/components/data/upload' }
        ]
      },
      {
        text: 'Entry 数据录入',
        items: [
          { text: 'BatchSelect 批量选择器', link: '/components/entry/batch-select' }
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
    ssr: {
      noExternal: ['element-plus', '@kunkka/ui']
    }
  }
})
