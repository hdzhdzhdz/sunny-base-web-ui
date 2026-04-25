/**
 * Designer - 画布交互状态层
 *
 * 管理画布交互的响应式状态，不包含任何 DOM 操作。
 * 通过 EventBridge 监听 iframe 内的用户行为，更新 hoveredNodeId 等 Ref，
 * 由 useDesigner（计算层）和 DesignerOverlay（渲染层）消费。
 *
 * ## 三层架构
 *
 * ```
 * designer.ts (本文件)
 *   → 纯状态：hoveredNodeId, selectedNodeId
 *   → 事件监听：EventBridge → 更新 Ref → engine.select()
 *       ↓ reactive Ref
 * useDesigner.ts
 *   → 计算：Ref + Simulator → CSS 样式对象
 *       ↓ computed style
 * DesignerOverlay.vue
 *   → 渲染：<div> + Tailwind + Arco icons
 * ```
 *
 * @example
 * ```ts
 * const designer = new Designer({ simulator, engine, materialStore, actions })
 * designer.activate()
 * // hoveredNodeId / selectedNodeId 变化 → useDesigner computed → Overlay 重渲染
 * ```
 */
import { ref, type Ref } from 'vue'
import type { Simulator } from '../simulator/simulator'
import { EventBridge } from './event-bridge'
import type { BridgeEventHandler } from './event-bridge'
import type { Engine } from '../engine/engine'
import type { MaterialStore } from '@sunny-base-web/designer-materials'

/**
 * 节点操作回调
 *
 * 由 Workspace 提供，DesignerOverlay 的工具栏按钮点击时调用。
 */
export interface DesignerActions {
  /** 删除节点回调 */
  onNodeDelete?: (nodeId: string) => void
  /** 上移节点回调 */
  onNodeMoveUp?: (nodeId: string) => void
  /** 下移节点回调 */
  onNodeMoveDown?: (nodeId: string) => void
}

/**
 * Designer 构造选项
 */
export interface DesignerOptions {
  /** Simulator 实例（用于获取 iframe document 和 DOM 元素） */
  simulator: Simulator
  /** Engine 实例（用于读写选中状态） */
  engine: Engine
  /** 物料存储（预留） */
  materialStore: MaterialStore
  /** 操作回调 */
  actions?: DesignerActions
}

export class Designer {
  /** Simulator 实例 */
  readonly simulator: Simulator
  /** Engine 实例 */
  readonly engine: Engine
  /** 物料存储 */
  readonly materialStore: MaterialStore
  /** 节点操作回调 */
  readonly actions: DesignerActions

  /** 当前悬浮的节点 ID（响应式，供 useDesigner 消费） */
  hoveredNodeId: Ref<string | null> = ref(null)

  /** 当前选中的节点 ID（响应式，从 engine 同步） */
  selectedNodeId: Ref<string | null> = ref(null)

  /** iframe 事件桥梁 */
  private bridge: EventBridge | null = null
  /** EventBridge 取消订阅函数列表 */
  private unsubscribers: (() => void)[] = []
  /** 是否已激活 */
  private active: boolean = false
  /** 悬浮框隐藏延迟定时器（30ms 防闪烁） */
  private hoverHideTimer: ReturnType<typeof setTimeout> | null = null
  /** engine.onSelectionChange 的前一个回调（deactivate 时恢复） */
  private prevOnSelectionChange: (() => void) | null = null

  /**
   * 创建 Designer 实例
   *
   * @param options - 构造选项
   */
  constructor(options: DesignerOptions) {
    this.simulator = options.simulator
    this.engine = options.engine
    this.materialStore = options.materialStore
    this.actions = options.actions ?? {}
  }

  // ── 生命周期 ──────────────────────────────────────────

  /**
   * 激活 Designer
   *
   * 等 Simulator 就绪后设置 EventBridge。
   * 调用多次安全（幂等）。
   */
  activate(): void {
    if (this.active) return

    this.simulator.onReady(() => {
      this.setupBridge()
    })

    // 链式劫持 engine.onSelectionChange，同步选中状态到 Ref
    // SetterPanel 已在 setup 中设置该回调，此处链式保留
    this.prevOnSelectionChange = this.engine.onSelectionChange
    this.engine.onSelectionChange = () => {
      this.prevOnSelectionChange?.()
      this.selectedNodeId.value = this.engine.getSelectedNodeId()
    }

    this.active = true
  }

  /**
   * 停用 Designer
   *
   * 清理 EventBridge、定时器、订阅。
   */
  deactivate(): void {
    if (!this.active) return

    this.teardownBridge()

    // 恢复 engine.onSelectionChange
    this.engine.onSelectionChange = this.prevOnSelectionChange
    this.prevOnSelectionChange = null

    if (this.hoverHideTimer) {
      clearTimeout(this.hoverHideTimer)
      this.hoverHideTimer = null
    }

    for (const unsub of this.unsubscribers) {
      unsub()
    }
    this.unsubscribers = []

    this.hoveredNodeId.value = null
    this.selectedNodeId.value = null
    this.active = false
  }

  /** 是否已激活 */
  isActive(): boolean {
    return this.active
  }

  // ── EventBridge ──────────────────────────────────────

  /**
   * 设置 EventBridge
   *
   * 在 iframe document 上监听 click/mouseover/mouseout。
   */
  private setupBridge(): void {
    const doc = this.simulator.getDocument()
    if (!doc) return

    this.bridge = new EventBridge(doc)
    this.bridge.setup()

    const unsubClick = this.bridge.on('nodeClick', this.handleNodeClick)
    const unsubHover = this.bridge.on('nodeHover', this.handleNodeHover)
    const unsubLeave = this.bridge.on('nodeMouseLeave', this.handleNodeMouseLeave)

    this.unsubscribers.push(unsubClick, unsubHover, unsubLeave)
  }

  /** 拆除 EventBridge */
  private teardownBridge(): void {
    this.bridge?.teardown()
    this.bridge = null
  }

  // ── 拖拽（预留）──────────────────────────────────────

  /** 开始拖拽（预留接口） */
  startDrag(_componentName: string): void {
    // TODO: 实现从组件库拖拽到画布的交互
  }

  /** 取消拖拽（预留接口） */
  cancelDrag(): void {
    // TODO: 取消拖拽交互
  }

  // ── 事件处理器 ──────────────────────────────────────

  /** 节点点击：清空悬浮，选中节点 */
  private handleNodeClick: BridgeEventHandler = (payload) => {
    this.hoveredNodeId.value = null
    this.engine.select(payload.nodeId)
  }

  /** 节点悬浮：更新 hoveredNodeId（已选中节点不显示悬浮框，同一节点不重复） */
  private handleNodeHover: BridgeEventHandler = (payload) => {
    if (this.hoverHideTimer) {
      clearTimeout(this.hoverHideTimer)
      this.hoverHideTimer = null
    }

    if (this.engine.getSelectedNodeId() === payload.nodeId) {
      this.hoveredNodeId.value = null
      return
    }

    if (this.hoveredNodeId.value === payload.nodeId) return

    this.hoveredNodeId.value = payload.nodeId
  }

  /** 鼠标离开：30ms 延迟清空悬浮（防闪烁） */
  private handleNodeMouseLeave: BridgeEventHandler = () => {
    this.hoverHideTimer = setTimeout(() => {
      this.hoveredNodeId.value = null
    }, 30)
  }
}
