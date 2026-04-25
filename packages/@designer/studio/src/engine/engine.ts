/**
 * Engine - 设计器中央引擎
 *
 * 作为所有子系统的协调器，对外提供统一 API。
 * 持有并管理 ProjectModel、History、MaterialStore，维护选中状态。
 *
 * ## 核心职责
 *
 * 1. **项目管理** — 持有 ProjectModel，提供加载/序列化/页面切换
 * 2. **节点操作** — 增删移动节点（委托给 BlockModel）
 * 3. **选中状态** — 简单的 selectedNodeId + onSelectionChange 回调
 * 4. **历史记录** — 持有 History 实例，提供 undo/redo 快捷方法
 *
 * ## 选中状态设计
 *
 * ```
 * 选中流程：
 *   Designer.handleNodeClick → Engine.select(nodeId) → onSelectionChange()
 *                                                      → SetterPanel 刷新
 *                                                      → Designer 刷新 Overlay
 *
 * 自动清空：
 *   页面切换（EVENT_PAGE_SWITCH） → select(null)
 *   节点删除（EVENT_NODE_CHANGE action=remove） → select(null)
 * ```
 *
 * 与 BlockModel / NodeModel 的关系：
 * - Engine 不直接修改 NodeModel 的 props（由 Setter 委托）
 * - Engine 不持有 NodeModel 引用（通过 BlockModel.findNode 查询）
 * - Engine 通过 BlockModel 的方法操作节点树（addNode, removeNode, moveNode）
 *
 * ## 与其他子系统的关系
 *
 * ```
 * Engine (中央)
 *   ├── Simulator — 通过 Workspace 驱动渲染
 *   ├── Designer  — 通过 Engine.select() 修改选中状态
 *   ├── Setter    — 通过 Engine.getSelected() 读取选中节点
 *   ├── History   — Engine 持有 History 实例，提供 undo/redo
 *   └── Widget    — 通过 inject('designer-engine') 获取 Engine
 * ```
 *
 * @example
 * ```ts
 * const engine = new Engine({ materialStore })
 *
 * // 加载项目
 * engine.loadProject(projectJSON)
 *
 * // 监听选中变更
 * engine.onSelectionChange = () => { /* UI 刷新 *\/ }
 *
 * // 节点操作
 * engine.addNode(parentId, node)
 * engine.removeNode(nodeId)
 *
 * // 选中
 * engine.select(nodeId)
 * const selected = engine.getSelected()
 *
 * // 撤销/重做
 * engine.undo()
 * engine.redo()
 *
 * // 序列化
 * const json = engine.toJSON()
 * ```
 */
import {
  emitter,
  EVENT_NODE_CHANGE,
  EVENT_PAGE_SWITCH,
  EVENT_PROJECT_LOAD,
  EVENT_HISTORY_RESTORE,
} from '@sunny-base-web/designer-core'
import { ProjectModel } from '@sunny-base-web/designer-core'
import type { ProjectModelJSON, BlockModelJSON, BlockModel, NodeModel } from '@sunny-base-web/designer-core'
import { History } from '@sunny-base-web/designer-core'
import type { MaterialStore } from '@sunny-base-web/designer-materials'

/**
 * Engine 构造选项
 *
 * @example
 * ```ts
 * const engine = new Engine({
 *   materialStore,
 *   historyMaxSize: 100,       // 可选，最大快照数
 *   historyBatchWindow: 50,    // 可选，批处理窗口(ms)
 * })
 * ```
 */
export interface EngineOptions {
  /** 物料存储（提供组件元数据和运行时组件） */
  materialStore: MaterialStore
  /** 最大历史快照数量，默认 50 */
  historyMaxSize?: number
  /** 历史批处理窗口（ms），默认 50 */
  historyBatchWindow?: number
}

export class Engine {
  /** 项目模型（持有所有页面和依赖） */
  readonly project: ProjectModel

  /** 历史记录管理器（快照式撤销/重做） */
  readonly history: History

  /** 物料存储（组件元数据 + 运行时组件注册） */
  readonly materialStore: MaterialStore

  /**
   * 当前选中的节点 ID
   *
   * 简单的字符串引用，不持有 NodeModel 实例。
   * 通过 getSelected() 查询实际的 NodeModel。
   */
  private _selectedNodeId: string | null = null

  /**
   * 选中变更回调
   *
   * UI 层（SetterPanel、Designer）注册此回调以响应选中变化。
   * 替代了之前基于事件的 Selection 通知机制，更简单直接。
   */
  onSelectionChange: (() => void) | null = null

  /** 是否已初始化（loadProject 后为 true） */
  private initialized: boolean = false

  /** 全局事件取消订阅函数列表 */
  private unsubscribers: (() => void)[] = []

  /**
   * 创建 Engine 实例
   *
   * @param options - 构造选项（必须提供 materialStore）
   */
  constructor(options: EngineOptions) {
    this.materialStore = options.materialStore

    this.project = new ProjectModel('未命名项目')

    this.history = new History(
      () => this.project.getActivePage(),
      {
        maxSize: options.historyMaxSize,
        batchWindow: options.historyBatchWindow,
      },
    )

    // 页面切换 → 清空选中
    const switchHandler = () => {
      this._selectedNodeId = null
      this.onSelectionChange?.()
    }
    emitter.on(EVENT_PAGE_SWITCH, switchHandler)
    this.unsubscribers.push(() => emitter.off(EVENT_PAGE_SWITCH, switchHandler))

    // 节点删除 → 如果删除的是选中节点则清空选中
    const nodeHandler = (payload: { action: string; nodeId: string }) => {
      if (payload.action === 'remove' && this._selectedNodeId === payload.nodeId) {
        this._selectedNodeId = null
        this.onSelectionChange?.()
      }
    }
    emitter.on(EVENT_NODE_CHANGE, nodeHandler)
    this.unsubscribers.push(() => emitter.off(EVENT_NODE_CHANGE, nodeHandler))

    // 历史恢复 → 监听事件（当前无需额外处理）
    const restoredHandler = () => {}
    emitter.on(EVENT_HISTORY_RESTORE, restoredHandler)
    this.unsubscribers.push(() => emitter.off(EVENT_HISTORY_RESTORE, restoredHandler))
  }

  // ── 项目管理 ────────────────────────────────────────

  /**
   * 加载项目数据
   *
   * 从 ProjectModelJSON 反序列化并覆盖当前 project 的字段。
   * 不替换 project 引用本身（保持 Engine 其他子系统持有的一致性）。
   * 清空选中状态，广播 EVENT_PROJECT_LOAD。
   *
   * @param json - 项目序列化数据
   */
  loadProject(json: ProjectModelJSON): void {
    const restored = ProjectModel.fromJSON(json)

    this.project.pages = restored.pages
    this.project.name = restored.name
    this.project.activePageId = restored.activePageId
    this.project.dependencies = restored.dependencies
    this.project.apis = restored.apis

    this._selectedNodeId = null
    this.initialized = true
    emitter.emit(EVENT_PROJECT_LOAD, { projectId: this.project.id })
  }

  /**
   * 获取当前激活页面的 BlockModel
   *
   * @returns 当前激活的 BlockModel，无页面时返回 null
   */
  getActiveBlock(): BlockModel | null {
    return this.project.getActivePage()
  }

  /**
   * 获取当前激活页面的序列化数据
   *
   * @returns BlockModelJSON，无页面时返回 null
   */
  getActiveBlockJSON(): BlockModelJSON | null {
    const block = this.getActiveBlock()
    return block?.toJSON() ?? null
  }

  /**
   * 切换当前激活页面
   *
   * 委托给 ProjectModel.switchPage()，广播 EVENT_PAGE_SWITCH。
   * 构造函数中已监听此事件，自动清空选中。
   *
   * @param pageId - 目标页面 ID
   */
  switchPage(pageId: string): void {
    this.project.switchPage(pageId)
  }

  // ── 节点操作 ────────────────────────────────────────

  /**
   * 在指定父节点下添加子节点
   *
   * 委托给当前活跃 BlockModel 的 addNode()。
   * 触发 EVENT_NODE_CHANGE（action=add）。
   *
   * @param parentId - 父节点 ID
   * @param node - 要添加的 NodeModel 实例
   * @param index - 插入位置，默认追加到末尾
   */
  addNode(parentId: string, node: NodeModel, index?: number): void {
    const block = this.getActiveBlock()
    if (!block) return
    block.addNode(parentId, node, index)
  }

  /**
   * 从节点树中移除指定节点
   *
   * 委托给当前活跃 BlockModel 的 removeNode()。
   * 触发 EVENT_NODE_CHANGE（action=remove）。
   * 构造函数中已监听此事件，自动清空选中。
   *
   * @param nodeId - 要移除的节点 ID
   * @returns 被移除的 NodeModel，不存在时返回 null
   */
  removeNode(nodeId: string): NodeModel | null {
    const block = this.getActiveBlock()
    if (!block) return null
    return block.removeNode(nodeId)
  }

  /**
   * 将节点从一个父节点移动到另一个父节点
   *
   * 委托给 BlockModel.moveNode()。
   *
   * @param nodeId - 要移动的节点 ID
   * @param targetParentId - 目标父节点 ID
   * @param index - 插入位置，默认追加到末尾
   */
  moveNode(nodeId: string, targetParentId: string, index?: number): void {
    const block = this.getActiveBlock()
    if (!block) return
    block.moveNode(nodeId, targetParentId, index)
  }

  /**
   * 将节点在同级中上移一位
   *
   * 找到父节点后调用 NodeModel.moveChild(idx-1)。
   * 如果已是第一个子节点则不操作。
   *
   * @param nodeId - 要移动的节点 ID
   */
  moveNodeUp(nodeId: string): void {
    const block = this.getActiveBlock()
    if (!block) return
    const parent = block.findParent(nodeId)
    if (!parent) return
    const idx = parent.children.findIndex((c) => c.id === nodeId)
    if (idx <= 0) return
    parent.moveChild(nodeId, idx - 1)
  }

  /**
   * 将节点在同级中下移一位
   *
   * 找到父节点后调用 NodeModel.moveChild(idx+1)。
   * 如果已是最后一个子节点则不操作。
   *
   * @param nodeId - 要移动的节点 ID
   */
  moveNodeDown(nodeId: string): void {
    const block = this.getActiveBlock()
    if (!block) return
    const parent = block.findParent(nodeId)
    if (!parent) return
    const idx = parent.children.findIndex((c) => c.id === nodeId)
    if (idx === -1 || idx >= parent.children.length - 1) return
    parent.moveChild(nodeId, idx + 1)
  }

  // ── 选中状态 ────────────────────────────────────────

  /**
   * 设置当前选中节点
   *
   * 更新 _selectedNodeId 并触发 onSelectionChange 回调。
   * 传入 null 清空选中。
   *
   * @param nodeId - 节点 ID，传入 null 清空选中
   */
  select(nodeId: string | null): void {
    this._selectedNodeId = nodeId
    this.onSelectionChange?.()
  }

  /**
   * 获取当前选中的 NodeModel 实例
   *
   * 通过 _selectedNodeId 查询 BlockModel 中的节点。
   *
   * @returns 选中的 NodeModel，未选中时返回 null
   */
  getSelected(): NodeModel | null {
    if (!this._selectedNodeId) return null
    const block = this.getActiveBlock()
    return block?.findNode(this._selectedNodeId) ?? null
  }

  /**
   * 获取当前选中的节点 ID
   *
   * @returns 节点 ID 字符串，未选中时返回 null
   */
  getSelectedNodeId(): string | null {
    return this._selectedNodeId
  }

  // ── History 快捷方法 ────────────────────────────────

  /** 撤销（委托给 History.undo()） */
  undo(): void {
    this.history.undo()
  }

  /** 重做（委托给 History.redo()） */
  redo(): void {
    this.history.redo()
  }

  /** 是否可以撤销 */
  canUndo(): boolean {
    return this.history.canUndo()
  }

  /** 是否可以重做 */
  canRedo(): boolean {
    return this.history.canRedo()
  }

  // ── 序列化 ──────────────────────────────────────────

  /**
   * 序列化项目数据
   *
   * 委托给 ProjectModel.toJSON()。
   *
   * @returns 可 JSON.stringify 的 ProjectModelJSON
   */
  toJSON(): ProjectModelJSON {
    return this.project.toJSON()
  }

  // ── 生命周期 ────────────────────────────────────────

  /**
   * 销毁 Engine，释放所有资源
   *
   * 取消事件订阅，销毁 History，清空选中状态。
   */
  destroy(): void {
    for (const unsub of this.unsubscribers) {
      unsub()
    }
    this.unsubscribers = []

    this.history.dispose()
    this._selectedNodeId = null
    this.initialized = false
  }
}
