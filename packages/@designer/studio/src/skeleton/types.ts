import type { Component } from 'vue'

/**
 * 菜单项
 */
export interface MaskMenu {
  /** 唯一标识 */
  key: string
  /** 显示文本 */
  label: string
  /** 图标 */
  icon?: string | Component
  /** 子菜单 */
  children?: MaskMenu[]
  /** 路由路径 */
  path?: string
}

/**
 * 工具栏操作项
 */
export interface MaskAction {
  /** 唯一标识 */
  key: string
  /** 图标 */
  icon?: string | Component
  /** 显示文本 */
  label?: string
  /** 点击回调 */
  handler?: () => void
  /** 子操作（下拉菜单） */
  children?: MaskAction[]
}

/**
 * 标签页
 */
export interface MaskTab {
  /** 唯一标识 */
  key: string
  /** 显示文本 */
  label: string
  /** 是否可关闭 */
  closable?: boolean
  /** 图标 */
  icon?: string
}

/**
 * SunnyMask 组件 Props
 */
export interface SunnyMaskProps {
  /** 应用标题 */
  title?: string
  /** Logo 图片地址或组件 */
  logo?: string | Component
  /** 侧边栏菜单 */
  menus?: MaskMenu[]
  /** 工具栏操作 */
  actions?: MaskAction[]
  /** 标签页列表 */
  tabs?: MaskTab[]
  /** 当前激活的标签页 key */
  activeTab?: string
  /** 侧边栏是否折叠 */
  collapsed?: boolean
  /** 主题 */
  theme?: 'light' | 'dark'
}

/**
 * SunnyMask 组件 Emits
 */
export interface SunnyMaskEmits {
  (e: 'update:collapsed', value: boolean): void
  (e: 'update:activeTab', key: string): void
  (e: 'menuClick', menu: MaskMenu): void
  (e: 'tabClick', tab: MaskTab): void
  (e: 'tabClose', key: string): void
}
