/**
 * @sunny-base-web/designer-render
 *
 * 统一渲染引擎 — 支持 RenderContext 的设计态/预览态渲染。
 *
 * 核心架构（4-file）：
 * - context.ts  → RenderContext（运行时上下文）
 * - loader.ts   → ComponentLoader（组件查找，从 MaterialStore 读取）
 * - node.ts     → renderNode（递归渲染节点）
 * - block.ts    → createRenderer（编译入口）
 */

// 运行时上下文
export { RenderContext, parseValue } from './context'

// 组件加载器
export { createLoader } from './loader'
export type { ComponentLoader, SchemaLoader } from './loader'

// 递归渲染节点
export { renderNode } from './node'

// 编译入口
export { createRenderer } from './block'
export type { CreateRendererOptions } from './block'

// Composable
export { useRenderer } from './use-renderer'
export type { UseRendererOptions, UseRendererReturn } from './use-renderer'

// 类型
export type { RendererProps, PlaceholderProps } from './types'
