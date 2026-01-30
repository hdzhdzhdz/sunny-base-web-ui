# 介绍

本文档旨在详细介绍本项目中各个包（packages）的用途、结构以及如何使用它们。

## 包结构概览

本项目采用 Monorepo 结构，所有的核心代码都位于 `packages` 目录下。以下是各个包的说明：

### @kunkka

**核心 UI 组件库**

这是一个通用的 Vue 3 UI 组件库，基于 `@arco-design/web-vue` 和 `tailwindcss` 构建。它提供了一系列开箱即用的基础组件和业务组件，旨在提高开发效率并保持 UI 的一致性。

- **基础组件 (Basic)**: 如图标 (`Icon`)、滚动条 (`Scrollbar`) 等。
- **数据展示 (Data)**: 如上传 (`Upload`)、悬停卡片 (`HoverCard`) 等。
- **反馈组件 (Feedback)**: 如模态框 (`Modal`)、文字提示 (`Tooltip`) 等。
- **导航组件 (Navigation)**: 如菜单 (`Menu`) 等。

### @effects

**业务关联组件库**

此包包含与特定业务逻辑或系统紧密耦合的组件。与 `@kunkka` 不同，`@effects` 中的组件通常包含特定的业务状态、接口调用或布局逻辑。

- **布局 (Layout)**: 包含系统的主体布局组件，如侧边栏 (`Sidebar`) 等。
- **业务小部件 (Widgets)**: 特定业务场景下使用的 UI 单元。

### @icons

**图标库**

集中管理项目中使用的图标资源。

- 集成了 `lucide-vue-next`。
- 提供了统一的图标加载和渲染机制。

### @utils

**工具函数库**

包含项目中通用的工具函数、组合式函数 (Composables) 和类型定义。

- **Composables**: 如 `useNamespace` 等 Vue 组合式函数。
- **工具函数**: 颜色处理、类名合并 (`cn`)、类型推断等。

这里整理了 `@sunny-base-web/utils/regex` 中内置的所有常用正则表达式，您可以直接在 `KunkkaInput` 组件的 `rule` 属性中使用，或在代码中导入使用。

### @config

**配置库**

集中管理项目的公共配置。

- **tsconfig**: TypeScript 基础配置。
- **tailwind-config**: Tailwind CSS 共享配置。
- **constants**: 项目常量定义。
