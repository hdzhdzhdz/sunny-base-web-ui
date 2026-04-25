/**
 * Simulator 渲染模拟器模块入口
 *
 * 导出 iframe 沙箱渲染相关的类、类型和 @designer/render 的重导出。
 *
 * ## 模块内容
 *
 * | 导出 | 说明 |
 * |------|------|
 * | `SunnySimulator` | Vue 组件包装（响应式 schema 驱动） |
 * | `Simulator` | 核心类（iframe 生命周期管理） |
 * | `createLoader` / `renderNode` / `RenderContext` | 来自 @designer/render |
 */
export { default as SunnySimulator } from './SunnySimulator.vue'
export { Simulator } from './simulator'
export type { SimulatorOptions } from './simulator'
export { createRenderer, createLoader, renderNode, RenderContext, useRenderer } from '@sunny-base-web/designer-render'
export type { RendererProps, PlaceholderProps, UseRendererOptions, UseRendererReturn } from '@sunny-base-web/designer-render'
