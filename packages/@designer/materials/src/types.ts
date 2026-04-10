/**
 * 物料协议类型定义
 *
 * 描述一个组件的完整元数据，是连接组件库面板和渲染器的桥梁。
 *
 * 设计原则：
 * - 一个 ComponentMeta 描述一种组件
 * - 包含渲染所需的组件引用（component 字段）
 * - 包含设计器所需的元数据（属性、事件、插槽、嵌套规则）
 * - 包含拖入时的默认配置（snippets）
 */
import type { Component } from 'vue'

// ── 属性元数据 ────────────────────────────────────────

/** 属性值类型 */
export type PropType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'select'
  | 'color'
  | 'icon'
  | 'json'
  | 'function'
  | 'array'
  | 'object'
  | 'node'        // 插槽型属性（如 default 插槽内容）
  | 'expression'  // 表达式字符串（如 'count > 5'）

/** 属性元数据 */
export interface PropMeta {
  /** 属性名（对应 Vue props 的 key） */
  name: string
  /** 显示标题（属性面板用） */
  title: string
  /** 值类型 */
  type: PropType
  /** 分组（属性面板分组显示，如 '基础属性'、'高级属性'） */
  group?: string
  /** 默认值 */
  defaultValue?: any
  /** 说明 */
  description?: string
  /** 是否必填 */
  required?: boolean
  /** select 类型的选项列表 */
  options?: { label: string; value: any }[]
  /** 校验函数体（表达式字符串） */
  validator?: string
  /** 排序权重 */
  order?: number
}

// ── 事件元数据 ────────────────────────────────────────

/** 事件参数 */
export interface EventParamMeta {
  /** 参数名 */
  name: string
  /** 参数类型描述 */
  type: string
  /** 说明 */
  description?: string
}

/** 事件元数据 */
export interface EventMeta {
  /** 事件名（如 'click', 'change'） */
  name: string
  /** 显示标题 */
  title: string
  /** 说明 */
  description?: string
  /** 事件参数列表 */
  params?: EventParamMeta[]
}

// ── 插槽元数据 ────────────────────────────────────────

/** 插槽元数据 */
export interface SlotMeta {
  /** 插槽名（'default' 为默认插槽） */
  name: string
  /** 显示标题 */
  title: string
  /** 说明 */
  description?: string
}

// ── 嵌套规则 ──────────────────────────────────────────

/** 嵌套规则 */
export interface NestingRules {
  /** 是否为容器（可接收子组件拖入） */
  isContainer: boolean
  /** 允许的子组件名白名单（空数组 = 不允许任何子组件，undefined = 不限制） */
  allowedChildren?: string[]
  /** 禁止的子组件名黑名单 */
  deniedChildren?: string[]
  /** 允许的父组件名白名单（undefined = 不限制） */
  allowedParents?: string[]
}

// ── 组件片段（拖入模板） ───────────────────────────────

/** 组件片段 — 拖入设计器时生成的默认配置 */
export interface Snippet {
  /** 片段标题（如 '基础按钮'、'主要按钮'） */
  title: string
  /** 片段描述 */
  description?: string
  /** 拖入时生成的默认 props */
  props?: Record<string, any>
  /** 拖入时生成的默认子节点（简化结构） */
  children?: SnippetChild[]
  /** 拖入时生成的默认插槽内容 */
  slots?: Record<string, SnippetChild[]>
}

/** 片段子节点（简化版，只需 name + props） */
export interface SnippetChild {
  /** 子组件名 */
  name: string
  /** 子组件 props */
  props?: Record<string, any>
  /** 递归子节点 */
  children?: SnippetChild[]
}

// ── 组件分类 ──────────────────────────────────────────

/** 组件分类 */
export type ComponentCategory =
  | 'basic'       // 基础原子（Button, Icon, Typography）
  | 'data'        // 数据展示（Table, Grid, Tag）
  | 'entry'       // 数据录入（Input, Select, Form）
  | 'feedback'    // 反馈（Modal, Drawer, Toast）
  | 'navigation'  // 导航（Menu, Breadcrumb, Tabs）
  | 'layout'      // 布局（Container, Divider, Grid）
  | 'composite'   // 复合业务（QueryGrid, SearchModal）

// ── 组件元数据（核心协议） ─────────────────────────────

/** 组件元数据 — 描述一个组件的完整信息 */
export interface ComponentMeta {
  // ── 基本信息 ─────────────────────────────────
  /** 组件名（全局唯一，如 'SunnyButton', 'a-input', 'div'） */
  name: string
  /** 显示标题（如 '按钮', '输入框'） */
  title: string
  /** 组件分类 */
  category: ComponentCategory
  /** 所属分组（左侧面板分组，如 '基础组件', 'Arco Design'） */
  group: string
  /** 排序权重（越小越靠前） */
  order?: number
  /** 图标名称 */
  icon?: string
  /** 组件描述 */
  description?: string

  // ── 组件引用 ─────────────────────────────────
  /** 实际的 Vue 组件（渲染器用） */
  component: Component
  /** HTML 原生元素标记（如 'div', 'span'，component 为对应标签名字符串） */
  isNativeElement?: boolean

  // ── 设计器配置 ───────────────────────────────
  /** 属性列表（属性面板用） */
  props: PropMeta[]
  /** 事件列表 */
  events: EventMeta[]
  /** 插槽列表 */
  slots: SlotMeta[]
  /** 嵌套规则（拖拽引擎用） */
  nestingRules: NestingRules
  /** 拖入片段（默认模板） */
  snippets: Snippet[]

  // ── 高级配置 ─────────────────────────────────
  /** 是否隐藏（不在面板中显示，但仍可渲染） */
  hidden?: boolean
  /** 额外扩展数据（插件用） */
  extra?: Record<string, any>
}
