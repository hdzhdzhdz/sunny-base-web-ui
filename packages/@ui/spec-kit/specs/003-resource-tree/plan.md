# 实施计划：SunnyResourceTree（对齐 Arco Tree 官方 API）

## 目标澄清（已对齐）
- [x] 组件使用方式与 Arco `Tree` 保持一致：Props / Events / Slots / Methods 命名不改。
- [x] 懒加载使用官方 `load-more` 语义：在回调中直接写 `node.children`。
- [x] 在官方能力基础上仅扩展“节点右键菜单”能力。

## Phase 1：脚手架与导出（已完成）
- [x] 创建目录：`packages/@ui/src/data/resource-tree/`
  - `SunnyResourceTree.vue`
  - `types.ts`
  - `use-sunny-resource-tree.ts`
  - `index.ts`
- [x] 组件导出：`packages/@ui/src/data/resource-tree/index.ts`
- [x] 聚合导出：`packages/@ui/src/index.ts`

## Phase 2：API 对齐实现（已完成）
- [x] `SunnyResourceTree` 使用 `v-bind="$attrs"` 透传官方 Tree Props 与事件。
- [x] 保留官方 `:data`、`:load-more`、`v-model:expanded-keys` 等写法。
- [x] 透传官方 Tree Slots（除 `title` 被右键菜单扩展接管后再二次透传）。
- [x] Expose 透传官方实例方法（`expandNode`、`selectNode`、`checkNode` 等）。

## Phase 3：右键菜单扩展（已完成）
- [x] 扩展 Props：
  - `contextMenuActions`
  - `actions`（兼容别名）
  - `enableRootContextMenu`
- [x] 扩展事件：`action`
- [x] 操作项支持：`visible(node)` / `disabled(node)` / `danger` / `handler(node)`
- [x] 根节点是否显示菜单可配置（默认关闭）

## Phase 4：示例与文档（已完成）
- [x] Demo 页面：`docs/src/components/data/demos/resource-tree/BasicUsage.vue`
  - [x] 根节点示例：`a`、`b`、`c`
  - [x] 官方 `load-more` 示例
  - [x] 展开时控制台输出即将加载的子节点
  - [x] 右键菜单动作：新增、修改、删除、刷新
  - [x] 删除实现：二次确认后删除当前节点
  - [x] 刷新实现：重新获取并覆盖当前节点下全部子节点
- [x] 文档页：`docs/src/components/data/resource-tree.md`
  - [x] 明确“官方 API 全兼容”
  - [x] 明确右键菜单为扩展能力

## Phase 5：收尾与回归（待补充）
- [ ] 增加自动化测试（重点：删除确认流程、刷新子节点流程、右键可见/禁用条件）。
- [ ] 增加边界场景验证（空 children、重复点击、并发刷新、删除后状态清理）。
- [ ] 增加大数据量场景下的交互与性能回归检查。

## 与原计划差异说明（已确认）
- [x] 取消原“自定义 API 主导”方案（如 `rootNodes`、`loadChildren`、`loadNode` 作为主入口）。
- [x] 采用“官方 API 对齐 + 右键菜单扩展”方案。
- [x] 节点刷新能力在示例中通过官方数据与 `load-more` 语义实现，不再以自定义 Expose 刷新 API 为主。
