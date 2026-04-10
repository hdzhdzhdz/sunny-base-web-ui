/**
 * Selection - 节点选择管理
 *
 * 管理设计器中当前选中的节点 ID 列表。
 * 支持单选、多选、追加选中等模式。
 *
 * 放在 core 包是因为 History（撤销/重做）需要恢复选中状态，
 * Setter（属性面板）和 Designer（画布交互）都依赖选中。
 *
 * 自动监听：
 * - NodeRemoved → 取消被删除节点的选中
 * - PageSwitched → 切换页面时清空选中
 */
import type { IEventBus } from '../event/index'
import { DesignerEventType } from '../event/index'

export class Selection {
  /** 当前选中的节点 ID 列表 */
  private selectedIds: string[] = []

  /** 当前所在的 Block ID */
  private currentBlockId: string | null = null

  /** 事件总线 */
  private readonly eventBus: IEventBus

  /** 取消订阅函数列表 */
  private unsubscribers: (() => void)[] = []

  constructor(eventBus: IEventBus) {
    this.eventBus = eventBus
    this.setupListeners()
  }

  // ── 选中操作 ──────────────────────────────────────

  /**
   * 单选（清空之前的选中）
   */
  select(nodeId: string): void {
    if (this.selectedIds.length === 1 && this.selectedIds[0] === nodeId) return
    this.selectedIds = [nodeId]
    this.emitChange()
  }

  /**
   * 多选（替换整个选中列表）
   */
  selectMultiple(nodeIds: string[]): void {
    this.selectedIds = [...nodeIds]
    this.emitChange()
  }

  /**
   * 追加选中（Ctrl/Cmd + 点击）
   */
  addToSelection(nodeId: string): void {
    if (this.selectedIds.includes(nodeId)) return
    this.selectedIds.push(nodeId)
    this.emitChange()
  }

  /**
   * 从选中列表中移除
   */
  removeFromSelection(nodeId: string): void {
    const idx = this.selectedIds.indexOf(nodeId)
    if (idx === -1) return
    this.selectedIds.splice(idx, 1)
    this.emitChange()
  }

  /**
   * 清空所有选中
   */
  clear(): void {
    if (this.selectedIds.length === 0) return
    this.selectedIds = []
    this.emitChange()
  }

  // ── 查询 ──────────────────────────────────────────

  /** 获取所有选中的 ID */
  getSelectedIds(): string[] {
    return [...this.selectedIds]
  }

  /** 获取首个选中 ID（最常用） */
  getSelectedId(): string | null {
    return this.selectedIds[0] ?? null
  }

  /** 判断是否选中 */
  isSelected(nodeId: string): boolean {
    return this.selectedIds.includes(nodeId)
  }

  /** 是否有选中 */
  hasSelection(): boolean {
    return this.selectedIds.length > 0
  }

  /** 选中数量 */
  get count(): number {
    return this.selectedIds.length
  }

  // ── 内部 ──────────────────────────────────────────

  /**
   * 设置当前 Block（由 Engine 在切换页面时调用）
   */
  setCurrentBlock(blockId: string | null): void {
    this.currentBlockId = blockId
  }

  /**
   * 设置事件监听
   */
  private setupListeners(): void {
    // 节点删除 → 自动取消选中
    const unsubRemove = this.eventBus.on(DesignerEventType.NodeRemoved, (payload) => {
      const idx = this.selectedIds.indexOf(payload.nodeId)
      if (idx !== -1) {
        this.selectedIds.splice(idx, 1)
        this.emitChange()
      }
    })
    this.unsubscribers.push(unsubRemove)

    // 页面切换 → 清空选中
    const unsubSwitch = this.eventBus.on(DesignerEventType.PageSwitched, () => {
      this.clear()
    })
    this.unsubscribers.push(unsubSwitch)
  }

  /**
   * 发射 SelectionChanged 事件
   */
  private emitChange(): void {
    this.eventBus.emit(DesignerEventType.SelectionChanged, {
      selectedIds: [...this.selectedIds],
      blockId: this.currentBlockId,
    })
  }

  /**
   * 销毁，取消所有监听
   */
  dispose(): void {
    for (const unsub of this.unsubscribers) {
      unsub()
    }
    this.unsubscribers = []
    this.selectedIds = []
  }
}
