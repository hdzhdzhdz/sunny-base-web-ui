import type { Component } from 'vue';

/**
 * SunnyIcon 组件 Props 类型定义
 */
export interface SunnyIconProps {
  /** 图标未找到时是否显示默认图标 @default false */
  fallback?: boolean;
  /**
   * 图标来源
   * - Component: Vue 组件
   * - Function: 返回组件的函数
   * - string: Iconify 图标字符串（如 'lucide:home'）或远程图标 URL（需 http/https 协议）
   */
  icon?: Component | Function | string;
}
