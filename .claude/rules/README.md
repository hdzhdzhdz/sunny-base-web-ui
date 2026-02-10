# Claude AI Rules Index

本目录包含项目的详细开发规范，按模块和功能分类组织。

## 📁 目录结构

### [general.md](./general.md)
通用开发规范，适用于整个项目。
- Git 提交规范
- 代码风格约定
- TypeScript 最佳实践
- 测试规范

### [packages/](./packages/)
`packages/` 目录下各包的开发规范。
- **[ui.md](./packages/ui.md)** - `@ui` 组件库完整工程规范
- **[utils.md](./packages/utils.md)** - `@utils` 工具函数库规范
- **[stores.md](./packages/stores.md)** - `@stores` 状态管理规范
- **[locales.md](./packages/locales.md)** - `@locales` 国际化规范
- **[icons.md](./packages/icons.md)** - `@icons` 图标库规范
- **[effects.md](./packages/effects.md)** - `@effects` 交互组件规范
- **[config.md](./packages/config.md)** - `@config` 配置常量规范

### [apps/](./apps/)
`apps/` 目录下各应用的开发规范。
- **[web.md](./apps/web.md)** - `web` 应用开发规范

### [docs/](./docs/)
`docs/` 文档站点的开发规范。
- **[vitepress.md](./docs/vitepress.md)** - VitePress 文档规范

## 🎯 使用指南

**对于 AI Agent：**
1. 首先阅读根目录的 `CLAUDE.md` 了解项目概览
2. 根据任务类型，查阅对应的规则文件
3. 涉及多个模块时，需同时遵守相关模块的规范

**对于开发者：**
- 新增包时，在对应目录下创建 `{package-name}.md` 规则文件
- 更新本索引文件，添加新规则的链接
- 规范文件应包含：架构原则、目录结构、命名规范、最佳实践

## 📝 规范文件模板

创建新规范文件时，可参考以下结构：

```markdown
# {Package Name} Specification

## 1. Overview
包的用途和职责说明

## 2. Architecture Principles
架构设计原则

## 3. Directory Structure
目录结构说明

## 4. Naming Convention
命名规范

## 5. Implementation Guidelines
实现指南

## 6. Best Practices
最佳实践

## 7. Dependencies & Exports
依赖和导出规范
```
