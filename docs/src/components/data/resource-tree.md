# ResourceTree 资源树

`SunnyResourceTree` 是基于 Arco `Tree` 封装的业务组件，支持以下能力：

- 与 Arco `Tree` 官方 API 保持一致（Props / Events / Slots / Methods）
- 支持官方 `load-more` 懒加载写法
- 在官方能力基础上扩展节点右键菜单（显示/隐藏、启用/禁用可按节点动态控制）

## 基础用法（Mock）

<preview path="./demos/resource-tree/BasicUsage.vue" title="基础用法" description="官方 Tree API + load-more + 节点右键菜单" />

## API

### 官方 Tree API

`SunnyResourceTree` 默认透传 Arco `Tree` 的全部 Props / Events / Slots / Methods，命名与用法保持一致。  
例如可以直接使用官方写法：`:data="treeData"`、`:load-more="loadMore"`、`v-model:expanded-keys`、`@expand` 等。

`loadMore` 的使用方式与 Arco 官方一致：在回调中直接设置 `node.children`。

### 额外扩展 Props（右键菜单）

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| contextMenuActions | 节点右键菜单配置 | `ResourceTreeContextMenuAction[]` | `[]` |
| actions | 兼容旧命名，等价于 `contextMenuActions` | `ResourceTreeContextMenuAction[]` | `[]` |
| enableRootContextMenu | 是否允许根节点显示右键菜单 | `boolean` | `false` |

### Events

| 事件名 | 说明 |
| --- | --- |
| action | 右键操作点击事件 |

### Expose

| 方法 | 说明 |
| --- | --- |
| getTree() | 获取 Arco Tree 实例 |
| 其余方法 | 透传 Arco Tree 官方实例方法（如 `expandNode`、`selectNode`、`checkNode` 等） |
