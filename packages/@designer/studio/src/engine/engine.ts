/**
 * Engine - 设计器中央引擎
 *
 * 作为所有子系统的协调器，对外提供统一 API。
 * 持有并管理 EventBus、ProjectModel、History、Selection、MaterialStore。
 *
 * 典型生命周期：
 * 1. `new Engine({ materialStore })` — 创建引擎
 * 2. `engine.loadProject(json)` — 加载项目数据
 * 3. `engine.switchPage(pageId)` — 切换当前页面
 * 4. `engine.addNode(...)` / `engine.removeNode(...)` — 操作节点
 * 5. `engine.undo()` / `engine.redo()` — 撤销重做
 * 6. `engine.destroy()` — 销毁释放资源
 *
 * @example
 * ```ts
 * const engine = new Engine({ materialStore })
 * engine.loadProject(projectJSON)
 * engine.switchPage('page-1')
 * engine.undo()
 * ```
 */
import { EventBus } from '@sunny-base-web/designer-core'
import type { IEventBus } from '@sunny-base-web/designer-core'
import { DesignerEventType } from '@sunny-base-web/designer-core'
import { ProjectModel } from '@sunny-base-web/designer-core'
import type { ProjectModelJSON, BlockModelJSON, BlockModel, NodeModel } from '@sunny-base-web/designer-core'
import { History } from '@sunny-base-web/designer-core'
import { Selection } from '@sunny-base-web/designer-core'
import type { MaterialStore } from '@sunny-base-web/designer-materials'

/** Engine 构造选项 */
export interface EngineOptions {
  /** 物料存储实例 */
  materialStore: MaterialStore
  /** 撤销重做最大快照数，默认 50 */
  historyMaxSize?: number
  /** 撤销重做批处理窗口（ms），默认 50 */
  historyBatchWindow?: number
}

export class Engine {
  // ── 子系统 ──────────────────────────────────────────

  /** 事件总线 */
  readonly eventBus: IEventBus

  /** 项目模型 */
  readonly project: ProjectModel

  /** 撤销重做 */
  readonly history: History

  /** 选择管理 */
  readonly selection: Selection

  /** 物料存储 */
  readonly materialStore: MaterialStore

  /** 是否已初始化 */
  private initialized: boolean = false

  /** 事件取消订阅列表 */
  private unsubscribers: (() => void)[] = []

  constructor(options: EngineOptions) {
    this.materialStore = options.materialStore

    // 创建事件总线
    this.eventBus = new EventBus()

    // 创建项目模型
    this.project = new ProjectModel(this.eventBus, '未命名项目')

    // 创建撤销重做（需要获取当前活跃 Block）
    this.history = new History(
      this.eventBus,
      () => this.project.getActivePage(),
      {
        maxSize: options.historyMaxSize,
        batchWindow: options.historyBatchWindow,
      },
    )

    // 创建选择管理
    this.selection = new Selection(this.eventBus)

    // 监听页面切换 → 更新 Selection 的 Block 上下文
    const unsubSwitch = this.eventBus.on(DesignerEventType.PageSwitched, (payload) => {
      this.selection.setCurrentBlock(payload.toPageId)
    })
    this.unsubscribers.push(unsubSwitch)

    // 监听历史恢复 → 触发重新渲染
    const unsubRestored = this.eventBus.on(DesignerEventType.HistoryRestored, (payload) => {
      const page = this.project.getActivePage()
      if (page && page.id === payload.blockId) {
        // 恢复数据到当前 Block（History 内部已完成快照数据的 fromJSON）
        // 这里 Engine 只需要通知 UI 层刷新
      }
    })
    this.unsubscribers.push(unsubRestored)
  }

  // ── 项目管理 ────────────────────────────────────────

  /**
   * 加载项目 JSON 数据
   *
   * 清空现有状态，用 JSON 重建 ProjectModel。
   * 会触发 ProjectLoaded 事件。
   */
  loadProject(json: ProjectModelJSON): void {
    // 用 fromJSON 重建整个 Project
    const restored = ProjectModel.fromJSON(json, this.eventBus)

    // 替换内部 pages 等数据（不替换 eventBus）
    this.project.pages = restored.pages
    this.project.name = restored.name
    this.project.activePageId = restored.activePageId
    this.project.dependencies = restored.dependencies
    this.project.apis = restored.apis

    // 更新 Selection 上下文
    if (this.project.activePageId) {
      this.selection.setCurrentBlock(this.project.activePageId)
    }

    this.initialized = true
    this.eventBus.emit(DesignerEventType.ProjectLoaded, { projectId: this.project.id })
  }

  /**
   * 获取当前活跃页面
   */
  getActiveBlock(): BlockModel | null {
    return this.project.getActivePage()
  }

  /**
   * 获取当前活跃页面的 JSON 快照
   */
  getActiveBlockJSON(): BlockModelJSON | null {
    const block = this.getActiveBlock()
    return block?.toJSON() ?? null
  }

  /**
   * 切换页面
   */
  switchPage(pageId: string): void {
    this.project.switchPage(pageId)
  }

  // ── 节点操作（委托给 BlockModel）─────────────────────

  /**
   * 添加节点
   */
  addNode(parentId: string, node: NodeModel, index?: number): void {
    const block = this.getActiveBlock()
    if (!block) return
    block.addNode(parentId, node, index)
  }

  /**
   * 移除节点
   */
  removeNode(nodeId: string): NodeModel | null {
    const block = this.getActiveBlock()
    if (!block) return null
    return block.removeNode(nodeId)
  }

  /**
   * 移动节点
   */
  moveNode(nodeId: string, targetParentId: string, index?: number): void {
    const block = this.getActiveBlock()
    if (!block) return
    block.moveNode(nodeId, targetParentId, index)
  }

  /**
   * 上移节点（在同级兄弟中前移一位）
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
   * 下移节点（在同级兄弟中后移一位）
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

  // ── History 快捷方法 ────────────────────────────────

  /**
   * 撤销
   */
  undo(): void {
    this.history.undo()
  }

  /**
   * 重做
   */
  redo(): void {
    this.history.redo()
  }

  /**
   * 是否可撤销
   */
  canUndo(): boolean {
    return this.history.canUndo()
  }

  /**
   * 是否可重做
   */
  canRedo(): boolean {
    return this.history.canRedo()
  }

  // ── Selection 快捷方法 ──────────────────────────────

  /**
   * 选中节点
   */
  select(nodeId: string | null): void {
    if (nodeId) {
      this.selection.select(nodeId)
    } else {
      this.selection.clear()
    }
  }

  /**
   * 获取当前选中节点
   */
  getSelected(): NodeModel | null {
    const id = this.selection.getSelectedId()
    if (!id) return null
    const block = this.getActiveBlock()
    return block?.findNode(id) ?? null
  }

  /**
   * 获取当前选中的节点 ID 列表
   */
  getSelectedIds(): string[] {
    return this.selection.getSelectedIds()
  }

  // ── 序列化 ──────────────────────────────────────────

  /**
   * 导出项目 JSON
   */
  toJSON(): ProjectModelJSON {
    return this.project.toJSON()
  }

  // ── 生命周期 ────────────────────────────────────────

  /**
   * 销毁引擎，释放所有资源
   */
  destroy(): void {
    // 取消事件订阅
    for (const unsub of this.unsubscribers) {
      unsub()
    }
    this.unsubscribers = []

    // 销毁子系统
    this.history.dispose()
    this.selection.dispose()

    // 清空事件总线
    this.eventBus.clear()

    this.initialized = false
  }
}
