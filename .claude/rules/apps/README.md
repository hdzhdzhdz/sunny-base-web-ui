# Apps Rules Index

本目录包含 `apps/` 下各应用的开发规范。

## 📱 可用规范

| 应用名 | 规范文件 | 状态 | 说明 |
|--------|----------|------|------|
| web | [web.md](./web.md) | ✅ | 主应用开发规范 |

**图例：**
- ✅ 已完成
- 🚧 待补充
- 📝 计划中

## 🎯 快速导航

- **Web 应用开发** → [web.md](./web.md)

## 📝 开发流程

1. **创建新页面**：参考 `web.md` 中的"创建新页面"章节
2. **API 开发**：遵循 API 开发规范，使用 `@effects` 的 requestClient
3. **状态管理**：使用 `@stores` 的 Pinia stores
4. **路由配置**：组织在 `src/router/` 下，分为 core/static/dynamic
5. **样式规范**：优先使用 Tailwind CSS，遵循 Arco Design Token
