/**
 * @sunny-base-web/designer-studio - 设计器 Studio 层
 *
 * 低代码设计器的完整 Studio 层，基于 @designer/core 数据模型构建，
 * 提供可视化的页面搭建能力。
 *
 * ## 架构概览
 *
 * ```
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  SunnyDesignerLayout (布局)                                        │
 * │  ┌──────┬─────────────────────────────────┬──────────────┐        │
 * │  │ Apps │         Workspace               │   Settings   │        │
 * │  │ 左栏 │    ┌───────────────────┐        │   属性面板    │        │
 * │  │      │    │  Simulator (iframe) │        │              │        │
 * │  │ 页面 │    │  ┌───────────────┐ │        │  SetterPanel │        │
 * │  │ 组件 │    │  │  Vue 渲染器    │ │        │  (读/写属性)  │        │
 * │  │      │    │  └───────────────┘ │        │              │        │
 * │  │      │    └───────────────────┘        │              │        │
 * │  │      │    Designer (Overlay/交互)       │              │        │
 * │  └──────┴─────────────────────────────────┴──────────────┘        │
 * └────────────────────────────────────────────────────────────────────┘
 * ```
 *
 * ## 模块分工
 *
 * | 模块 | 职责 | 核心类 |
 * |------|------|--------|
 * | Engine | 中央引擎，持有 ProjectModel + History + 选中状态 | `Engine` |
 * | Simulator | iframe 沙箱渲染，隔离画布样式 | `Simulator` |
 * | Designer | 画布交互 + EventBridge（选中/悬浮/操作工具栏） | `Designer` |
 * | Setter | 属性面板读写（桥接 NodeModel ↔ UI 表单） | `Setter` |
 * | Skeleton | 布局骨架（Header/Apps/Workspace/Settings/Footer） | `SunnyDesignerLayout` |
 * | Widgets | 左侧面板功能模块（页面管理、组件库） | `WidgetRegistry` |
 * | Materials | 内置物料定义（组件元数据 + snippets） | 各 `createXxxMeta()` |
 *
 * ## 数据流
 *
 * ```
 * 用户操作（点击/拖拽/编辑）
 *   ├── EventBridge → Designer → Engine.select() → UI 刷新
 *   ├── SetterPanel → Setter → NodeModel.setProp() → EVENT_NODE_CHANGE → Workspace 重渲染
 *   ├── ComponentsWidget (拖拽) → Workspace.handleDrop → Engine.addNode()
 *   └── PagesWidget → Engine.switchPage() → EVENT_PAGE_SWITCH → Workspace 重渲染
 * ```
 *
 * ## 依赖关系
 *
 * - `@sunny-base-web/designer-core` — 数据模型（NodeModel, BlockModel, ProjectModel, History, emitter）
 * - `@sunny-base-web/designer-materials` — 物料系统（ComponentMeta, MaterialStore）
 * - `@sunny-base-web/designer-render` — 运行时渲染器（renderNode, RenderContext, createLoader）
 *
 * @example
 * ```ts
 * import {
 *   Engine, Designer, SunnyDesignerLayout,
 *   WidgetRegistry, createBuiltinWidgets,
 *   createBuiltinMaterials,
 *   MaterialStore,
 * } from '@sunny-base-web/designer-studio'
 *
 * // 1. 创建物料存储
 * const materialStore = new MaterialStore()
 * materialStore.registerAll(createBuiltinMaterials())
 *
 * // 2. 创建引擎
 * const engine = new Engine({ materialStore })
 *
 * // 3. 加载项目
 * engine.loadProject(projectJSON)
 *
 * // 4. 创建布局（Vue 组件）
 * // <SunnyDesignerLayout :engine="engine" :widget-registry="widgetRegistry" />
 * ```
 */
import './assets/style.css'

// Engine (引擎)
export { Engine } from './engine'
export type { EngineOptions } from './engine'

// Skeleton (布局)
export * from './skeleton'

// Simulator (渲染模拟器)
export { SunnySimulator, Simulator, createRenderer, createLoader, renderNode, RenderContext, useRenderer } from './simulator'
export type { SimulatorOptions, RendererProps, PlaceholderProps, UseRendererOptions, UseRendererReturn } from './simulator'

// Designer (画布交互 + EventBridge)
export { Designer, useDesigner, DesignerOverlay, EventBridge } from './designer'
export type { DesignerOptions, OverlayStyle, BridgeEventType, BridgeEventHandler, NodeInteractionEvent } from './designer'

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
