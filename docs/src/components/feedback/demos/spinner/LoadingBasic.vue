<script setup lang="ts">
import { ref } from 'vue';
import { SunnyLoading } from '@sunny-base-web/ui';

const loading = ref(true);

function toggleLoading() {
  loading.value = !loading.value;
}
</script>

<template>
  <div class="space-y-4">
    <a-button type="primary" @click="toggleLoading">
      {{ loading ? '隐藏加载' : '显示加载' }}
    </a-button>

    <div class="relative h-64 rounded-lg border border-[var(--color-border-2)] bg-[var(--color-bg-1)]">
      <SunnyLoading :spinning="loading" text="加载中..." />

      <div v-if="!loading" class="flex h-full items-center justify-center">
        <div class="text-center">
          <div class="mb-2 text-lg font-semibold text-[var(--color-text-1)]">内容区域</div>
          <div class="text-sm text-[var(--color-text-3)]">这里是实际的内容</div>
        </div>
      </div>
    </div>
  </div>
</template>
