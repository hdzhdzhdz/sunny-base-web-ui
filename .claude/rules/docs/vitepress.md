# VitePress Documentation Specification

## 📋 概述

`docs/` 是基于 VitePress 的组件库文档站点，提供组件 API 文档、使用示例和最佳实践指南。

**技术栈：**
- VitePress
- Vue 3
- @vitepress-demo-preview/plugin (组件预览)
- Tailwind CSS
- @sunny-base-web/ui (组件库)

## 🏗️ 目录结构

```
docs/
├── src/
│   ├── .vitepress/           # VitePress 配置
│   │   ├── config.ts         # 站点配置
│   │   └── theme/            # 主题定制（可选）
│   ├── components/           # 组件文档
│   │   ├── basic/            # 基础组件
│   │   ├── data/             # 数据组件
│   │   ├── entry/            # 录入组件
│   │   └── feedback/         # 反馈组件
│   ├── business/             # 业务组件文档
│   ├── utilities/            # 工具函数文档
│   ├── resources/            # 资源和指南
│   ├── public/               # 静态资源
│   │   ├── arco-llm.txt      # Arco Design AI 文档
│   │   └── llms.txt          # 项目组件 AI 文档
│   └── index.md              # 首页
├── package.json
└── pnpm-workspace.yaml
```

## 📦 核心功能

### 1. 组件预览

**使用 demo-preview 插件：**
```markdown
<!-- components/basic/Icon/index.md -->
# Icon 图标

图标组件，基于 Iconify 和 Lucide。

## 基础用法

<preview path="./demos/BasicUsage.vue" title="基础用法" description="使用 Lucide 图标"></preview>

## 自定义大小

<preview path="./demos/CustomSize.vue" title="自定义大小" description="设置图标尺寸"></preview>
```

**Demo 文件：**
```vue
<!-- components/basic/Icon/demos/BasicUsage.vue -->
<script setup lang="ts">
import { Home, User, Settings } from '@sunny-base-web/icons';
</script>

<template>
  <div class="flex gap-4">
    <Home :size="24" />
    <User :size="24" />
    <Settings :size="24" />
  </div>
</template>
```

### 2. API 文档

**表格格式：**
```markdown
## API

### Props

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| size | `number` | `24` | 图标大小 |
| color | `string` | `inherit` | 图标颜色 |
| strokeWidth | `number` | `2` | 线条粗细 |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| click | `(event: MouseEvent)` | 点击事件 |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 自定义内容 |
```

### 3. 站点导航

**配置导航** (`.vitepress/config.ts`):
```typescript
export default defineConfig({
  theme: {
    nav: [
      { text: '首页', link: '/' },
      { text: '基础组件', link: '/components/basic/' },
      { text: '数据组件', link: '/components/data/' },
      { text: '录入组件', link: '/components/entry/' },
    ],
  },
});
```

**配置侧边栏：**
```typescript
export default defineConfig({
  theme: {
    sidebar: {
      '/components/basic/': [
        {
          text: '基础组件',
          items: [
            { text: 'Icon 图标', link: '/components/basic/Icon/' },
            { text: 'Scrollbar 滚动条', link: '/components/basic/Scrollbar/' },
          ],
        },
      ],
    },
  },
});
```

## 🎯 开发规范

### 1. 编写组件文档

**标准文档结构：**
```markdown
---
title: ComponentName 组件名
description: 组件简要描述
---

# ComponentName 组件名

组件简要描述，说明组件用途和适用场景。

## 何时使用

描述使用场景。

## 代码演示

## 基础用法

<preview path="./demos/BasicUsage.vue" title="基础用法"></preview>

## 高级用法

<preview path="./demos/Advanced.vue" title="高级用法"></preview>

## API

### Props

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| ... | ... | ... | ... | ... |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| ... | ... | ... |

### Slots

| 插槽名 | 说明 |
|--------|------|
| ... | ... |

## 注意事项

- 注意事项 1
- 注意事项 2
```

### 2. 编写 Demo

**Demo 文件规范：**
```vue
<!-- demos/BasicUsage.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { SunnyComponent } from '@sunny-base-web/ui';

const value = ref('');
</script>

<template>
  <div class="demo-container">
    <SunnyComponent v-model="value" />
    <p>当前值: {{ value }}</p>
  </div>
</template>

<style scoped>
.demo-container {
  padding: 16px;
  border: 1px solid var(--color-border-2);
  border-radius: 8px;
}
</style>
```

**Demo 命名：**
- `BasicUsage.vue` - 基础用法
- `Advanced.vue` - 高级用法
- `Layout.vue` - 布局相关
- `Validation.vue` - 验证相关
- `Async.vue` - 异步操作

### 3. 文件组织

**组件文档目录：**
```
docs/src/components/basic/Icon/
├── index.md              # 主文档
├── demos/                # 示例代码
│   ├── BasicUsage.vue
│   ├── CustomSize.vue
│   └── CustomColor.vue
└── assets/               # 文档相关资源（可选）
    └── icon-preview.png
```

### 4. 使用 AI 文档

**Arco Design 文档：**
```
docs/src/public/arco-llm.txt
```
包含 Arco Design Vue 完整 API 文档，供 AI 参考查阅。

**项目组件文档：**
```
docs/src/public/llms.txt
```
包含项目内部组件的使用说明和示例。

**在文档中引用：**
```markdown
如需了解更多 Arco Design 组件，请查看 [Arco Design 文档](/arco-llm.txt)。
```

### 5. 本地化

**添加多语言支持：**
```typescript
// .vitepress/config.ts
export default defineConfig({
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
    },
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/',
    },
  },
});
```

### 6. 样式定制

**自定义 CSS** (`.vitepress/theme/style.css`):
```css
:root {
  --vp-c-brand: var(--color-primary-6);
  --vp-c-brand-light: var(--color-primary-5);
  --vp-c-brand-dark: var(--color-primary-7);
}

/* 组件演示样式 */
.demo-preview {
  padding: 16px;
  border: 1px solid var(--color-border-2);
  border-radius: 8px;
}
```

### 7. 静态资源

**引用图片：**
```markdown
![组件预览](./assets/component-preview.png)
```

**引用公共资源：**
```markdown
![Logo](/logo.png)
```

## ⚠️ 注意事项

1. **内容质量**:
   - ✅ 每个组件至少 2 个 Demo（基础 + 复杂）
   - ✅ API 文档完整（Props、Events、Slots）
   - ✅ 提供使用场景和注意事项
   - ❌ 避免不完整的示例代码

2. **代码示例**:
   - ✅ Demo 代码可直接运行
   - ✅ 使用 TypeScript
   - ✅ 遵循项目代码规范
   - ❌ 不使用省略号（...）省略代码

3. **性能优化**:
   - ✅ 按需导入组件
   - ✅ Demo 代码避免复杂逻辑
   - ✅ 图片资源优化
   - ❌ 避免在文档中使用大量数据

4. **版本同步**:
   - ✅ 文档与组件版本同步
   - ✅ 标记新增/废弃的 API
   - ✅ 提供迁移指南
   - ❌ 不要过时的文档

## 📝 TODO

- [ ] 添加搜索功能
- [ ] 添加深色模式
- [ ] 集成代码沙箱（StackBlitz）
- [ ] 添加组件交互式示例
- [ ] 优化移动端体验
- [ ] 添加版本切换
- [ ] 自动生成 API 文档
- [ ] 添加组件使用统计
