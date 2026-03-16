<script lang="ts" setup>
/**
 * SunnySpinner 加载动画组件
 * @description 跳跃方块风格的加载动画，简洁现代
 * @example
 * ```vue
 * <SunnySpinner :spinning="true" />
 * ```
 */
import { computed } from 'vue';

import { cn } from '@sunny-base-web/utils';

import type { SunnySpinnerProps } from './types';
import { useLoadingState } from './use-loading-state';

defineOptions({
  name: 'SunnySpinner',
});

const props = withDefaults(defineProps<SunnySpinnerProps>(), {
  minLoadingTime: 50,
  spinning: false,
});

// 验证 minLoadingTime 参数
const validatedMinLoadingTime = computed(() => {
  const value = props.minLoadingTime ?? 50;
  if (value < 0) {
    console.warn('[SunnySpinner] minLoadingTime 不能为负数，已自动设置为 0');
    return 0;
  }
  if (value > 10000) {
    console.warn('[SunnySpinner] minLoadingTime 不应超过 10000ms，已自动限制');
    return 10000;
  }
  return value;
});

// 使用共享的加载状态管理
const { isVisible, shouldRender, handleTransitionEnd } = useLoadingState({
  spinning: computed(() => props.spinning),
  minLoadingTime: validatedMinLoadingTime,
});
</script>

<template>
  <output
    :class="
      cn(
        'absolute left-0 top-0 z-100 flex size-full items-center justify-center',
        'transition-all duration-500 ease-in-out',
        'bg-[var(--color-bg-2)]/80 backdrop-blur-sm',
        {
          'invisible opacity-0': !isVisible,
        },
        props.class,
      )
    "
    aria-label="加载中"
    :aria-live="spinning ? 'polite' : 'off'"
    :aria-busy="spinning"
    @transitionend="handleTransitionEnd"
  >
    <div v-if="shouldRender" class="spinner" aria-hidden="true">
      <div class="cube"></div>
      <div class="shadow"></div>
    </div>
  </output>
</template>

<style scoped>
.spinner {
  position: relative;
  width: 48px;
  height: 65px;
}

.cube {
  position: absolute;
  top: 0;
  left: 0;
  width: 48px;
  height: 48px;
  border-radius: 4px;
  background: rgb(var(--primary-6));
  animation: jump 0.5s ease-in-out infinite;
}

.shadow {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 48px;
  height: 5px;
  border-radius: 50%;
  background: rgba(var(--primary-6), 0.3);
  animation: shadow 0.5s ease-in-out infinite;
}

@keyframes jump {
  0% {
    transform: translateY(0) rotate(0deg) scale(1, 1);
    border-radius: 4px;
  }
  15% {
    border-bottom-right-radius: 3px;
  }
  25% {
    transform: translateY(9px) rotate(22.5deg);
  }
  50% {
    transform: translateY(18px) rotate(45deg) scale(1, 0.9);
    border-radius: 4px 4px 40px 40px;
  }
  75% {
    transform: translateY(9px) rotate(67.5deg);
  }
  100% {
    transform: translateY(0) rotate(90deg) scale(1, 1);
    border-radius: 4px;
  }
}

@keyframes shadow {
  0%,
  100% {
    transform: scale(1, 1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.2, 1);
    opacity: 0.5;
  }
}
</style>
