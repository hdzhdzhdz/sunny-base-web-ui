/**
 * Renderer 渲染引擎类型定义
 */
import type { Component } from 'vue'
import type { NodeModelJSON } from '@sunny-base-web/designer-core'
import type { MaterialStore } from '@sunny-base-web/designer-materials'
import type { RenderContext } from './context'
import type { ComponentLoader } from './loader'

export type { Component, NodeModelJSON, MaterialStore, RenderContext, ComponentLoader }

/**
 * 渲染器组件属性
 */
export interface RendererProps {
  /** 要渲染的节点数据（JSON 序列化格式） */
  node: NodeModelJSON | null
  /** 物料存储 */
  materialStore: MaterialStore
  /** 运行时上下文（null = 设计态，实例 = 预览态） */
  context?: RenderContext | null
}

/**
 * 组件占位符属性（当组件未在物料库中注册时显示）
 */
export interface PlaceholderProps {
  /** 未注册的组件名 */
  componentName: string
}
