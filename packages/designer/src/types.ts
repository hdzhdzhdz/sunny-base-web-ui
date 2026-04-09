/**
 * Designer 包类型定义
 * 代码可视化相关类型
 */

/**
 * 设计器节点类型
 */
export enum DesignerNodeType {
  /** 组件 */
  Component = 'component',
  /** 容器 */
  Container = 'container',
  /** 文本 */
  Text = 'text',
}

/**
 * 设计器节点
 */
export interface DesignerNode {
  /** 节点唯一标识 */
  id: string
  /** 节点类型 */
  type: DesignerNodeType
  /** 组件名称 */
  componentName?: string
  /** 节点属性 */
  props?: Record<string, any>
  /** 子节点 */
  children?: DesignerNode[]
}

/**
 * 设计器配置
 */
export interface DesignerConfig {
  /** 设计器模式 */
  mode?: 'edit' | 'preview'
}
