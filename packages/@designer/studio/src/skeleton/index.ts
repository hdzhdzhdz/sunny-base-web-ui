/**
 * Skeleton 布局骨架模块入口
 *
 * 导出设计器主布局组件和 Widget 系统。
 *
 * ## 模块内容
 *
 * | 导出 | 说明 |
 * |------|------|
 * | `SunnyDesignerLayout` | 设计器主布局 Vue 组件 |
 * | `WidgetRegistry` | Widget 注册管理类 |
 * | `Widget` / `WidgetOpenType` | Widget 类型定义 |
 * | `createBuiltinWidgets` | 创建内置 Widget（页面管理、组件库） |
 */
export { default as SunnyDesignerLayout } from './SunnyDesignerLayout.vue'

// Widget 系统
export { WidgetRegistry } from './widgets/widget-registry'
export type { Widget, WidgetOpenType } from './widgets/types'
export { createBuiltinWidgets } from './widgets/built-in'
