/**
 * EventBridge - 跨 iframe 事件桥梁
 *
 * 在 iframe document 上通过事件委托监听用户交互，
 * 转发为结构化的事件供 Designer / Engine 使用。
 *
 * 原理：
 * - 利用 RenderContext.markElement() 注入的 `data-__node-id__` 属性定位节点
 * - 事件委托到 iframe document 层级，避免为每个元素绑定事件
 * - 同源 iframe，直接 JS 调用，无需 postMessage
 *
 * @example
 * ```ts
 * const bridge = new EventBridge(simulator.getDocument())
 * bridge.on('nodeClick', (payload) => { ... })
 * bridge.setup()
 * ```
 */

/** 节点交互事件 */
export interface NodeInteractionEvent {
  /** 节点 ID */
  nodeId: string
  /** 原始 DOM 事件 */
  originalEvent: MouseEvent
}

/** EventBridge 支持的事件类型 */
export type BridgeEventType = 'nodeClick' | 'nodeHover' | 'nodeMouseLeave'

/** 事件处理器 */
export type BridgeEventHandler = (payload: NodeInteractionEvent) => void

export class EventBridge {
  /** 监听的 document（iframe 内） */
  private doc: Document | null

  /** 事件处理器映射 */
  private handlers: Map<BridgeEventType, Set<BridgeEventHandler>> = new Map()

  /** 绑定的原始事件清理函数 */
  private cleanupFns: (() => void)[] = []

  constructor(doc: Document | null) {
    this.doc = doc
  }

  /**
   * 启动事件监听
   */
  setup(): void {
    if (!this.doc) return

    // click → nodeClick
    this.bindDOMEvent('click', 'nodeClick')

    // mouseover → nodeHover
    this.bindDOMEvent('mouseover', 'nodeHover')

    // mouseout → nodeMouseLeave
    this.bindDOMEvent('mouseout', 'nodeMouseLeave')
  }

  /**
   * 停止事件监听
   */
  teardown(): void {
    for (const fn of this.cleanupFns) {
      fn()
    }
    this.cleanupFns = []
    this.handlers.clear()
  }

  /**
   * 更新 document 引用（iframe 重建时调用）
   */
  setDocument(doc: Document | null): void {
    this.teardown()
    this.doc = doc
  }

  // ── 事件订阅 ──────────────────────────────────────────

  /**
   * 注册事件处理器
   *
   * @returns 取消注册函数
   */
  on(event: BridgeEventType, handler: BridgeEventHandler): () => void {
    let set = this.handlers.get(event)
    if (!set) {
      set = new Set()
      this.handlers.set(event, set)
    }
    set.add(handler)

    return () => {
      set!.delete(handler)
    }
  }

  // ── 内部 ──────────────────────────────────────────────

  /**
   * 绑定 DOM 事件到 Bridge 事件
   */
  private bindDOMEvent(domEvent: string, bridgeEvent: BridgeEventType): void {
    const doc = this.doc
    if (!doc) return

    const handler = (e: Event) => {
      const nodeId = this.findNodeId(e.target as HTMLElement)
      if (!nodeId) return

      this.emit(bridgeEvent, {
        nodeId,
        originalEvent: e as MouseEvent,
      })
    }

    doc.addEventListener(domEvent, handler, true)

    this.cleanupFns.push(() => {
      doc.removeEventListener(domEvent, handler, true)
    })
  }

  /**
   * 从 DOM 元素向上查找 data-__node-id__
   */
  private findNodeId(el: HTMLElement | null): string | null {
    let current: HTMLElement | null = el
    while (current && current.parentElement !== null) {
      const nodeId = current.getAttribute?.('data-__node-id__')
      if (nodeId) return nodeId
      current = current.parentElement
    }
    return null
  }

  /**
   * 发射 Bridge 事件
   */
  private emit(event: BridgeEventType, payload: NodeInteractionEvent): void {
    const set = this.handlers.get(event)
    if (!set) return
    for (const handler of set) {
      handler(payload)
    }
  }
}
