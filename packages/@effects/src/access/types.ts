/**
 * AccessControl 权限控制组件类型定义
 */

import type { VNodeChild } from 'vue';

export interface AccessControlProps {
  /**
   * 权限码数组（工号或角色，取决于 type）
   * @default []
   */
  codes?: string[];
  /**
   * 判断类型
   * - code: 按工号判断
   * - role: 按角色判断
   * @default 'code'
   */
  type?: 'code' | 'role';
  /**
   * 自定义权限判断函数（同步，返回 true 表示有权限）
   */
  authorize?: () => boolean | Promise<boolean>;
}

export interface AccessControlSlots {
  /**
   * 有权限时显示的内容
   */
  default?: () => VNodeChild;
  /**
   * 无权限时显示的内容
   */
  fallback?: () => VNodeChild;
}

export interface AccessControlEmits {
  /**
   * 权限状态变化时触发
   */
  change: [visible: boolean];
}
