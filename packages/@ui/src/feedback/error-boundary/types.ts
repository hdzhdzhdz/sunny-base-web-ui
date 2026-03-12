import type { Component } from 'vue';

/**
 * 错误边界组件 Props
 */
export interface ErrorBoundaryProps {
  /**
   * 是否显示详细错误信息
   * @default false
   */
  showDetails?: boolean;

  /**
   * 自定义错误图标
   */
  errorIcon?: Component;

  /**
   * 自定义错误标题
   */
  errorTitle?: string;

  /**
   * 自定义错误消息
   */
  errorMessage?: string;

  /**
   * 是否显示重试按钮
   * @default true
   */
  showRetry?: boolean;

  /**
   * 是否显示刷新按钮
   * @default true
   */
  showRefresh?: boolean;

  /**
   * 是否显示上报错误按钮
   * @default true
   */
  showReport?: boolean;
}

/**
 * 错误边界组件 Emits
 */
export interface ErrorBoundaryEmits {
  /**
   * 错误发生时触发
   */
  (e: 'error', error: Error, instance: any, info: string): void;

  /**
   * 重试时触发
   */
  (e: 'retry'): void;

  /**
   * 上报错误时触发
   */
  (e: 'report', error: Error): void;
}
