/**
 * GlobalLoading 组件属性类型定义
 */

/**
 * GlobalLoading 组件属性
 */
export interface GlobalLoadingProps {
  /**
   * 加载动画类型
   * - 'nprogress': 顶部进度条（由外部控制）
   * - 'spinner': 方块跳跃动画
   * - 'loading': 四点旋转动画
   * - 'none': 禁用加载动画
   * @default 'spinner'
   */
  type?: 'nprogress' | 'spinner' | 'loading' | 'none';

  /**
   * 最小加载时间（毫秒），避免闪烁
   * @default 50
   */
  minLoadingTime?: number;
}
