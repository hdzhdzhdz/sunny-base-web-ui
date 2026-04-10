/**
 * Widget 协议定义
 *
 * Widget 是左侧面板中的一个功能模块，每个 Widget 对应：
 * - 图标栏中的一个图标
 * - 展开时的面板内容
 *
 * 两种类型：
 * - panel：点击图标在左侧展开面板，显示 component 内容
 * - dialog：点击图标弹窗
 * - link：点击图标打开链接
 */
import type { Component } from 'vue'

/** Widget 打开方式 */
export type WidgetOpenType = 'panel' | 'dialog' | 'link'

/** Widget 定义 */
export interface Widget {
  /** 唯一标识（如 'pages', 'components'） */
  name: string
  /** 图标组件 */
  icon: Component
  /** 面板标题 / tooltip 文本 */
  title: string
  /** 面板内容组件（openType='panel' 时必填） */
  component?: Component
  /** 打开方式 */
  openType: WidgetOpenType
  /** 排序权重（越小越靠前） */
  order?: number
  /** 所属区域 */
  region: string
  /** dialog 类型时的弹窗组件 */
  dialogComponent?: Component
  /** link 类型时的链接地址 */
  link?: string
  /** 点击回调（dialog/link 类型） */
  handler?: () => void
}
