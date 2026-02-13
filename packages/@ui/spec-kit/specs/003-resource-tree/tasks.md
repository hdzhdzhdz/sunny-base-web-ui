# Tasks: 003-resource-tree

## Phase 1：脚手架与导出
- [x] T001 创建组件目录 `packages/@ui/src/data/resource-tree/`
- [x] T002 新增 `SunnyResourceTree.vue`
- [x] T003 新增 `types.ts`
- [x] T004 新增 `use-sunny-resource-tree.ts`
- [x] T005 新增 `index.ts` 并导出组件
- [x] T006 在 `packages/@ui/src/index.ts` 聚合导出

## Phase 2：官方 API 对齐
- [x] T007 使用 `v-bind="$attrs"` 透传官方 Tree Props
- [x] T008 保持官方命名（`data` / `load-more` / `expanded-keys` 等）
- [x] T009 透传官方插槽（增强 `title`，其余透传）
- [x] T010 暴露官方实例方法代理（`expandNode` 等）

## Phase 3：右键菜单扩展
- [x] T011 新增扩展 Prop：`contextMenuActions`
- [x] T012 新增兼容 Prop：`actions`
- [x] T013 新增扩展 Prop：`enableRootContextMenu`
- [x] T014 实现 `visible(node)` / `disabled(node)` 动态逻辑
- [x] T015 实现 `action` 事件透出

## Phase 4：文档与示例
- [x] T016 新增文档页 `docs/src/components/data/resource-tree.md`
- [x] T017 新增示例 `docs/src/components/data/demos/resource-tree/BasicUsage.vue`
- [x] T018 示例接入官方 `load-more` 模式
- [x] T019 示例接入右键菜单“新增/修改/删除/刷新”
- [x] T020 示例实现删除二次确认逻辑
- [x] T021 示例实现刷新当前节点子节点逻辑

## Phase 5：收尾
- [ ] T022 增加自动化测试（右键菜单 + 删除 + 刷新）
- [ ] T023 增加边界场景验证（并发、空数据、重复点击）
- [ ] T024 增加性能回归验证（较大树数据）
