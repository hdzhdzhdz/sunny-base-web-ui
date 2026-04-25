/**
 * @sunny-base-web/designer-core
 *
 * 设计器核心逻辑包，纯 TypeScript 实现，零 Vue 依赖。
 *
 * 本包是低代码设计器的「大脑」，负责数据建模、事件通信、撤销重做和选中管理。
 * 上层包（@designer/studio）通过 import 本包的模型类和全局 emitter 来驱动 UI。
 *
 * ## 模块组成
 *
 * | 模块 | 文件 | 职责 |
 * |------|------|------|
 * | emitter  | `emitter.ts`       | 全局 mitt 事件单例，7 种粗粒度事件 |
 * | model    | `model/`           | 三层数据模型：NodeModel → BlockModel → ProjectModel |
 * | history  | `history/`         | 快照式撤销/重做，50ms 批处理窗口 |
 * | selection| `selection/`       | 节点选中状态管理（单选/多选/追加） |
 * | coder    | `coder/`           | （待实现）代码生成：将 Model 序列化为 Vue SFC 代码 |
 * | parser   | `parser/`          | （待实现）代码解析：将 Vue SFC 源码解析为 Model |
 * | schema   | `schema/`          | （待实现）Schema 协议：标准化页面/组件描述格式 |
 *
 * ## 事件通信
 *
 * 所有模型变更通过全局 `emitter` 广播，订阅方直接 import 即可监听：
 *
 * ```ts
 * import { emitter, EVENT_NODE_CHANGE } from '@sunny-base-web/designer-core'
 *
 * emitter.on(EVENT_NODE_CHANGE, (payload) => {
 *   // payload.action: 'add' | 'remove' | 'move' | 'props' | 'events' | 'directive'
 * })
 * ```
 *
 * ## 数据模型层级
 *
 * ```
 * ProjectModel            ← 项目（多页面、依赖、API 定义）
 *   └─ BlockModel[]       ← 页面/组件（节点树 + JS 声明 + CSS）
 *       └─ NodeModel      ← UI 节点（组件标签，对应模板中的一个元素）
 *           └─ NodeModel[] ← 子节点（树形递归）
 * ```
 */

// 事件系统（全局 mitt 单例）
export {
  emitter,
  EVENT_NODE_CHANGE,
  EVENT_BLOCK_CHANGE,
  EVENT_PAGE_SWITCH,
  EVENT_PROJECT_LOAD,
  EVENT_HISTORY_CHANGE,
  EVENT_HISTORY_RESTORE,
} from './emitter'
export type {
  NodeChangeAction,
  NodeChangePayload,
  BlockChangeAction,
  BlockChangePayload,
  PageSwitchPayload,
  ProjectLoadPayload,
  HistoryChangePayload,
  HistoryRestorePayload,
  Events,
} from './emitter'

// 历史系统（撤销/重做）
export { History } from './history/index'
export type { Snapshot, HistoryOptions } from './history/index'

// 数据模型
export type {
  DirectiveBinding,
  JsDeclaration,
  CssBlock,
  ApiDefinition,
  DependencyDeclaration,
  PropDefinition,
  EmitDefinition,
  ExposeDefinition,
  SlotDefinition,
  LifecycleHook,
  InjectDeclaration,
  DropPosition,
  NodeModelJSON,
  BlockModelJSON,
  ProjectModelJSON,
} from './model/index'
export {
  NodeModel,
  BlockModel,
  ProjectModel,
} from './model/index'
