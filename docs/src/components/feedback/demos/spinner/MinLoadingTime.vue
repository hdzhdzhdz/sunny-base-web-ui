<script setup lang="ts">
import { ref } from 'vue';
import { SunnyLoading, SunnySpinner } from '@sunny-base-web/ui';

const loading1 = ref(false);
const loading2 = ref(false);

// 快速加载（无最小时间）
async function handleQuickLoad() {
  loading1.value = true;
  // 模拟快速加载（50ms）
  await new Promise(resolve => setTimeout(resolve, 50));
  loading1.value = false;
}

// 带最小加载时间
async function handleMinLoadTime() {
  loading2.value = true;
  // 模拟快速加载（50ms），但会显示至少 500ms
  await new Promise(resolve => setTimeout(resolve, 50));
  loading2.value = false;
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex gap-2">
      <a-button type="primary" @click="handleQuickLoad">
        快速加载（50ms）
      </a-button>
      <a-button type="primary" @click="handleMinLoadTime">
        最小加载时间（500ms）
      </a-button>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <!-- 无最小时间 - 可能闪烁 -->
      <div class="relative h-48 rounded-lg border border-[var(--color-border-2)] bg-[var(--color-bg-1)]">
        <SunnyLoading
          :spinning="loading1"
          :min-loading-time="0"
          text="快速加载..."
        />
        <div v-if="!loading1" class="flex h-full items-center justify-center">
          <div class="text-sm text-[var(--color-text-3)]">可能看不到加载动画</div>
        </div>
      </div>

      <!-- 带最小时间 - 平滑展示 -->
      <div class="relative h-48 rounded-lg border border-[var(--color-border-2)] bg-[var(--color-bg-1)]">
        <SunnySpinner
          :spinning="loading2"
          :min-loading-time="500"
        />
        <div v-if="!loading2" class="flex h-full items-center justify-center">
          <div class="text-sm text-[var(--color-text-3)]">至少显示 500ms</div>
        </div>
      </div>
    </div>
  </div>
</template>
