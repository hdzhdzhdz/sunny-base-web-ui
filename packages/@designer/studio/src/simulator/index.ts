/**
 * Simulator 渲染模拟器
 *
 * 提供 iframe 沙箱渲染环境，隔离设计器 UI 和画布组件样式。
 */
export { default as SunnySimulator } from './SunnySimulator.vue'
export { Simulator } from './simulator'
export type { SimulatorOptions } from './simulator'
export { EventBridge } from './event-bridge'
export type { BridgeEventType, BridgeEventHandler, NodeInteractionEvent } from './event-bridge'
export { createRenderer, createLoader, renderNode, RenderContext, useRenderer } from '@sunny-base-web/designer-render'
export type { RendererProps, PlaceholderProps, UseRendererOptions, UseRendererReturn } from '@sunny-base-web/designer-render'
