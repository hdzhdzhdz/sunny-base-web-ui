/**
 * WidgetRegistry - Widget 注册管理
 *
 * 管理所有注册的 Widget，按区域分组查询。
 * 设计器初始化时注册内置 Widget，也支持外部插件注册自定义 Widget。
 *
 * @example
 * ```ts
 * const registry = new WidgetRegistry()
 * registry.register(pagesWidget)
 * registry.register(componentsWidget)
 *
 * const panelWidgets = registry.getByOpenType('panel')
 * ```
 */
import type { Widget, WidgetOpenType } from './types'

export class WidgetRegistry {
  private widgets: Map<string, Widget> = new Map()

  /**
   * 注册 Widget
   */
  register(widget: Widget): void {
    if (this.widgets.has(widget.name)) {
      console.warn(`[WidgetRegistry] Overwriting existing widget: ${widget.name}`)
    }
    this.widgets.set(widget.name, widget)
  }

  /**
   * 批量注册
   */
  registerAll(widgets: Widget[]): void {
    for (const w of widgets) {
      this.register(w)
    }
  }

  /**
   * 取消注册
   */
  unregister(name: string): void {
    this.widgets.delete(name)
  }

  /**
   * 获取指定 Widget
   */
  get(name: string): Widget | null {
    return this.widgets.get(name) ?? null
  }

  /**
   * 获取指定区域的所有 Widget（按 order 排序）
   */
  getByRegion(region: string): Widget[] {
    return this.sorted().filter((w) => w.region === region)
  }

  /**
   * 按 openType 过滤（在指定区域内）
   */
  getByOpenType(region: string, openType: WidgetOpenType): Widget[] {
    return this.getByRegion(region).filter((w) => w.openType === openType)
  }

  /**
   * 获取所有 panel 类型 Widget（用于渲染面板）
   */
  getPanelWidgets(region: string): Widget[] {
    return this.getByOpenType(region, 'panel')
  }

  /**
   * 获取所有非 panel 类型 Widget（dialog/link）
   */
  getOtherWidgets(region: string): Widget[] {
    return this.getByRegion(region).filter((w) => w.openType !== 'panel')
  }

  /**
   * 清空所有 Widget
   */
  clear(): void {
    this.widgets.clear()
  }

  /**
   * 已注册数量
   */
  get size(): number {
    return this.widgets.size
  }

  /** 按 order 排序 */
  private sorted(): Widget[] {
    return Array.from(this.widgets.values()).sort(
      (a, b) => (a.order ?? 100) - (b.order ?? 100),
    )
  }
}
