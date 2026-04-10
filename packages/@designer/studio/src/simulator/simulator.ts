/**
 * Simulator - iframe 沙箱渲染管理
 *
 * 管理同源 iframe 的生命周期，在其中创建独立的 Vue 应用运行渲染器。
 * 提供渲染控制、DOM 查询等 API 供 Engine / Designer 调用。
 *
 * 设计要点：
 * - 同源 iframe，直接 JS 交互，无需 postMessage
 * - 主文档样式自动注入并同步更新
 * - 支持全量重渲染和增量更新（通过 refs）
 *
 * @example
 * ```ts
 * const simulator = new Simulator({ materialStore })
 * simulator.mount(containerEl)
 * simulator.renderBlock(blockJSON)
 * ```
 */
import { createApp, reactive, type App } from 'vue'
import type { NodeModelJSON } from '@sunny-base-web/designer-core'
import type { MaterialStore } from '@sunny-base-web/designer-materials'
import { createLoader, RenderContext, renderNode } from '@sunny-base-web/designer-render'
import type { ComponentLoader } from '@sunny-base-web/designer-render'

/** Simulator 构造选项 */
export interface SimulatorOptions {
  /** 物料存储 */
  materialStore: MaterialStore
}

export class Simulator {
  /** 物料存储 */
  readonly materialStore: MaterialStore

  /** 组件加载器 */
  private loader: ComponentLoader | null = null

  /** 渲染上下文 */
  private renderCtx: RenderContext | null = null

  /** iframe 元素 */
  private iframe: HTMLIFrameElement | null = null

  /** iframe 内的 Vue 应用 */
  private innerApp: App | null = null

  /** 响应式 schema */
  private schemaRef: { value: NodeModelJSON | null } = { value: null }

  /** 样式变化监听 */
  private styleObserver: MutationObserver | null = null

  /** 是否已挂载 */
  private mounted: boolean = false

  constructor(options: SimulatorOptions) {
    this.materialStore = options.materialStore
  }

  // ── 生命周期 ──────────────────────────────────────────

  /**
   * 挂载模拟器到指定容器
   *
   * 创建 iframe，写入骨架，注入样式，启动 Vue 应用。
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
   * 全量渲染 Block（切换页面或 History 恢复后调用）
   */
  renderBlock(blockJSON: NodeModelJSON | null): void {
    this.schemaRef.value = blockJSON
  }

  /**
   * 增量更新节点（属性变更时通过 refs 直接 patch）
   */
  renderNodeUpdate(nodeId: string, nodeJSON: NodeModelJSON): void {
    // 目前走全量渲染，后续可通过 refs 实现增量 patch
    // TODO: 通过 this.renderCtx.refs[nodeId] 获取组件实例，直接更新 props
    this.schemaRef.value = { ...this.schemaRef.value } as NodeModelJSON
  }

  // ── DOM 查询 ──────────────────────────────────────────

  /**
   * 获取 iframe 的 Document
   */
  getDocument(): Document | null {
    return this.iframe?.contentDocument ?? null
  }

  /**
   * 获取 iframe 的 Window
   */
  getWindow(): Window | null {
    return this.iframe?.contentWindow ?? null
  }

  /**
   * 获取 iframe 在主窗口中的偏移矩形
   */
  getIframeRect(): DOMRect | null {
    return this.iframe?.getBoundingClientRect() ?? null
  }

  /**
   * 通过节点 ID 获取对应的 DOM 元素
   */
  getNodeElement(nodeId: string): HTMLElement | null {
    const doc = this.getDocument()
    if (!doc) return null
    return doc.querySelector(`[data-__node-id__="${nodeId}"]`)
  }

  /**
   * 获取渲染上下文
   */
  getRenderContext(): RenderContext | null {
    return this.renderCtx
  }

  /**
   * 是否已挂载
   */
  isMounted(): boolean {
    return this.mounted
  }

  // ── 内部 ──────────────────────────────────────────────

  /** iframe 加载回调 */
  private onIframeLoad = (): void => {
    const doc = this.iframe?.contentDocument
    if (!doc) return

    this.writeSkeleton(doc)
    this.injectStyles(doc)
    this.mountRenderer(doc)
    this.observeStyleChanges(doc)

    this.mounted = true
  }

  /** 写入 HTML 骨架 */
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

  /** 注入父文档样式 */
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

  /** 在 iframe 中创建 Vue 应用 */
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
          return renderNode(
            simulator.schemaRef.value,
            simulator.renderCtx!,
            simulator.loader!,
            'design',
          )
        }
      },
    }

    // 创建并挂载
    this.innerApp = createApp(RootComponent)

    // 注册物料组件
    for (const [name, component] of this.materialStore.getAllComponents()) {
      this.innerApp.component(name, component)
    }

    this.innerApp.mount(rootEl)
  }

  /** 监听父文档样式变化 */
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
