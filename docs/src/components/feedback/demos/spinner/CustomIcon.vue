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

    <div class="grid grid-cols-2 gap-4">
      <!-- 自定义旋转图标 -->
      <div class="relative h-48 rounded-lg border border-[var(--color-border-2)] bg-[var(--color-bg-1)]">
        <SunnyLoading :spinning="loading" text="加载中...">
          <template #icon>
            <div class="text-4xl animate-spin">⚙️</div>
          </template>
        </SunnyLoading>
      </div>

      <!-- 自定义 Emoji 图标 -->
      <div class="relative h-48 rounded-lg border border-[var(--color-border-2)] bg-[var(--color-bg-1)]">
        <SunnyLoading :spinning="loading" text="处理中...">
          <template #icon>
            <div class="text-4xl animate-bounce">🔄</div>
          </template>
        </SunnyLoading>
      </div>
    </div>
  </div>
</template>
