---
layout: home
sidebar: false

hero:
  name: Sunny Base Web
  text: 企业级前端解决方案
  tagline: 基于 Vue 3 + Arco Design，配置驱动，开箱即用
  actions:
    - theme: brand
      text: 快速开始
      link: /intro
    - theme: alt
      text: 组件库
      link: /components/basic/icon
    - theme: alt
      text: GitHub
      link: https://github.com/your-org/sunny-base-web

features:
  - icon: 🧩
    title: 丰富的业务组件
    details: 提供表单、表格、上传、搜索等 30+ 开箱即用的业务组件，支持配置驱动，大幅提升开发效率。
    link: /components/basic/icon
    linkText: 浏览组件
  - icon: ⚙️
    title: 配置驱动架构
    details: 采用 Schema/Config 驱动的设计理念，支持低代码和动态渲染场景，让复杂业务场景更易维护。
    link: /components/entry/form
    linkText: 了解更多
  - icon: 🎨
    title: Arco Design + Tailwind
    details: 基于 Arco Design Vue 二次封装，结合 Tailwind CSS 实用类优先，支持主题定制和暗黑模式。
    link: /components/basic/icon
    linkText: 查看样式规范
  - icon: 📦
    title: Monorepo 架构
    details: 使用 pnpm workspace + Turbo 构建，清晰的包依赖关系，支持独立版本管理和发布。
    link: /intro
    linkText: 架构说明
  - icon: 🌐
    title: 完善的国际化
    details: 内置多语言支持，提供统一的翻译管理，支持动态语言包加载和缺失翻译降级。
    link: /locales/i18n
    linkText: I18n 文档
  - icon: 💪
    title: TypeScript 严格模式
    details: 全栈 TypeScript 开发，启用严格模式，完整的类型定义和智能提示，提升代码质量。
    link: /utilities/composables/use-namespace
    linkText: 工具函数
---

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #bd34fe 30%, #41d1ff);
  --vp-home-hero-image-background-image: linear-gradient(-45deg, #bd34fe 50%, #47caff 50%);
  --vp-home-hero-image-filter: blur(44px);
}

.VPHero .image-bg {
  transition: all 0.5s ease;
}

@media (min-width: 640px) {
  :root {
    --vp-home-hero-image-filter: blur(56px);
  }
}

@media (min-width: 960px) {
  :root {
    --vp-home-hero-image-filter: blur(68px);
  }
}
</style>

<div class="tip custom-block" style="margin-top: 40px; padding: 20px 24px;">

### 🚀 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 启动文档站点（端口 5002）
cd docs && ppm dev
```

</div>

<div class="features-section" style="margin-top: 60px;">

## 📚 核心模块

### UI 组件库 (@ui)
提供基础组件、数据展示、数据录入、反馈组件等完整的组件体系。

### 业务组件 (@effects)
包含登录、布局、权限控制等业务场景组件，以及 HTTP 客户端、上传下载等副作用功能。

### 状态管理 (@stores)
基于 Pinia 的状态管理方案，支持加密持久化和跨组件状态共享。

### 工具函数 (@utils)
通用工具函数和 Vue Composables，包含日期、对象、树形数据处理等。

### 国际化 (@locales)
基于 Vue I18n 的多语言解决方案，支持动态加载和缺失翻译降级。

### 图标库 (@icons)
基于 Iconify 和 Lucide 的图标解决方案，支持按需加载和自定义图标。

</div>

<div class="tech-stack" style="margin-top: 60px;">

## 🛠️ 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | Vue 3 | ^3.4.x |
| 构建工具 | Vite | ^6.x |
| UI 库 | Arco Design Vue | ^2.x |
| 样式 | Tailwind CSS | ^3.x |
| 包管理 | pnpm | ^9.x |
| Monorepo | Turbo | ^2.x |
| 类型系统 | TypeScript | ^5.x |
| 状态管理 | Pinia | ^2.x |
| 国际化 | Vue I18n | ^9.x |

</div>
