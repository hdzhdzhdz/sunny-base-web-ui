/**
 * SunnyLoading 组件属性
 */
export interface SunnyLoadingProps {
  /**
   * 自定义类名
   */
  class?: string;

  /**
   * 最小加载时间（毫秒）
   * @description 避免加载闪烁，设置最小展示时间
   * @default 50
   */
  minLoadingTime?: number;

  /**
   * 加载状态
   * @description 控制加载动画的显示与隐藏
   * @default false
   */
  spinning?: boolean;

  /**
   * 加载提示文字
   * @description 显示在动画下方的文字说明
   * @default ''
   */
  text?: string;
}

/**
 * SunnySpinner 组件属性
 */
export interface SunnySpinnerProps {
  /**
   * 自定义类名
   */
  class?: string;

  /**
   * 最小加载时间（毫秒）
   * @description 避免加载闪烁，设置最小展示时间
   * @default 50
   */
  minLoadingTime?: number;

  /**
   * 加载状态
   * @description 控制加载动画的显示与隐藏
   * @default false
   */
  spinning?: boolean;
}
