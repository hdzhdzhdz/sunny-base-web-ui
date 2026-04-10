/**
 * History - 快照式撤销/重做
 *
 * 监听所有 Model 变更事件，以 BlockModelJSON 快照形式记录历史。
 * 支持批处理（50ms 窗口内多个事件合并为一个快照）。
 *
 * 设计选择：快照 vs Command
 * - 快照：BlockModelJSON 序列化已完善，实现简单，零额外开发
 * - Command：需为每种操作定义逆操作，易出错
 * - 典型页面快照几 KB，50 条 < 500KB，可接受
 *
 * @example
 * ```ts
 * const history = new History(eventBus, () => currentBlock)
 * history.undo()   // 恢复上一个快照
 * history.redo()   // 重做
 * ```
 */
import { nanoid } from 'nanoid'
import type { IEventBus } from '../event/index'
import { DesignerEventType } from '../event/index'
import type { BlockModelJSON } from '../model/types'
import type { BlockModel } from '../model/block-model'

/** 历史快照 */
export interface Snapshot {
  /** 快照唯一 ID */
  id: string
  /** 创建时间戳 */
  timestamp: number
  /** 操作标签（如 'setProp:type', 'addChild:SunnyButton'） */
  label: string
  /** 所属 Block ID */
  blockId: string
  /** 完整的 Block 序列化数据 */
  data: BlockModelJSON
}

/** History 构造选项 */
export interface HistoryOptions {
  /** 最大快照数量，默认 50 */
  maxSize?: number
  /** 批处理窗口（ms），默认 50 */
  batchWindow?: number
}

export class History {
  /** 快照栈 */
  private snapshots: Snapshot[] = []

  /** 当前游标（指向当前状态在栈中的位置） */
  private cursor: number = -1

  /** 最大快照数 */
  private readonly maxSize: number

  /** 批处理窗口 */
  private readonly batchWindow: number

  /** 事件总线 */
  private readonly eventBus: IEventBus

  /** 获取当前活跃 Block 的函数 */
  private readonly getActiveBlock: () => BlockModel | null

  /** 批处理定时器 */
  private batchTimer: ReturnType<typeof setTimeout> | null = null

  /** 批处理中积攒的标签 */
  private pendingLabel: string = ''

  /** 是否正在恢复中（恢复期间不录制） */
  private isRestoring: boolean = false

  /** 取消订阅函数列表 */
  private unsubscribers: (() => void)[] = []

  constructor(
    eventBus: IEventBus,
    getActiveBlock: () => BlockModel | null,
    options?: HistoryOptions,
  ) {
    this.eventBus = eventBus
    this.getActiveBlock = getActiveBlock
    this.maxSize = options?.maxSize ?? 50
    this.batchWindow = options?.batchWindow ?? 50
    this.setupListeners()
  }

  // ── 公共 API ──────────────────────────────────────

  /**
   * 撤销
   *
   * 恢复到上一个快照，触发 HistoryRestoring/HistoryRestored 事件。
   */
  undo(): void {
    if (!this.canUndo()) return
    const snapshot = this.snapshots[this.cursor - 1]
    this.restore(snapshot)
  }

  /**
   * 重做
   */
  redo(): void {
    if (!this.canRedo()) return
    const snapshot = this.snapshots[this.cursor + 1]
    this.restore(snapshot)
  }

  /**
   * 是否可以撤销
   */
  canUndo(): boolean {
    return this.cursor > 0
  }

  /**
   * 是否可以重做
   */
  canRedo(): boolean {
    return this.cursor < this.snapshots.length - 1
  }

  /**
   * 当前游标位置
   */
  getCursor(): number {
    return this.cursor
  }

  /**
   * 快照总数
   */
  getSnapshotCount(): number {
    return this.snapshots.length
  }

  /**
   * 获取所有快照（只读）
   */
  getSnapshots(): ReadonlyArray<Snapshot> {
    return this.snapshots
  }

  // ── 手动快照（Engine 可在关键时刻调用）──────────────

  /**
   * 立即拍一个快照（不经过批处理）
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
   * 监听所有 Model 变更事件，触发批处理快照。
   */
  private setupListeners(): void {
    const mutationEvents = [
      DesignerEventType.NodeAdded,
      DesignerEventType.NodeRemoved,
      DesignerEventType.NodeMoved,
      DesignerEventType.NodePropsChanged,
      DesignerEventType.NodeEventsChanged,
      DesignerEventType.NodeDirectiveChanged,
      DesignerEventType.StateChanged,
      DesignerEventType.ComputedChanged,
      DesignerEventType.MethodChanged,
      DesignerEventType.WatchChanged,
      DesignerEventType.CssChanged,
    ]

    for (const eventType of mutationEvents) {
      const unsub = this.eventBus.on(eventType as any, (payload: any) => {
        if (this.isRestoring) return
        this.scheduleSnapshot(eventType as string)
      })
      this.unsubscribers.push(unsub)
    }
  }

  /**
   * 调度快照（批处理）
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
   */
  private pushSnapshot(snapshot: Snapshot): void {
    // 截断 redo 栈
    if (this.cursor < this.snapshots.length - 1) {
      this.snapshots = this.snapshots.slice(0, this.cursor + 1)
    }

    this.snapshots.push(snapshot)

    // 超出上限，移除最旧的
    if (this.snapshots.length > this.maxSize) {
      this.snapshots.shift()
    }

    this.cursor = this.snapshots.length - 1
    this.emitChange()
  }

  /**
   * 恢复到指定快照
   */
  private restore(snapshot: Snapshot): void {
    const block = this.getActiveBlock()
    if (!block) return

    // 标记正在恢复，避免恢复过程中的事件触发新的快照
    this.isRestoring = true

    this.eventBus.emit(DesignerEventType.HistoryRestoring, {
      snapshotId: snapshot.id,
    })

    // 用快照数据重建 Block（通过 fromJSON 的内部逻辑恢复所有状态）
    const restored = (block.constructor as typeof BlockModel).fromJSON(
      snapshot.data,
      // @ts-expect-error BlockModel 内部访问 eventBus
      block.eventBus ?? this.eventBus,
    )

    // 将恢复的数据复制回当前 block
    // 由于 BlockModel 没有直接的 "replace internals" API，
    // 我们通过 emit 事件让 Engine/Subscriber 处理替换
    this.cursor = this.snapshots.indexOf(snapshot)

    this.eventBus.emit(DesignerEventType.HistoryRestored, {
      snapshotId: snapshot.id,
      blockId: snapshot.blockId,
    })

    this.isRestoring = false
    this.emitChange()
  }

  /**
   * 发射 HistoryChanged 事件
   */
  private emitChange(): void {
    this.eventBus.emit(DesignerEventType.HistoryChanged, {
      cursor: this.cursor,
      total: this.snapshots.length,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
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
    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
      this.batchTimer = null
    }
    this.snapshots = []
    this.cursor = -1
  }
}
