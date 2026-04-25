/**
 * 全局事件发射器
 *
 * 基于 mitt 的单例事件总线，所有 core 模块直接 import 使用。
 * 事件粒度为粗粒度：node 变更、block 变更、页面切换等，共 6 种事件。
 *
 * ## 设计原则
 *
 * - **粗粒度**：只用 6 个事件覆盖所有变更场景，订阅方通过 payload.action 细分
 * - **全局单例**：`export const emitter = mitt<Events>()`，任何模块 import 即可使用
 * - **类型安全**：事件名和 payload 通过 Events 映射类型绑定，编译期检查
 * - **mitt 轻量**：~200b，零依赖，替代了之前的 class EventBus
 *
 * ## 事件总览
 *
 * | 事件 | 触发时机 | payload |
 * |------|----------|---------|
 * | `node:change` | NodeModel 增删改/属性/事件/指令变更 | `{ nodeId, action, parentId? }` |
 * | `block:change` | BlockModel JS声明/CSS/编译宏变更 | `{ blockId, action }` |
 * | `page:switch` | ProjectModel.switchPage() | `{ fromPageId, toPageId }` |
 * | `project:load` | Engine.loadProject() / ProjectModel 变更 | `{ projectId }` |
 * | `history:change` | History 游标移动（undo/redo/新增快照） | `{ cursor, total, canUndo, canRedo }` |
 * | `history:restore` | History 快照恢复完成 | `{ snapshotId?, blockId }` |
 *
 * @example
 * ```ts
 * import { emitter, EVENT_NODE_CHANGE } from '../emitter'
 *
 * // 发射
 * emitter.emit(EVENT_NODE_CHANGE, { nodeId: 'xxx', action: 'add', parentId: 'root' })
 *
 * // 订阅
 * emitter.on(EVENT_NODE_CHANGE, (payload) => {
 *   console.log(payload.action) // 'add' | 'remove' | 'move' | 'props' | ...
 * })
 *
 * // 取消订阅（需保存同一个 handler 引用）
 * const handler = (payload) => { ... }
 * emitter.on(EVENT_NODE_CHANGE, handler)
 * emitter.off(EVENT_NODE_CHANGE, handler)
 * ```
 */
import mitt from 'mitt'

// ── 事件类型常量 ──────────────────────────────────────────

/**
 * 节点变更事件
 *
 * 当 NodeModel 的增删改、属性、事件、指令发生变更时触发。
 * payload.action 可区分具体操作类型。
 */
export const EVENT_NODE_CHANGE = 'node:change'

/**
 * Block 变更事件
 *
 * 当 BlockModel 的 JS 声明（state/computed/method/watch）、
 * CSS 样式块、Vue 编译宏（props/emits/expose 等）发生变更时触发。
 */
export const EVENT_BLOCK_CHANGE = 'block:change'

/**
 * 页面切换事件
 *
 * 当用户在多页面间切换时触发，payload 包含来源和目标页面 ID。
 * 订阅方通常用于清空选中状态、重新渲染画布。
 */
export const EVENT_PAGE_SWITCH = 'page:switch'

/**
 * 项目加载事件
 *
 * 当 Engine.loadProject() 加载项目数据时触发，
 * 也用于 ProjectModel 级别的通用变更通知（添加/删除页面、依赖变更等）。
 */
export const EVENT_PROJECT_LOAD = 'project:load'

/**
 * 历史栈变更事件
 *
 * 当 History 的游标位置发生变化时触发（新增快照、undo、redo）。
 * 订阅方用于更新 UI 上的撤销/重做按钮状态。
 */
export const EVENT_HISTORY_CHANGE = 'history:change'

/**
 * 历史恢复完成事件
 *
 * 当 undo/redo 将快照数据写回 BlockModel 后触发。
 * 订阅方用于触发画布重渲染。
 */
export const EVENT_HISTORY_RESTORE = 'history:restore'

// ── Payload 类型 ──────────────────────────────────────────

/**
 * 节点变更动作类型
 *
 * - `add` — 新增子节点（NodeModel.addChild）
 * - `remove` — 移除子节点（NodeModel.removeChild）
 * - `move` — 移动子节点位置（NodeModel.moveChild）
 * - `props` — 属性变更（setProp / removeProp / setProps）
 * - `events` — 事件绑定变更（setEvent / removeEvent）
 * - `directive` — 指令变更（addDirective / removeDirective / updateDirective）
 */
export type NodeChangeAction = 'add' | 'remove' | 'move' | 'props' | 'events' | 'directive'

/**
 * 节点变更事件载荷
 */
export interface NodeChangePayload {
  /** 发生变更的节点 ID */
  nodeId: string
  /** 变更动作类型 */
  action: NodeChangeAction
  /** 父节点 ID（add/remove/move 时有值） */
  parentId?: string | null
  /** 在父节点 children 中的插入位置（add 时有值） */
  index?: number
}

/**
 * Block 变更动作类型
 *
 * - `state` — 响应式状态变更
 * - `computed` — 计算属性变更
 * - `method` — 方法变更
 * - `watch` — 侦听器变更
 * - `css` — CSS 样式块变更
 * - `update` — 通用更新（名称、路由、编译宏等）
 */
export type BlockChangeAction = 'state' | 'computed' | 'method' | 'watch' | 'css' | 'update'

/**
 * Block 变更事件载荷
 */
export interface BlockChangePayload {
  /** 发生变更的 Block ID */
  blockId: string
  /** 变更动作类型 */
  action: BlockChangeAction
}

/**
 * 页面切换事件载荷
 */
export interface PageSwitchPayload {
  /** 切换前的页面 ID */
  fromPageId: string
  /** 切换后的页面 ID */
  toPageId: string
}

/**
 * 项目加载事件载荷
 */
export interface ProjectLoadPayload {
  /** 项目 ID */
  projectId: string
}

/**
 * 历史栈变更事件载荷
 */
export interface HistoryChangePayload {
  /** 当前游标位置（指向当前状态在快照栈中的索引） */
  cursor: number
  /** 快照总数 */
  total: number
  /** 是否可以撤销 */
  canUndo: boolean
  /** 是否可以重做 */
  canRedo: boolean
}

/**
 * 历史恢复完成事件载荷
 */
export interface HistoryRestorePayload {
  /** 快照 ID（可选，恢复开始时可能未指定） */
  snapshotId?: string
  /** 恢复的 Block ID */
  blockId: string
}

// ── Events Map ────────────────────────────────────────────

/**
 * 事件映射表
 *
 * mitt 的泛型参数，将事件名常量与对应的 Payload 类型绑定，
 * 确保 emitter.on / emitter.emit 有完整的类型推导。
 */
export type Events = {
  [EVENT_NODE_CHANGE]: NodeChangePayload
  [EVENT_BLOCK_CHANGE]: BlockChangePayload
  [EVENT_PAGE_SWITCH]: PageSwitchPayload
  [EVENT_PROJECT_LOAD]: ProjectLoadPayload
  [EVENT_HISTORY_CHANGE]: HistoryChangePayload
  [EVENT_HISTORY_RESTORE]: HistoryRestorePayload
}

// ── 全局单例 ──────────────────────────────────────────────

/**
 * 全局事件总线单例
 *
 * 所有 core 模块和 studio 层直接 import 此对象进行事件通信，
 * 不需要通过构造函数注入或依赖传递。
 */
export const emitter = mitt<Events>()
