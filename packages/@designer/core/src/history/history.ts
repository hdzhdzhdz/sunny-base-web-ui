/**
 * History - 快照式撤销/重做
 *
 * 监听全局 emitter 的 NODE_CHANGE / BLOCK_CHANGE 事件，以 BlockModelJSON 快照形式记录历史。
 * 支持批处理（50ms 窗口内多个事件合并为一个快照），避免频繁操作产生大量冗余快照。
 *
 * ## 设计选择：快照 vs Command
 *
 * - **快照**：BlockModelJSON 序列化已完善，实现简单，零额外开发
 * - **Command**：需为每种操作定义逆操作，易出错
 * - 典型页面快照几 KB，50 条 < 500KB，可接受
 *
 * ## 快照栈结构
 *
 * ```
 * snapshots: [S0, S1, S2, S3, S4, S5]
 *                            ↑ cursor=3
 *
 * undo → cursor 移到 2，恢复 S2
 * redo → cursor 移到 4，恢复 S4
 * 新操作 → 截断 S4~S5，追加新快照
 * ```
 *
 * ## 批处理机制
 *
 * ```
 * 时间线：
 * ├── setProp:type ──┐
 * ├── setProp:size    ├─ 50ms 窗口 ──→ 合并为一个快照
 * ├── addChild       ─┘
 * ...等待...
 * ├── removeChild ──── 单独触发 ──→ 单独快照
 * ```
 *
 * @example
 * ```ts
 * const history = new History(() => currentBlock)
 * history.undo()   // 恢复上一个快照
 * history.redo()   // 重做
 * history.dispose() // 清理资源
 * ```
 */
import { nanoid } from 'nanoid'
import {
  emitter,
  EVENT_NODE_CHANGE,
  EVENT_BLOCK_CHANGE,
  EVENT_HISTORY_CHANGE,
  EVENT_HISTORY_RESTORE,
} from '../emitter'
import type { BlockModelJSON } from '../model/types'
import { BlockModel } from '../model/block-model'

/**
 * 历史快照
 *
 * 存储某一时刻 BlockModel 的完整序列化数据。
 * 每个快照对应一次用户操作（或批处理合并后的多次操作）。
 */
export interface Snapshot {
  /** 快照唯一 ID */
  id: string
  /** 创建时间戳（Date.now()） */
  timestamp: number
  /**
   * 操作标签
   *
   * 标识触发快照的原因，如 'node:change'、'block:change'。
   * 批处理时保留第一个事件的标签。
   */
  label: string
  /** 所属 Block ID */
  blockId: string
  /** 完整的 Block 序列化数据 */
  data: BlockModelJSON
}

/**
 * History 构造选项
 */
export interface HistoryOptions {
  /** 最大快照数量，默认 50。超出时移除最旧的快照。 */
  maxSize?: number
  /**
   * 批处理窗口（毫秒），默认 50。
   *
   * 窗口内的多个变更事件合并为一个快照，
   * 避免一次拖拽操作产生几十个快照。
   */
  batchWindow?: number
}

export class History {
  /**
   * 快照栈
   *
   * 按时间顺序排列的快照数组，cursor 指向当前状态。
   * undo 后 redo 栈仍然存在，直到新操作截断。
   */
  private snapshots: Snapshot[] = []

  /**
   * 当前游标
   *
   * 指向当前状态在 snapshots 中的索引。
   * - 初始值 -1（空栈）
   * - 新增快照后指向最后一个元素
   * - undo 后向左移动
   * - redo 后向右移动
   */
  private cursor: number = -1

  /** 最大快照数 */
  private readonly maxSize: number

  /** 批处理窗口（ms） */
  private readonly batchWindow: number

  /**
   * 获取当前活跃 Block 的函数
   *
   * 由 Engine 注入，返回当前激活页面对应的 BlockModel。
   * History 不持有 BlockModel 引用，避免循环依赖。
   */
  private readonly getActiveBlock: () => BlockModel | null

  /** 批处理定时器 */
  private batchTimer: ReturnType<typeof setTimeout> | null = null

  /** 批处理中积攒的标签 */
  private pendingLabel: string = ''

  /**
   * 是否正在恢复中
   *
   * 恢复期间设为 true，防止恢复过程中的事件触发新的快照录制。
   * 恢复完成后重置为 false。
   */
  private isRestoring: boolean = false

  /** 取消订阅函数列表 */
  private unsubscribers: (() => void)[] = []

  /**
   * 创建 History 实例
   *
   * @param getActiveBlock - 获取当前活跃 Block 的函数（由 Engine 注入）
   * @param options - 构造选项
   */
  constructor(
    getActiveBlock: () => BlockModel | null,
    options?: HistoryOptions,
  ) {
    this.getActiveBlock = getActiveBlock
    this.maxSize = options?.maxSize ?? 50
    this.batchWindow = options?.batchWindow ?? 50
    this.setupListeners()
  }

  // ── 公共 API ──────────────────────────────────────

  /**
   * 撤销
   *
   * 将游标左移一位，恢复到上一个快照。
   * 触发 EVENT_HISTORY_RESTORE（恢复开始 + 恢复完成）和 EVENT_HISTORY_CHANGE。
   */
  undo(): void {
    if (!this.canUndo()) return
    const snapshot = this.snapshots[this.cursor - 1]
    this.restore(snapshot)
  }

  /**
   * 重做
   *
   * 将游标右移一位，恢复到下一个快照。
   */
  redo(): void {
    if (!this.canRedo()) return
    const snapshot = this.snapshots[this.cursor + 1]
    this.restore(snapshot)
  }

  /**
   * 是否可以撤销
   *
   * cursor > 0 时表示还有更早的快照可恢复。
   */
  canUndo(): boolean {
    return this.cursor > 0
  }

  /**
   * 是否可以重做
   *
   * cursor < snapshots.length - 1 时表示有更新的快照可恢复。
   */
  canRedo(): boolean {
    return this.cursor < this.snapshots.length - 1
  }

  /** 当前游标位置 */
  getCursor(): number {
    return this.cursor
  }

  /** 快照总数 */
  getSnapshotCount(): number {
    return this.snapshots.length
  }

  /**
   * 获取所有快照（只读）
   *
   * 用于 UI 展示历史记录列表。
   */
  getSnapshots(): ReadonlyArray<Snapshot> {
    return this.snapshots
  }

  // ── 手动快照 ──────────────────────────────────────

  /**
   * 立即拍一个快照（不经过批处理）
   *
   * Engine 可在关键时刻（如 loadProject 后）主动调用。
   *
   * @param label - 操作标签
   */
  takeSnapshot(label: string): void {
    const block = this.getActiveBlock()
    if (!block) return

    const snapshot: Snapshot = {
      id: nanoid(),
      timestamp: Date.now(),
      label,
      blockId: block.id,
      data: block.toJSON(),
    }

    this.pushSnapshot(snapshot)
  }

  // ── 内部 ──────────────────────────────────────────

  /**
   * 设置事件监听
   *
   * 监听 EVENT_NODE_CHANGE 和 EVENT_BLOCK_CHANGE，
   * 触发批处理快照。恢复期间（isRestoring=true）不录制。
   */
  private setupListeners(): void {
    const nodeHandler = () => {
      if (this.isRestoring) return
      this.scheduleSnapshot('node:change')
    }
    emitter.on(EVENT_NODE_CHANGE, nodeHandler)
    this.unsubscribers.push(() => emitter.off(EVENT_NODE_CHANGE, nodeHandler))

    const blockHandler = () => {
      if (this.isRestoring) return
      this.scheduleSnapshot('block:change')
    }
    emitter.on(EVENT_BLOCK_CHANGE, blockHandler)
    this.unsubscribers.push(() => emitter.off(EVENT_BLOCK_CHANGE, blockHandler))
  }

  /**
   * 调度快照（批处理）
   *
   * 首次调用时记录标签，启动定时器。
   * 定时器到期前的新调用会重置定时器（延迟拍照）。
   * 定时器到期后执行一次 takeSnapshot。
   */
  private scheduleSnapshot(label: string): void {
    if (!this.pendingLabel) {
      this.pendingLabel = label
    }

    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
    }

    this.batchTimer = setTimeout(() => {
      this.batchTimer = null
      this.takeSnapshot(this.pendingLabel)
      this.pendingLabel = ''
    }, this.batchWindow)
  }

  /**
   * 压入快照
   *
   * 截断当前位置之后的所有快照（undo 后的新操作会覆盖 redo 栈）。
   * 超出上限时移除最旧的快照。
   * 广播 EVENT_HISTORY_CHANGE。
   */
  private pushSnapshot(snapshot: Snapshot): void {
    if (this.cursor < this.snapshots.length - 1) {
      this.snapshots = this.snapshots.slice(0, this.cursor + 1)
    }

    this.snapshots.push(snapshot)

    if (this.snapshots.length > this.maxSize) {
      this.snapshots.shift()
    }

    this.cursor = this.snapshots.length - 1
    this.emitChange()
  }

  /**
   * 恢复到指定快照
   *
   * 1. 标记 isRestoring（防止恢复事件触发新快照）
   * 2. 广播 EVENT_HISTORY_RESTORE（恢复开始）
   * 3. 用快照数据 fromJSON 还原 BlockModel
   * 4. 将还原的数据逐字段写回当前 Block
   * 5. 更新游标位置
   * 6. 广播 EVENT_HISTORY_RESTORE（恢复完成）
   * 7. 重置 isRestoring
   *
   * @param snapshot - 目标快照
   */
  private restore(snapshot: Snapshot): void {
    const block = this.getActiveBlock()
    if (!block) return

    this.isRestoring = true

    // 广播恢复开始
    emitter.emit(EVENT_HISTORY_RESTORE, {
      snapshotId: snapshot.id,
      blockId: snapshot.blockId,
    })

    // 用快照数据还原 Block
    const restored = BlockModel.fromJSON(snapshot.data)

    // 逐字段写回当前 Block（不替换引用，保持 Engine 等上层持有的一致性）
    block.rootNode = restored.rootNode
    block.state = restored.state
    block.computed = restored.computed
    block.methods = restored.methods
    block.watch = restored.watch
    block.css = restored.css
    block.props = restored.props
    block.emits = restored.emits
    block.expose = restored.expose
    block.slots = restored.slots
    block.lifecycleHooks = restored.lifecycleHooks
    block.inject = restored.inject

    this.cursor = this.snapshots.indexOf(snapshot)

    // 广播恢复完成
    emitter.emit(EVENT_HISTORY_RESTORE, {
      snapshotId: snapshot.id,
      blockId: snapshot.blockId,
    })

    this.isRestoring = false
    this.emitChange()
  }

  /**
   * 广播 EVENT_HISTORY_CHANGE
   *
   * 通知 UI 层更新撤销/重做按钮状态。
   */
  private emitChange(): void {
    emitter.emit(EVENT_HISTORY_CHANGE, {
      cursor: this.cursor,
      total: this.snapshots.length,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
    })
  }

  /**
   * 销毁 History，释放所有资源
   *
   * 取消事件订阅，清除定时器，清空快照栈。
   */
  dispose(): void {
    for (const unsub of this.unsubscribers) {
      unsub()
    }
    this.unsubscribers = []
    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
      this.batchTimer = null
    }
    this.snapshots = []
    this.cursor = -1
  }
}
