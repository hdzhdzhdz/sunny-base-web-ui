/**
 * Widget 协议定义
 *
 * Widget 是左侧面板中的一个功能模块。
 * 每个 Widget 在图标栏中对应一个图标，点击后根据 openType 有不同行为。
 *
 * ## Widget 类型
 *
 * | openType | 行为 | 示例 |
 * |----------|------|------|
 * | panel | 点击图标在左侧展开面板，显示 component 内容 | 页面管理、组件库 |
 * | dialog | 点击图标弹窗，调用 handler() | 快捷键帮助 |
 * | link | 点击图标打开链接 | 文档链接 |
 *
 * ## 数据流
 *
 * ```
 * WidgetRegistry.register(widget)
 *   → Apps 读取 registry.getPanelWidgets('apps')
 *   → 渲染图标栏
 *   → 点击图标 → handleIconClick(widget)
 *     → panel: 切换 activeWidgetName + panelExpanded
 *     → dialog: widget.handler()
 *     → link: window.open(widget.link)
 * ```
 *
 * @example
 * ```ts
 * const widget: Widget = {
 *   name: 'pages',
 *   icon: IconFile,
 *   title: '页面管理',
 *   component: PagesWidget,
 *   openType: 'panel',
 *   order: 1,
 *   region: 'apps',
 * }
 * ```
 */
import type { Component } from 'vue'

/** Widget 打开方式 */
export type WidgetOpenType = 'panel' | 'dialog' | 'link'

/** Widget 定义 */
export interface Widget {
  /** 唯一标识（如 'pages', 'components'） */
  name: string
  /** 图标组件（显示在图标栏中） */
  icon: Component
  /** 面板标题 / tooltip 文本 */
  title: string
  /** 面板内容组件（openType='panel' 时必填） */
  component?: Component
  /** 打开方式 */
  openType: WidgetOpenType
  /** 排序权重（越小越靠前，默认 100） */
  order?: number
  /** 所属区域（目前只有 'apps'） */
  region: string
  /** dialog 类型时的弹窗组件 */
  dialogComponent?: Component
  /** link 类型时的链接地址 */
  link?: string
  /** 点击回调（dialog/link 类型） */
  handler?: () => void
}
