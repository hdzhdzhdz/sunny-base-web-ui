<script lang="ts" setup>
/**
 * SunnyLoading 加载组件
 * @description 带文字提示的四点旋转加载动画，支持自定义图标
 * @example
 * ```vue
 * <SunnyLoading :spinning="true" text="加载中..." />
 * ```
 */
import { computed } from 'vue';

import { cn } from '@sunny-base-web/utils';

import type { SunnyLoadingProps } from './types';
import { useLoadingState } from './use-loading-state';

defineOptions({
  name: 'SunnyLoading',
});

const props = withDefaults(defineProps<SunnyLoadingProps>(), {
  minLoadingTime: 50,
  text: '',
  spinning: false,
});

// 验证 minLoadingTime 参数
const validatedMinLoadingTime = computed(() => {
  const value = props.minLoadingTime ?? 50;
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
        'absolute left-0 top-0 z-100 flex size-full flex-col items-center justify-center',
        'transition-all duration-500 ease-in-out',
        'bg-[var(--color-bg-2)]/80 backdrop-blur-sm',
        {
          'invisible opacity-0': !isVisible,
        },
        props.class,
      )
    "
    :aria-live="spinning ? 'polite' : 'off'"
    :aria-busy="spinning"
    @transitionend="handleTransitionEnd"
  >
    <template v-if="shouldRender">
      <!-- 图标插槽 -->
      <slot name="icon">
        <div
          class="loading-spinner"
          :aria-label="text || '加载中'"
        >
          <span v-for="i in 4" :key="i" class="dot" aria-hidden="true"></span>
        </div>
      </slot>

      <!-- 文字提示 -->
      <div
        v-if="text"
        class="mt-4 text-sm text-[rgb(var(--primary-6))]"
      >
        {{ text }}
      </div>

      <!-- 默认插槽 -->
      <slot></slot>
    </template>
  </output>
</template>

<style scoped>
.loading-spinner {
  position: relative;
  width: 40px;
  height: 40px;
  animation: rotate 1.2s linear infinite;
}

.dot {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgb(var(--primary-6));
  animation: pulse 1s ease-in-out infinite;
}

.dot:nth-child(1) {
  top: 0;
  left: 0;
  animation-delay: 0s;
}

.dot:nth-child(2) {
  top: 0;
  right: 0;
  animation-delay: 0.25s;
}

.dot:nth-child(3) {
  right: 0;
  bottom: 0;
  animation-delay: 0.5s;
}

.dot:nth-child(4) {
  bottom: 0;
  left: 0;
  animation-delay: 0.75s;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
