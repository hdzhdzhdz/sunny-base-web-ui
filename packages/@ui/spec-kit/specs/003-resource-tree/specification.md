# SunnyResourceTree 规格说明（对齐 Arco Tree 官方 API）

## 1. 概述
`SunnyResourceTree` 是基于 Arco `Tree` 的轻量封装组件。
目标是保持与官方 `Tree` **完全一致**的使用方式（Props / Events / Slots / Methods），仅增加业务侧常用的节点右键菜单能力。

## 2. 目标与范围

### 2.1 目标
- 保持官方 API 命名与调用方式不变。
- 支持官方 `load-more` 懒加载模式。
- 增加可配置的节点右键菜单能力。

### 2.2 范围内能力
- 透传 Arco `Tree` 全量 `attrs`（如 `data`、`load-more`、`expanded-keys` 等）。
- 透传 Arco `Tree` 原生事件与插槽（`title` 插槽由右键增强后再透传）。
- 透传 Arco `Tree` 常用实例方法（`expandNode`、`selectNode`、`checkNode` 等）。
- 右键菜单扩展：
  - `contextMenuActions`
  - `actions`（兼容别名）
  - `enableRootContextMenu`
  - `action` 事件

### 2.3 非目标
- 不再以 `rootNodes` / `loadChildren` / `loadNode` 作为主 API。
- 不在组件内部实现“删除确认/刷新子节点”等业务流程（这些在示例层实现）。

## 3. 设计与实现

### 3.1 目录结构
- `packages/@ui/src/data/resource-tree/SunnyResourceTree.vue`
- `packages/@ui/src/data/resource-tree/use-sunny-resource-tree.ts`
- `packages/@ui/src/data/resource-tree/types.ts`
- `packages/@ui/src/data/resource-tree/index.ts`

### 3.2 封装策略
- `SunnyResourceTree.vue` 内部渲染 Arco `Tree`，使用 `v-bind="$attrs"` 完整透传官方参数。
- 对 `title` 插槽做增强：若节点存在可见菜单项，则通过 `Dropdown` 实现右键菜单。
- 其它插槽名称透传，保证官方能力可继续使用。

### 3.3 右键菜单策略
- 菜单项来源：`contextMenuActions`（优先）或 `actions`（兼容）。
- `visible(node)` 决定是否显示菜单项。
- `disabled(node)` 决定是否可点击。
- `enableRootContextMenu=false` 时默认不在根节点显示右键菜单。
- 点击菜单项后执行 `handler(node)`，并触发组件事件 `action`。

## 4. API 说明

### 4.1 官方 API 透传
`SunnyResourceTree` 支持直接使用官方 `Tree` API，例如：
- `:data="treeData"`
- `:load-more="loadMore"`
- `v-model:expanded-keys="expandedKeys"`
- `@expand="onExpand"`

### 4.2 扩展 Props
| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `contextMenuActions` | `ResourceTreeContextMenuAction[]` | `[]` | 节点右键菜单配置 |
| `actions` | `ResourceTreeContextMenuAction[]` | `[]` | 兼容旧命名，等价于 `contextMenuActions` |
| `enableRootContextMenu` | `boolean` | `false` | 是否允许根节点显示右键菜单 |

### 4.3 扩展 Events
| 事件名 | 参数 | 说明 |
| --- | --- | --- |
| `action` | `{ key, action, node }` | 右键菜单项点击后触发 |

### 4.4 Expose
- `getTree()`：获取 Arco `Tree` 实例。
- 透传常用实例方法：`expandNode`、`expandAll`、`selectNode`、`selectAll`、`checkNode`、`checkAll`、`getSelectedNodes` 等。

## 5. 示例约定（当前 Demo）
- 文档示例位于 `docs/src/components/data/demos/resource-tree/BasicUsage.vue`。
- 懒加载采用官方模式：在 `loadMore(node)` 中直接设置 `node.children`。
- 示例右键菜单包含：新增、修改、删除、刷新。
- 示例中删除为二次确认后删除当前节点；刷新为重新获取并覆盖当前节点下全部子节点。

## 6. 验收标准
- 使用官方 API 调用时行为与 Arco `Tree` 一致。
- `load-more` 首次点击可正确加载并显示子节点。
- 右键菜单显示/禁用逻辑正确，`action` 事件参数完整。
- 文档示例可演示新增扩展能力并可运行。
