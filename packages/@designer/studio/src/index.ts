// @sunny-base-web/designer-studio
import './assets/style.css'

// Engine (引擎)
export { Engine } from './engine'
export type { EngineOptions } from './engine'

// Skeleton (布局)
export * from './skeleton'

// Simulator (渲染模拟器)
export { SunnySimulator, Simulator, EventBridge, createRenderer, createLoader, renderNode, RenderContext, useRenderer } from './simulator'
export type { SimulatorOptions, BridgeEventType, BridgeEventHandler, NodeInteractionEvent, RendererProps, PlaceholderProps, UseRendererOptions, UseRendererReturn } from './simulator'

// Designer (画布交互)
export { Designer } from './designer'
export type { DesignerOptions } from './designer'

// Setter (属性面板)
export { Setter } from './setter'
export type { SetterField } from './setter'

// Re-export from dependencies (convenience)
export { MaterialStore } from '@sunny-base-web/designer-materials'
export type { ComponentMeta, Snippet } from '@sunny-base-web/designer-materials'
export { ProjectModel } from '@sunny-base-web/designer-core'
export type { ProjectModelJSON, NodeModelJSON } from '@sunny-base-web/designer-core'

// Built-in Materials (内置物料)
export { createBuiltinMaterials } from './materials'
