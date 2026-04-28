/**
 * Simulator - iframe 沙箱渲染管理
 *
 * 管理同源 iframe 的生命周期，在其中创建独立的 Vue 应用运行渲染器。
 * 提供渲染控制、DOM 查询等 API 供 Engine / Designer 调用。
 *
 * ## 设计要点
 *
 * - **同源 iframe**：直接 JS 交互，无需 postMessage
 * - **样式隔离**：主文档 CSS 自动注入并同步更新（MutationObserver）
 * - **全量渲染 + 预留增量**：当前通过 reactive schema 全量渲染，后续可通过 refs 实现增量 patch
 * - **渲染器委托**：实际组件渲染由 @designer/render 包的 renderNode() 完成
 *
 * ## 渲染流程
 *
 * ```
 * mount(hostEl)
 *   ├── 创建 iframe（sandbox: allow-same-origin allow-scripts）
 *   ├── iframe load → onIframeLoad()
 *   │     ├── writeSkeleton()    — 写入基础 HTML 骨架
 *   │     ├── injectStyles()     — 注入父文档所有 CSS 规则
 *   │     ├── mountRenderer()    — 创建 Vue 应用 + 注册物料组件
 *   │     └── observeStyleChanges() — MutationObserver 监听父文档样式变化
 *   └── 通知 readyCallbacks
 *
 * renderBlock(blockJSON)
 *   └── schemaRef.value = blockJSON → reactive 触发 RootComponent 重渲染
 * ```
 *
 * ## Vue 应用架构
 *
 * ```
 * iframe 内:
 *   <div id="renderer-root">
 *     → createApp(RootComponent)
 *       → RootComponent.setup() 返回 render 函数
 *         → renderNode(schema, renderCtx, loader, 'design')
 *           → 递归渲染组件树，每个节点标记 data-__node-id__
 * ```
 *
 * @example
 * ```ts
 * const simulator = new Simulator({ materialStore })
 * simulator.mount(containerEl)
 * simulator.onReady(() => {
 *   simulator.renderBlock(blockRootNodeJSON)
 * })
 * ```
 */
import { createApp, reactive, type App } from 'vue'
import type { NodeModelJSON } from '@sunny-base-web/designer-core'
import type { MaterialStore } from '@sunny-base-web/designer-materials'
import { createLoader, RenderContext, renderNode } from '@sunny-base-web/designer-render'
import type { ComponentLoader } from '@sunny-base-web/designer-render'

/**
 * Simulator 构造选项
 */
export interface SimulatorOptions {
  /** 物料存储（提供组件元数据和运行时组件注册） */
  materialStore: MaterialStore
}

export class Simulator {
  /** 物料存储 */
  readonly materialStore: MaterialStore

  /** 组件加载器（从 MaterialStore 创建） */
  private loader: ComponentLoader | null = null

  /** 渲染上下文（设计态，包含节点标记和 refs） */
  private renderCtx: RenderContext | null = null

  /** iframe DOM 元素 */
  private iframe: HTMLIFrameElement | null = null

  /** iframe 内的 Vue 应用实例 */
  private innerApp: App | null = null

  /** 响应式 schema（变更触发重渲染） */
  private schemaRef: { value: NodeModelJSON | null } = { value: null }

  /** 父文档样式变化监听器 */
  private styleObserver: MutationObserver | null = null

  /** 是否已挂载（iframe load 完成） */
  private mounted: boolean = false

  /** 就绪回调队列（iframe load 后依次调用） */
  private readyCallbacks: (() => void)[] = []

  /**
   * 创建 Simulator 实例
   *
   * @param options - 构造选项
   */
  constructor(options: SimulatorOptions) {
    this.materialStore = options.materialStore
  }

  // ── 生命周期 ──────────────────────────────────────────

  /**
   * 挂载模拟器到指定容器
   *
   * 创建 iframe，添加到 host 容器，等待 iframe load 事件。
   * load 完成后自动写入骨架、注入样式、启动 Vue 应用。
   *
   * @param host - 挂载容器 DOM 元素
   */
  mount(host: HTMLElement): void {
    if (this.mounted) return

    // 创建 iframe
    this.iframe = document.createElement('iframe')
    this.iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts')
    this.iframe.style.width = '100%'
    this.iframe.style.height = '100%'
    this.iframe.style.border = 'none'
    this.iframe.style.display = 'block'
    host.appendChild(this.iframe)

    this.iframe.addEventListener('load', this.onIframeLoad)
  }

  /**
   * 销毁模拟器
   *
   * 卸载 Vue 应用，断开样式监听，移除 iframe。
   */
  destroy(): void {
    if (this.innerApp) {
      this.innerApp.unmount()
      this.innerApp = null
    }

    if (this.styleObserver) {
      this.styleObserver.disconnect()
      this.styleObserver = null
    }

    if (this.iframe) {
      this.iframe.removeEventListener('load', this.onIframeLoad)
      this.iframe.remove()
      this.iframe = null
    }

    this.renderCtx?.dispose()
    this.renderCtx = null
    this.loader = null
    this.mounted = false
  }

  // ── 渲染控制 ──────────────────────────────────────────

  /**
   * 全量渲染 Block
   *
   * 更新 reactive schemaRef，触发 RootComponent 重渲染。
   * 在页面切换、History 恢复、结构变更后调用。
   *
   * @param blockJSON - 根节点的序列化数据，传 null 清空画布
   */
  renderBlock(blockJSON: NodeModelJSON | null): void {
    this.schemaRef.value = blockJSON
  }

  /**
   * 增量更新节点（预留）
   *
   * 当前仍走全量渲染（structuredClone 触发 reactive 变更检测）。
   * 后续可通过 renderCtx.refs[nodeId] 获取组件实例，直接更新 props。
   *
   * @param _nodeId - 节点 ID
   * @param _nodeJSON - 节点序列化数据
   */
  renderNodeUpdate(_nodeId: string, _nodeJSON: NodeModelJSON): void {
    const current = this.schemaRef.value
    if (current) {
      this.schemaRef.value = structuredClone(current)
    }
  }

  // ── DOM 查询 ──────────────────────────────────────────

  /**
   * 获取 iframe 的 Document
   *
   * 供 EventBridge 绑定事件使用。
   *
   * @returns iframe Document，iframe 不存在时返回 null
   */
  getDocument(): Document | null {
    return this.iframe?.contentDocument ?? null
  }

  /**
   * 获取 iframe 的 Window
   *
   * @returns iframe Window，iframe 不存在时返回 null
   */
  getWindow(): Window | null {
    return this.iframe?.contentWindow ?? null
  }

  /**
   * 获取 iframe 在主窗口中的偏移矩形
   *
   * 供 Designer 计算 Overlay 位置使用。
   *
   * @returns DOMRect，iframe 不存在时返回 null
   */
  getIframeRect(): DOMRect | null {
    return this.iframe?.getBoundingClientRect() ?? null
  }

  /**
   * 通过节点 ID 获取对应的 DOM 元素
   *
   * 在 iframe document 中查询 `data-__node-id__` 属性。
   * 由 @designer/render 的 RenderContext.markElement() 注入。
   *
   * @param nodeId - 节点 ID
   * @returns DOM 元素，不存在时返回 null
   */
  getNodeElement(nodeId: string): HTMLElement | null {
    const doc = this.getDocument()
    if (!doc) return null
    return doc.querySelector(`[data-__node-id__="${nodeId}"]`)
  }

  /**
   * 获取渲染上下文
   *
   * @returns RenderContext 实例，未初始化时返回 null
   */
  getRenderContext(): RenderContext | null {
    return this.renderCtx
  }

  /**
   * 是否已挂载（iframe load 完成）
   */
  isMounted(): boolean {
    return this.mounted
  }

  /**
   * 注册就绪回调
   *
   * 如果 iframe 已加载则立即调用，否则等 load 后调用。
   * 供 Designer 等子系统等待 Simulator 初始化完成。
   *
   * @param cb - 就绪回调
   */
  onReady(cb: () => void): void {
    if (this.mounted) {
      cb()
    } else {
      this.readyCallbacks.push(cb)
    }
  }

  // ── 内部 ──────────────────────────────────────────────

  /**
   * iframe 加载完成回调
   *
   * 依次：写入骨架 → 注入样式 → 挂载渲染器 → 监听样式变化 → 通知就绪
   */
  private onIframeLoad = (): void => {
    const doc = this.iframe?.contentDocument
    if (!doc) return

    this.writeSkeleton(doc)
    this.injectStyles(doc)
    this.mountRenderer(doc)
    this.observeStyleChanges(doc)

    this.mounted = true

    // 通知所有等待就绪的回调
    const callbacks = this.readyCallbacks
    this.readyCallbacks = []
    for (const cb of callbacks) cb()
  }

  /**
   * 写入 HTML 骨架
   *
   * 在 iframe 中创建最小化的 HTML 文档，包含基础重置样式和渲染根节点。
   *
   * @param doc - iframe Document
   */
  private writeSkeleton(doc: Document): void {
    doc.open()
    doc.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    /* 基础重置 */
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; padding: 0; font-family: inherit; }
  </style>
</head>
<body>
  <div id="renderer-root"></div>
</body>
</html>`)
    doc.close()
  }

  /**
   * 注入父文档样式
   *
   * 遍历主文档的所有样式表，将 CSS 规则复制到 iframe 中。
   * 确保画布内的组件与主文档使用相同的样式（Arco Design、Tailwind 等）。
   * 跨域样式表无法读取，静默忽略。
   *
   * @param doc - iframe Document
   */
  private injectStyles(doc: Document): void {
    const styleEl = doc.createElement('style')
    styleEl.setAttribute('data-source', 'designer-parent')

    let cssText = ''
    try {
      const sheets = Array.from(document.styleSheets)
      for (const sheet of sheets) {
        try {
          const rules = Array.from(sheet.cssRules)
          for (const rule of rules) {
            cssText += rule.cssText + '\n'
          }
        } catch {
          // 跨域样式表无法读取，忽略
        }
      }
    } catch {
      // 安全限制，忽略
    }

    styleEl.textContent = cssText
    doc.head.appendChild(styleEl)
  }

  /**
   * 在 iframe 中创建 Vue 应用
   *
   * 1. 创建 reactive schema（响应式数据驱动渲染）
   * 2. 创建 ComponentLoader（物料组件加载）
   * 3. 创建 RenderContext（设计态渲染上下文）
   * 4. 创建 RootComponent（setup 返回 render 函数）
   * 5. 注册所有物料组件到 Vue 应用
   * 6. 挂载到 iframe 的 #renderer-root
   *
   * @param doc - iframe Document
   */
  private mountRenderer(doc: Document): void {
    const rootEl = doc.getElementById('renderer-root')
    if (!rootEl) return

    // 创建响应式 schema
    this.schemaRef = reactive({ value: null })

    // 创建组件加载器
    this.loader = createLoader({ materialStore: this.materialStore })

    // 创建渲染上下文（设计态）
    this.renderCtx = new RenderContext()

    // 根渲染组件
    const simulator = this
    const RootComponent = {
      setup() {
        return () => {
          if (!simulator.schemaRef.value) return null
          try {
            return renderNode(
              simulator.schemaRef.value,
              simulator.renderCtx!,
              simulator.loader!,
              'design',
            )
          } catch (err) {
            console.warn('[Simulator] render error:', err)
            return null
          }
        }
      },
    }

    // 创建并挂载
    this.innerApp = createApp(RootComponent)

    // 全局错误处理：防止单个组件渲染错误拖垮整个 Vue 应用
    this.innerApp.config.errorHandler = (err) => {
      console.warn('[Simulator] component error:', err)
    }

    // 注册物料组件（跳过原生 HTML 元素，它们用标签名字符串，不需要全局注册）
    for (const [name, component] of this.materialStore.getAllComponents()) {
      if (typeof component === 'string') continue
      this.innerApp.component(name, component)
    }

    this.innerApp.mount(rootEl)
  }

  /**
   * 监听父文档样式变化
   *
   * 通过 MutationObserver 监听 document.head 的变化（样式热更新等），
   * 变化时重新注入样式到 iframe。
   *
   * @param doc - iframe Document
   */
  private observeStyleChanges(doc: Document): void {
    this.styleObserver = new MutationObserver(() => {
      const styleEl = doc.querySelector('[data-source="designer-parent"]')
      if (styleEl) {
        styleEl.remove()
      }
      this.injectStyles(doc)
    })

    this.styleObserver.observe(document.head, {
      childList: true,
      subtree: true,
    })
  }
}
