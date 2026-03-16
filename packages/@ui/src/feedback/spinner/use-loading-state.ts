import { ref, watch, onUnmounted, computed, type Ref } from 'vue';

/**
 * 加载状态管理的配置选项
 */
export interface UseLoadingStateOptions {
  /**
   * 加载状态
   */
  spinning: Ref<boolean>;

  /**
   * 最小加载时间（毫秒）
   * @description 避免加载闪烁，设置最小展示时间
   * @default 50
   */
  minLoadingTime?: Ref<number> | number;
}

/**
 * 加载状态管理 composable
 * @description 管理加载动画的显示/隐藏逻辑，支持最小加载时间
 * @example
 * ```ts
 * const spinning = ref(true);
 * const { isVisible, shouldRender } = useLoadingState({
 *   spinning,
 *   minLoadingTime: 200
 * });
 * ```
 */
export function useLoadingState(options: UseLoadingStateOptions) {
  const { spinning, minLoadingTime = 50 } = options;

  // 控制可见性（淡入淡出动画）
  const isVisible = ref(false);

  // 控制DOM渲染（优化性能）
  const shouldRender = ref(false);

  // 定时器引用
  const timer = ref<ReturnType<typeof setTimeout>>();

  // 验证并规范化最小加载时间
  const validatedMinLoadingTime = computed(() => {
    const value = typeof minLoadingTime === 'number' ? minLoadingTime : minLoadingTime.value;
    // 参数验证：确保在合理范围内
    if (value < 0) {
      console.warn('[SunnyLoading] minLoadingTime 不能为负数，已自动设置为 0');
      return 0;
    }
    if (value > 10000) {
      console.warn('[SunnyLoading] minLoadingTime 不应超过 10000ms，已自动限制');
      return 10000;
    }
    return value;
  });

  // 监听 spinning 状态变化
  watch(
    spinning,
    (isSpinning) => {
      // 清除定时器
      clearTimeout(timer.value);

      if (!isSpinning) {
        // 隐藏：立即触发淡出动画
        isVisible.value = false;
        return;
      }

      // 显示：延迟 minLoadingTime 后显示
      timer.value = setTimeout(() => {
        shouldRender.value = true;
        // 下一帧触发淡入动画
        requestAnimationFrame(() => {
          isVisible.value = true;
        });
      }, validatedMinLoadingTime.value);
    },
    { immediate: true },
  );

  // 组件卸载时清理定时器（防止内存泄漏）
  onUnmounted(() => {
    clearTimeout(timer.value);
  });

  // 过渡结束后的回调
  function handleTransitionEnd() {
    // 完全隐藏后移除DOM
    if (!isVisible.value) {
      shouldRender.value = false;
    }
  }

  return {
    isVisible,
    shouldRender,
    handleTransitionEnd,
  };
}
