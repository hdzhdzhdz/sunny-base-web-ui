/**
 * Designer - 画布交互层
 *
 * 管理设计器画布中的用户交互，包括：
 * - 节点选中（通过 EventBridge 监听 iframe 内点击）
 * - 节点悬浮高亮
 * - 选中后操作按钮（上移/下移/删除）
 * - 选中/悬浮 Overlay 定位（在主窗口中，不受 iframe CSS 影响）
 *
 * 注意：EventBridge 必须在 Simulator iframe 加载完成后才能 setup()，
 * 因为 Simulator 的 writeSkeleton() 会调用 doc.open()，清除已注册的事件监听器。
 * 因此 activate() 中通过 simulator.onReady() 延迟绑定 EventBridge。
 */
import type { Simulator } from '../simulator/simulator'
import { EventBridge } from '../simulator/event-bridge'
import type { BridgeEventHandler } from '../simulator/event-bridge'
import type { Selection, IEventBus } from '@sunny-base-web/designer-core'
import { DesignerEventType } from '@sunny-base-web/designer-core'
import type { MaterialStore } from '@sunny-base-web/designer-materials'

/** 节点操作回调 */
export interface DesignerActions {
  /** 删除节点 */
  onNodeDelete?: (nodeId: string) => void
  /** 上移节点 */
  onNodeMoveUp?: (nodeId: string) => void
  /** 下移节点 */
  onNodeMoveDown?: (nodeId: string) => void
}

/** Designer 构造选项 */
export interface DesignerOptions {
  /** 模拟器实例 */
  simulator: Simulator
  /** 选择管理 */
  selection: Selection
  /** 物料存储 */
  materialStore: MaterialStore
  /** 事件总线 */
  eventBus: IEventBus
  /** 节点操作回调 */
  actions?: DesignerActions
}

/** Overlay 样式配置 */
const OVERLAY_STYLES: Partial<CSSStyleDeclaration> = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: '99999',
  border: '2px solid rgb(var(--primary-6))',
  backgroundColor: 'rgba(var(--primary-6), 0.08)',
  transition: 'all 0.15s ease',
}

const HOVER_OVERLAY_STYLES: Partial<CSSStyleDeclaration> = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: '99998',
  border: '1px dashed rgba(var(--primary-6), 0.6)',
  backgroundColor: 'transparent',
  transition: 'all 0.1s ease',
}

/** 工具栏 SVG 图标 */
const ICON_ARROW_UP = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>'
const ICON_ARROW_DOWN = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>'
const ICON_DELETE = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>'

export class Designer {
  /** 模拟器 */
  private readonly simulator: Simulator

  /** 选择管理 */
  private readonly selection: Selection

  /** 物料存储 */
  private readonly materialStore: MaterialStore

  /** 事件总线 */
  private readonly eventBus: IEventBus

  /** 操作回调 */
  private readonly actions: DesignerActions

  /** 事件桥 */
  private bridge: EventBridge | null = null

  /** 选中框 Overlay */
  private selectOverlay: HTMLDivElement | null = null

  /** 操作工具栏 */
  private toolbar: HTMLDivElement | null = null

  /** 悬浮框 Overlay */
  private hoverOverlay: HTMLDivElement | null = null

  /** 事件取消订阅 */
  private unsubscribers: (() => void)[] = []

  /** 是否激活 */
  private active: boolean = false

  /** 当前悬浮的节点 ID（防闪烁） */
  private hoveredNodeId: string | null = null

  /** 悬浮隐藏定时器（防子元素间移动闪烁） */
  private hoverHideTimer: ReturnType<typeof setTimeout> | null = null

  constructor(options: DesignerOptions) {
    this.simulator = options.simulator
    this.selection = options.selection
    this.materialStore = options.materialStore
    this.eventBus = options.eventBus
    this.actions = options.actions ?? {}
  }

  // ── 生命周期 ──────────────────────────────────────────

  /**
   * 激活画布交互
   *
   * 创建 Overlay 和工具栏，延迟绑定 EventBridge（等 iframe 就绪）。
   */
  activate(): void {
    if (this.active) return

    // 创建 Overlay
    this.selectOverlay = this.createOverlay(OVERLAY_STYLES, 'designer-select-overlay')
    this.hoverOverlay = this.createOverlay(HOVER_OVERLAY_STYLES, 'designer-hover-overlay')

    // 创建操作工具栏
    this.toolbar = this.createToolbar()

    document.body.appendChild(this.selectOverlay)
    document.body.appendChild(this.toolbar)
    document.body.appendChild(this.hoverOverlay)

    // 监听选中变化（拖入、快捷键等触发的选中）
    const unsubSelection = this.eventBus.on(DesignerEventType.SelectionChanged, () => {
      this.refreshSelectOverlay()
    })
    this.unsubscribers.push(unsubSelection)

    // 等 Simulator iframe 就绪后再绑定 EventBridge
    // （doc.open() 会清除已注册的事件监听器）
    this.simulator.onReady(() => {
      this.setupBridge()
    })

    this.active = true
  }

  /**
   * 停用画布交互
   */
  deactivate(): void {
    if (!this.active) return

    this.teardownBridge()

    if (this.hoverHideTimer) {
      clearTimeout(this.hoverHideTimer)
      this.hoverHideTimer = null
    }

    for (const unsub of this.unsubscribers) {
      unsub()
    }
    this.unsubscribers = []

    this.selectOverlay?.remove()
    this.toolbar?.remove()
    this.hoverOverlay?.remove()
    this.selectOverlay = null
    this.toolbar = null
    this.hoverOverlay = null

    this.active = false
  }

  isActive(): boolean {
    return this.active
  }

  // ── EventBridge ──────────────────────────────────────

  /**
   * 绑定 EventBridge（在 Simulator iframe 就绪后调用）
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

  /**
   * 断开 EventBridge
   */
  private teardownBridge(): void {
    this.bridge?.teardown()
    this.bridge = null
  }

  // ── 选中框更新 ────────────────────────────────────────

  /**
   * 刷新选中框位置
   */
  refreshSelectOverlay(): void {
    const selectedId = this.selection.getSelectedId()
    if (!selectedId || !this.selectOverlay) {
      this.hideOverlay(this.selectOverlay)
      this.hideToolbar()
      return
    }
    requestAnimationFrame(() => {
      this.positionOverlay(this.selectOverlay!, selectedId!)
      this.positionToolbar(selectedId!)
    })
  }

  // ── 拖拽（预留）──────────────────────────────────────

  startDrag(_componentName: string): void {
    // TODO
  }

  cancelDrag(): void {
    // TODO
  }

  // ── 事件处理器 ──────────────────────────────────────

  /** 处理节点点击 */
  private handleNodeClick: BridgeEventHandler = (payload) => {
    this.hoveredNodeId = null
    this.hideOverlay(this.hoverOverlay)
    this.selection.select(payload.nodeId)
    this.refreshSelectOverlay()
  }

  /** 处理节点悬浮 */
  private handleNodeHover: BridgeEventHandler = (payload) => {
    // 取消待执行的隐藏
    if (this.hoverHideTimer) {
      clearTimeout(this.hoverHideTimer)
      this.hoverHideTimer = null
    }

    // 已选中的节点不显示悬浮框（由 selectOverlay 负责）
    if (this.selection.getSelectedId() === payload.nodeId) {
      this.hoveredNodeId = null
      this.hideOverlay(this.hoverOverlay)
      return
    }

    // 同一节点不重复定位
    if (this.hoveredNodeId === payload.nodeId) return

    this.hoveredNodeId = payload.nodeId
    if (!this.hoverOverlay) return
    this.positionOverlay(this.hoverOverlay, payload.nodeId)
    this.hoverOverlay.style.display = 'block'
  }

  /** 处理鼠标离开节点 */
  private handleNodeMouseLeave: BridgeEventHandler = () => {
    this.hoverHideTimer = setTimeout(() => {
      this.hoveredNodeId = null
      this.hideOverlay(this.hoverOverlay)
    }, 30)
  }

  // ── 内部 ──────────────────────────────────────────────

  /** 创建操作工具栏 */
  private createToolbar(): HTMLDivElement {
    const toolbar = document.createElement('div')
    toolbar.className = 'designer-action-toolbar'
    Object.assign(toolbar.style, {
      position: 'fixed',
      zIndex: '100000',
      display: 'none',
      pointerEvents: 'auto',
      gap: '2px',
      padding: '2px',
      borderRadius: '4px',
      backgroundColor: 'rgb(var(--primary-6))',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
    })

    const btnUp = this.createToolbarButton(ICON_ARROW_UP, '上移', () => {
      const id = this.selection.getSelectedId()
      if (id) this.actions.onNodeMoveUp?.(id)
    })

    const btnDown = this.createToolbarButton(ICON_ARROW_DOWN, '下移', () => {
      const id = this.selection.getSelectedId()
      if (id) this.actions.onNodeMoveDown?.(id)
    })

    const btnDelete = this.createToolbarButton(ICON_DELETE, '删除', () => {
      const id = this.selection.getSelectedId()
      if (id) this.actions.onNodeDelete?.(id)
    })
    btnDelete.style.color = '#fff'
    btnDelete.onmouseenter = () => { btnDelete.style.backgroundColor = 'rgba(245,63,63,0.9)' }
    btnDelete.onmouseleave = () => { btnDelete.style.backgroundColor = 'transparent' }

    toolbar.appendChild(btnUp)
    toolbar.appendChild(btnDown)
    toolbar.appendChild(btnDelete)

    return toolbar
  }

  /** 创建工具栏按钮 */
  private createToolbarButton(iconSvg: string, title: string, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement('button')
    btn.title = title
    btn.innerHTML = iconSvg
    Object.assign(btn.style, {
      display: 'flex',
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      width: '24px',
      height: '24px',
      border: 'none',
      borderRadius: '3px',
      backgroundColor: 'transparent',
      color: 'rgba(255,255,255,0.9)',
      cursor: 'pointer',
      padding: '0',
    })
    btn.onmouseenter = () => { btn.style.backgroundColor = 'rgba(255,255,255,0.2)' }
    btn.onmouseleave = () => { btn.style.backgroundColor = 'transparent' }
    btn.onclick = (e) => {
      e.stopPropagation()
      onClick()
    }
    return btn
  }

  /** 定位工具栏到选中框右上角 */
  private positionToolbar(nodeId: string): void {
    if (!this.toolbar) return

    const element = this.simulator.getNodeElement(nodeId)
    if (!element) {
      this.hideToolbar()
      return
    }

    const elementRect = element.getBoundingClientRect()
    const iframeRect = this.simulator.getIframeRect()
    if (!iframeRect) {
      this.hideToolbar()
      return
    }

    const top = iframeRect.top + elementRect.top
    const left = iframeRect.left + elementRect.left

    this.toolbar.style.top = `${top - 30}px`
    this.toolbar.style.left = `${left + elementRect.width - 82}px`
    this.toolbar.style.display = 'flex'
  }

  /** 隐藏工具栏 */
  private hideToolbar(): void {
    if (this.toolbar) {
      this.toolbar.style.display = 'none'
    }
  }

  /** 创建 Overlay 元素 */
  private createOverlay(styles: Partial<CSSStyleDeclaration>, className: string): HTMLDivElement {
    const el = document.createElement('div')
    el.className = className
    Object.assign(el.style, styles)
    el.style.display = 'none'
    return el
  }

  /** 定位 Overlay 到指定节点 */
  private positionOverlay(overlay: HTMLDivElement, nodeId: string): void {
    const element = this.simulator.getNodeElement(nodeId)
    if (!element) {
      overlay.style.display = 'none'
      return
    }

    const elementRect = element.getBoundingClientRect()
    const iframeRect = this.simulator.getIframeRect()
    if (!iframeRect) {
      overlay.style.display = 'none'
      return
    }

    const top = iframeRect.top + elementRect.top
    const left = iframeRect.left + elementRect.left

    overlay.style.top = `${top}px`
    overlay.style.left = `${left}px`
    overlay.style.width = `${elementRect.width}px`
    overlay.style.height = `${elementRect.height}px`
    overlay.style.display = 'block'
  }

  /** 隐藏 Overlay */
  private hideOverlay(overlay: HTMLDivElement | null): void {
    if (overlay) {
      overlay.style.display = 'none'
    }
  }
}
