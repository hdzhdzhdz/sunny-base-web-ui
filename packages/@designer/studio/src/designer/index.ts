/**
 * Designer 模块入口
 *
 * 导出画布交互层三层架构：
 * - EventBridge（事件桥梁）— iframe DOM 事件 → 语义节点事件
 * - Designer（状态层）— 响应式状态 + EventBridge
 * - useDesigner（计算层）— Ref + Simulator → CSS 样式
 * - DesignerOverlay（渲染层）— Vue 组件 + Tailwind
 */
export { EventBridge } from './event-bridge'
export type { BridgeEventType, BridgeEventHandler, NodeInteractionEvent } from './event-bridge'
export { Designer } from './designer'
export type { DesignerOptions } from './designer'
export { useDesigner } from './useDesigner'
export type { OverlayStyle } from './useDesigner'
export { default as DesignerOverlay } from './DesignerOverlay.vue'
