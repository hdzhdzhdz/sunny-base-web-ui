<script setup lang="ts">
import { onErrorCaptured, computed, shallowRef, markRaw } from 'vue';
import { $t } from '@sunny-base-web/locales';
import type { ErrorBoundaryProps, ErrorBoundaryEmits } from './types';

defineOptions({
  name: 'ErrorBoundary',
});

const props = withDefaults(defineProps<ErrorBoundaryProps>(), {
  showRetry: true,
  showRefresh: true,
  showReport: true,
});

const emit = defineEmits<ErrorBoundaryEmits>();

// 使用 shallowRef 避免响应式追踪可能出错的组件
const hasError = shallowRef(false);
// 使用 markRaw 避免响应式追踪 Error 对象
const errorInfo = shallowRef<Error | null>(null);

// 使用国际化文本（合并为一个对象，减少重复代码）
const i18nText = computed(() => ({
  title: props.errorMessage || $t('error.title'),
  desc: $t('error.message'),
  retry: $t('error.retry'),
  refresh: $t('error.refresh'),
  report: $t('error.reportError'),
  details: $t('error.details'),
  errorMessage: $t('error.errorMessage'),
  errorStack: $t('error.errorStack'),
}));

// 捕获子组件错误
onErrorCaptured((err, instance, info) => {
  // 如果已经有错误了，忽略后续的错误（避免重复打印 render 阶段的错误）
  if (hasError.value) {
    return false;
  }

  // 校验错误对象类型，确保是 Error 实例
  const validError = err instanceof Error ? err : new Error(String(err));

  // 使用 markRaw 包装错误对象，避免响应式追踪导致二次错误
  hasError.value = true;
  errorInfo.value = markRaw(validError);

  // 开发环境打印详细错误（只打印第一个错误）
  if (import.meta.env.DEV) {
    console.group('🔴 ErrorBoundary 捕获错误');
    console.error('错误:', err);
    console.error('组件:', instance?.$options?.name || 'Unknown');
    console.error('错误信息:', info);
    console.groupEnd();
  }

  // 返回 false 阻止错误向上传播
  return false;
});

/**
 * 重试（清除错误状态）
 */
function handleRetry() {
  hasError.value = false;
  errorInfo.value = null;
  emit('retry');
}

/**
 * 刷新页面
 */
function handleRefresh() {
  window.location.reload();
}

/**
 * 上报错误
 */
function handleReport() {
  if (errorInfo.value) {
    emit('report', errorInfo.value);
  }
}
</script>

<template>
  <!-- 错误状态显示错误UI -->
  <div v-if="hasError" class="flex items-center justify-center min-h-[400px] p-8">
    <div class="max-w-[520px] w-full text-center">
      <!-- 错误图标 -->
      <div class="flex justify-center mb-6 text-[var(--color-danger-6)]">
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-12 h-12">
          <circle cx="24" cy="24" r="23" stroke="currentColor" stroke-width="1.5" />
          <path d="M24 16v8M24 28v4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <circle cx="24" cy="36" r="1.5" fill="currentColor" />
        </svg>
      </div>

      <!-- 错误标题 -->
      <div class="mb-3 text-lg font-semibold text-[var(--color-text-1)]">
        {{ i18nText.title }}
      </div>

      <!-- 错误描述 -->
      <div class="mb-6 text-sm text-[var(--color-text-2)] leading-relaxed">
        {{ i18nText.desc }}
      </div>

      <!-- 错误详情 -->
      <div v-if="errorInfo"
        class="mt-6 mb-6 text-left bg-[var(--color-fill-1)] border border-[var(--color-border-2)] rounded-md overflow-hidden">
        <div
          class="flex items-center gap-2 px-4 py-3 bg-[var(--color-fill-2)] border-b border-[var(--color-border-2)] text-sm font-medium text-[var(--color-text-2)]">
          <svg viewBox="0 0 16 16" fill="currentColor" class="w-3.5 h-3.5 text-[var(--color-warning-6)]">
            <path fill-rule="evenodd"
              d="M8.22 1.754a.25.25 0 00-.44 0L1.698 13.132a.25.25 0 00.22.368h12.164a.25.25 0 00.22-.368L8.22 1.754zM9 13a1 1 0 11-2 0 0 1 1 0 012 0zM9 11a1 1 0 01-2 0V7a1 1 0 012 0v4z"
              clip-rule="evenodd" />
          </svg>
          <span>{{ i18nText.details }}</span>
        </div>
        <div class="p-4">
          <div class="mb-3">
            <span class="block mb-1 text-xs text-[var(--color-text-3)]">{{ i18nText.errorMessage }}</span>
            <div class="p-2 bg-[var(--color-fill-1)] rounded text-xs text-[var(--color-text-2)] font-mono break-all">
              {{ errorInfo?.message }}</div>
          </div>
          <div>
            <span class="block mb-1 text-xs text-[var(--color-text-3)]">{{ i18nText.errorStack }}</span>
            <pre
              class="mt-2 p-3 bg-[var(--color-fill-2)] rounded text-xs text-[var(--color-text-2)] font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap break-all max-h-[240px]">{{ errorInfo?.stack }}</pre>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex gap-3 justify-center flex-wrap">
        <button v-if="showRetry"
          class="px-4 py-2 bg-[rgb(var(--primary-6))] text-white rounded hover:bg-[rgb(var(--primary-7))]"
          @click="handleRetry">
          {{ i18nText.retry }}
        </button>

        <button v-if="showRefresh"
          class="px-4 py-2 bg-[var(--color-bg-5)] text-[var(--color-text-1)] rounded hover:bg-[var(--color-bg-4)] border border-[var(--color-border)]"
          @click="handleRefresh">
          {{ i18nText.refresh }}
        </button>

        <button v-if="showReport"
          class="px-4 py-2 bg-[var(--color-danger-6)] text-white rounded hover:bg-[var(--color-danger-7)]"
          @click="handleReport">
          {{ i18nText.report }}
        </button>
      </div>
    </div>
  </div>

  <!-- 正常状态渲染 slot -->
  <slot v-else />
</template>
