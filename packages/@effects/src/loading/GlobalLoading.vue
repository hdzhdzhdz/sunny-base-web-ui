<script lang="ts" setup>
/**
 * GlobalLoading 全局加载容器组件
 * @description 根据配置动态渲染不同类型的加载组件
 */
import { computed, watch, onMounted } from 'vue';
import { SunnySpinner, SunnyLoading } from '@sunny-base-web/ui';
import { loadingManager } from './loading-manager';

onMounted(() => {
  console.log('[GlobalLoading] Component mounted');
  console.log('[GlobalLoading] Initial isLoading:', loadingManager.isLoading.value);
});

// Props 定义
const props = defineProps<{
  type?: 'nprogress' | 'spinner' | 'loading' | 'none';
  minLoadingTime?: number;
}>();

// 计算属性
const type = computed(() => props.type || 'nprogress');
const minLoadingTime = computed(() => props.minLoadingTime || 50);

// ✅ 直接使用 loadingManager.isLoading，不要嵌套 computed
// 这样可以保持响应式追踪链完整
const isLoading = loadingManager.isLoading;

// 是否应该渲染加载组件（用于 v-show）
const shouldRender = computed(() => {
  return type.value !== 'nprogress' && type.value !== 'none';
});

// 调试日志
watch([type, isLoading], ([typeVal, loadingVal]) => {
  console.log('[GlobalLoading] State changed:', { type: typeVal, isLoading: loadingVal });
}, { immediate: true });
</script>

<template>
  <!-- NProgress: 由外部通过 router guard 控制，不渲染组件 -->
  <!-- none: 不渲染任何加载动画 -->

  <!-- 使用 Transition 实现淡入淡出 -->
  <Transition name="fade">
    <Teleport v-if="shouldRender" to="body">
      <div class="global-loading-container">
        <!-- Spinner: 方块跳跃动画 -->
        <SunnySpinner
          v-if="type === 'spinner'"
          :spinning="isLoading"
          :min-loading-time="minLoadingTime"
        />

        <!-- Loading: 四点旋转动画 -->
        <SunnyLoading
          v-else-if="type === 'loading'"
          :spinning="isLoading"
          :min-loading-time="minLoadingTime"
        />
      </div>
    </Teleport>
  </Transition>
</template>

<style scoped>
.global-loading-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  pointer-events: none;
}

/* 淡入淡出过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
