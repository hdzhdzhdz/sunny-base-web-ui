import { defineConfig } from 'vitepress'
import { containerPreview, componentPreview } from '@vitepress-demo-preview/plugin'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Sunny Base Web",
  description: "企业级 Vue 3 前端解决方案 - 基于 Arco Design 的组件库",
  lang: 'zh-CN',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.svg',
    siteTitle: 'Sunny Base Web',
    nav: [
      { text: '首页', link: '/' },
      { text: '组件库', link: '/components/basic/icon' },
      { text: '业务组件', link: '/business/' },
      { text: '工具函数', link: '/utilities/composables/use-namespace' },
      { text: 'AI 助手', link: '/ai/ai-assistant' }
    ],

    sidebar: {
      '/ai/': [
        {
          text: 'AI Guide',
          items: [
            { text: 'AI 助手', link: '/ai/ai-assistant' },
            { text: 'Everything Claude Code', link: '/ai/everything-claude-code' },
            { text: 'SpecKit Tutorial (还在研究中)', link: '/ai/spec-kit-tutorial' }
          ]
        }
      ],
      '/business/': [
        {
          text: 'Business Components',
          items: [
            { text: 'Introduction 介绍', link: '/business/' },
            { text: 'BusinessSearch 业务搜索', link: '/business/business-search' },
            { text: 'SearchPlan 查询方案', link: '/business/search-plan' },
            { text: 'CustomizeSelect 自定义下拉框', link: '/business/customize-select' },
            { text: 'ExportModal 公共导出弹窗', link: '/business/export-modal' }
          ]
        }
      ],
      '/': [
        {
          text: 'Introduction 介绍',
          items: [
            { text: 'Packages 说明', link: '/intro' },
            { text: 'I18n 国际化', link: '/locales/i18n' },
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
            { text: 'Upload 上传', link: '/components/data/upload' },
            { text: 'SimpleUpload 简易上传', link: '/components/data/simple-upload' },
            { text: 'QueryGrid 查询表格', link: '/components/data/query-grid' },
            { text: 'EditGrid 编辑表格', link: '/components/data/edit-grid' },
            { text: 'ResourceTree 资源树', link: '/components/data/resource-tree' }
          ]
        },
        {
          text: 'Entry 数据录入',
          items: [
            { text: 'Form 表单', link: '/components/entry/form' },
            { text: 'Select 选择器', link: '/components/entry/select' },
            { text: 'BatchSelect 批量选择器', link: '/components/entry/batch-select' },
            { text: 'ApiSelect API下拉选择器', link: '/components/entry/api-select' },
            { text: 'SearchInputTag 公共查询', link: '/components/entry/search-input-tag' },
          ]
        },
        {
          text: 'Feedback 反馈组件',
          items: [
            { text: 'Modal 弹窗', link: '/components/feedback/modal' },
            { text: 'SearchModal 查询弹窗', link: '/components/feedback/search-modal' },
            { text: 'Spinner 加载动画', link: '/components/feedback/spinner' },
            { text: 'ErrorBoundary 错误边界', link: '/components/feedback/error-boundary' }
          ]
        },
        {
          text: 'Resources 资源',
          items: [
            { text: 'AI 助手', link: '/ai/ai-assistant' }
          ]
        },
        {
          text: 'Utilities 工具',
          items: [
            {
              text: 'Composables 组合式函数',
              items: [
                { text: 'useNamespace', link: '/utilities/composables/use-namespace' },
                { text: 'useList', link: '/utilities/composables/use-list' }
              ]
            },
            {
              text: 'Common 常用',
              items: [
                { text: 'I18n 国际化', link: '/utilities/i18n' },
                { text: 'Regex 正则表达式', link: '/utilities/regex' }
              ]
            }
          ]
        }
      ]
    },

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
        '@sunny-base-web/utils': path.resolve(__dirname, '../../../packages/@utils/src'),
        '@sunny-base-web/ui': path.resolve(__dirname, '../../../packages/@ui/src/index.ts'),
        '@sunny-base-web/locales': path.resolve(__dirname, '../../../packages/@locales/src/index.ts'),
        '@sunny-base-web/effects': path.resolve(__dirname, '../../../packages/@effects/src/index.ts'),
        '@sunny-base-web/icons': path.resolve(__dirname, '../../../packages/@icons/src/index.ts')
      }
    },
    ssr: {
      noExternal: ['@sunny-base-web/ui']
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
    ],
    server: {
      port: 5002,
      proxy: {
        '/core': {
          target: 'https://sunnyqms-test.sunnyoptical.cn/base/test',
          changeOrigin: true,
          secure: false, // 忽略自签名证书错误（如果是 https）
          rewrite: (path) => path.replace(/^\/core/, '/core') // 显式保留 /core，虽然默认也是如此
        }
      }
    }
  }
})
