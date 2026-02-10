# Docs Rules Index

本目录包含 `docs/` 文档站点的开发规范。

## 📚 可用规范

| 文档类型 | 规范文件 | 状态 | 说明 |
|----------|----------|------|------|
| VitePress | [vitepress.md](./vitepress.md) | ✅ | VitePress 文档规范 |

**图例：**
- ✅ 已完成
- 🚧 待补充
- 📝 计划中

## 🎯 快速导航

- **文档编写** → [vitepress.md](./vitepress.md)

## 📝 组件文档流程

1. **创建文档目录**：在 `docs/src/components/` 下创建对应目录
2. **编写主文档** (`index.md`)：遵循标准文档结构
3. **创建 Demo** (`demos/`)：至少包含基础和高级用法
4. **API 文档**：完整列出 Props、Events、Slots
5. **更新导航**：在 `.vitepress/config.ts` 中添加侧边栏配置

## 🔗 相关资源

- [VitePress 官方文档](https://vitepress.dev/)
- [Arco Design 文档](/arco-llm.txt) (本地)
- [项目组件文档](/llms.txt) (本地)
