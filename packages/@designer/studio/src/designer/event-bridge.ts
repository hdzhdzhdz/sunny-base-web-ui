/**
 * EventBridge - 跨 iframe 事件桥梁
 *
 * 在 iframe document 上通过事件委托监听用户交互，
 * 转发为结构化的语义事件供 Designer 状态层使用。
 *
 * ## 原理
 *
 * ```
 * iframe 内 DOM:
 *   <div data-__node-id__="node_abc">     ← RenderContext.markElement() 注入
 *     <button>...</button>
 *   </div>
 *
 * 事件委托（capture 阶段）:
 *   iframe doc.addEventListener('click', handler, true)
 *     → e.target = <button>
 *     → 向上查找 data-__node-id__ → 找到 "node_abc"
 *     → 发射 nodeClick { nodeId: "node_abc", originalEvent }
 * ```
 *
 * ## 支持的事件
 *
 * | DOM 事件    | Bridge 事件      | 说明       |
 * |------------|------------------|-----------|
 * | click      | nodeClick        | 节点选中    |
 * | mouseover  | nodeHover        | 节点悬浮    |
 * | mouseout   | nodeMouseLeave   | 鼠标离开    |
 *
 * ## 同源优势
 *
 * 同源 iframe 可直接访问 contentDocument，
 * 无需 postMessage 序列化，事件处理器在主窗口执行上下文中。
 *
 * @example
 * ```ts
 * const bridge = new EventBridge(simulator.getDocument())
 *
 * const unsub = bridge.on('nodeClick', (payload) => {
 *   console.log('选中节点:', payload.nodeId)
 * })
 *
 * bridge.setup()
 *
 * // 清理
 * unsub()
 * bridge.teardown()
 * ```
 */

/**
 * 节点交互事件载荷
 */
export interface NodeInteractionEvent {
  /** 触发事件的节点 ID（从 data-__node-id__ 属性读取） */
  nodeId: string
  /** 原始 DOM 鼠标事件 */
  originalEvent: MouseEvent
}

/**
 * EventBridge 支持的事件类型
 *
 * - `nodeClick` — 用户点击了某个节点
 * - `nodeHover` — 鼠标悬浮到某个节点上
 * - `nodeMouseLeave` — 鼠标离开节点区域
 */
export type BridgeEventType = 'nodeClick' | 'nodeHover' | 'nodeMouseLeave'

/**
 * 事件处理器函数类型
 */
export type BridgeEventHandler = (payload: NodeInteractionEvent) => void

export class EventBridge {
  /** 监听的 document（iframe 内） */
  private doc: Document | null

  /** 事件处理器映射（每种事件类型对应一个 Set） */
  private handlers: Map<BridgeEventType, Set<BridgeEventHandler>> = new Map()

  /** DOM 事件清理函数列表 */
  private cleanupFns: (() => void)[] = []

  /**
   * 创建 EventBridge
   *
   * @param doc - iframe 的 Document 对象（可为 null，后续通过 setDocument 设置）
   */
  constructor(doc: Document | null) {
    this.doc = doc
  }

  /**
   * 启动事件监听
   *
   * 在 iframe document 上绑定 click/mouseover/mouseout 事件（capture 阶段）。
   * 必须在 doc 可用后调用。
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
   *
   * 移除所有 DOM 事件监听，清空处理器。
   */
  teardown(): void {
    for (const fn of this.cleanupFns) {
      fn()
    }
    this.cleanupFns = []
    this.handlers.clear()
  }

  /**
   * 更新 document 引用
   *
   * iframe 重建时调用（如页面刷新），先 teardown 再重新绑定。
   *
   * @param doc - 新的 Document 对象
   */
  setDocument(doc: Document | null): void {
    this.teardown()
    this.doc = doc
  }

  // ── 事件订阅 ──────────────────────────────────────────

  /**
   * 注册事件处理器
   *
   * @param event - Bridge 事件类型
   * @param handler - 处理函数
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
   *
   * 在 iframe document 上以 capture 模式监听 DOM 事件，
   * 通过 findNodeId() 定位节点后发射对应的 Bridge 事件。
   *
   * @param domEvent - DOM 事件名（如 'click'）
   * @param bridgeEvent - Bridge 事件名（如 'nodeClick'）
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
   *
   * 沿 parentElement 向上遍历，找到第一个标记了节点 ID 的元素。
   * 这个属性由 @designer/render 的 RenderContext.markElement() 注入。
   *
   * @param el - 起始 DOM 元素
   * @returns 节点 ID，未找到时返回 null
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
   *
   * 通知所有注册了该事件类型的处理器。
   *
   * @param event - Bridge 事件类型
   * @param payload - 事件载荷
   */
  private emit(event: BridgeEventType, payload: NodeInteractionEvent): void {
    const set = this.handlers.get(event)
    if (!set) return
    for (const handler of set) {
      handler(payload)
    }
  }
}
