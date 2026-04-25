/**
 * WidgetRegistry - Widget 注册管理
 *
 * 管理所有注册的 Widget，按区域和类型分组查询。
 * 设计器初始化时注册内置 Widget，也支持外部插件注册自定义 Widget。
 *
 * ## 注册流程
 *
 * ```
 * const registry = new WidgetRegistry()
 * registry.registerAll(createBuiltinWidgets())
 *
 * // 外部插件注册自定义 Widget
 * registry.register({
 *   name: 'custom',
 *   icon: MyIcon,
 *   title: '自定义面板',
 *   component: MyWidget,
 *   openType: 'panel',
 *   region: 'apps',
 * })
 * ```
 *
 * ## 查询 API
 *
 * | 方法 | 说明 |
 * |------|------|
 * | `getByRegion(region)` | 获取指定区域的所有 Widget（按 order 排序） |
 * | `getPanelWidgets(region)` | 获取 panel 类型 Widget |
 * | `getOtherWidgets(region)` | 获取非 panel 类型 Widget |
 * | `get(name)` | 获取单个 Widget |
 *
 * @example
 * ```ts
 * const registry = new WidgetRegistry()
 * registry.registerAll(createBuiltinWidgets())
 *
 * const panelWidgets = registry.getPanelWidgets('apps')
 * // [{ name: 'pages', ... }, { name: 'components', ... }]
 * ```
 */
import type { Widget, WidgetOpenType } from './types'

export class WidgetRegistry {
  /** Widget 存储（name → Widget） */
  private widgets: Map<string, Widget> = new Map()

  /**
   * 注册 Widget
   *
   * 同名 Widget 会覆盖并打印警告。
   *
   * @param widget - Widget 定义
   */
  register(widget: Widget): void {
    if (this.widgets.has(widget.name)) {
      console.warn(`[WidgetRegistry] Overwriting existing widget: ${widget.name}`)
    }
    this.widgets.set(widget.name, widget)
  }

  /**
   * 批量注册
   *
   * @param widgets - Widget 定义数组
   */
  registerAll(widgets: Widget[]): void {
    for (const w of widgets) {
      this.register(w)
    }
  }

  /**
   * 取消注册
   *
   * @param name - Widget 名称
   */
  unregister(name: string): void {
    this.widgets.delete(name)
  }

  /**
   * 获取指定 Widget
   *
   * @param name - Widget 名称
   * @returns Widget 定义，不存在时返回 null
   */
  get(name: string): Widget | null {
    return this.widgets.get(name) ?? null
  }

  /**
   * 获取指定区域的所有 Widget（按 order 排序）
   *
   * @param region - 区域名（如 'apps'）
   * @returns 排序后的 Widget 数组
   */
  getByRegion(region: string): Widget[] {
    return this.sorted().filter((w) => w.region === region)
  }

  /**
   * 按 openType 过滤（在指定区域内）
   *
   * @param region - 区域名
   * @param openType - 打开方式
   * @returns 匹配的 Widget 数组
   */
  getByOpenType(region: string, openType: WidgetOpenType): Widget[] {
    return this.getByRegion(region).filter((w) => w.openType === openType)
  }

  /**
   * 获取所有 panel 类型 Widget（用于渲染面板）
   *
   * @param region - 区域名
   * @returns panel 类型的 Widget 数组
   */
  getPanelWidgets(region: string): Widget[] {
    return this.getByOpenType(region, 'panel')
  }

  /**
   * 获取所有非 panel 类型 Widget（dialog/link）
   *
   * @param region - 区域名
   * @returns 非 panel 类型的 Widget 数组
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

  /** 按 order 字段升序排序 */
  private sorted(): Widget[] {
    return Array.from(this.widgets.values()).sort(
      (a, b) => (a.order ?? 100) - (b.order ?? 100),
    )
  }
}
