<template>
  <a-dropdown trigger="click" @select="handleSelect">
    <div
      class="flex items-center justify-center w-9 h-9 rounded-full cursor-pointer transition-all duration-300 hover:bg-[var(--color-fill-3)] text-[var(--color-text-2)] hover:text-[var(--color-text-1)]"
    >
      <SunnyIcon :icon="currentIcon" :size="20" />
    </div>
    <template #content>
      <a-doption value="light">
        <template #icon><SunnyIcon icon="lucide:sun" /></template>
        <span>浅色模式</span>
        <template #suffix v-if="mode === 'light'"><SunnyIcon icon="lucide:check" class="text-[rgb(var(--primary-6))]" /></template>
      </a-doption>
      <a-doption value="dark">
        <template #icon><SunnyIcon icon="lucide:moon" /></template>
        <span>暗色模式</span>
        <template #suffix v-if="mode === 'dark'"><SunnyIcon icon="lucide:check" class="text-[rgb(var(--primary-6))]" /></template>
      </a-doption>
      <a-doption value="auto">
        <template #icon><SunnyIcon icon="lucide:monitor" /></template>
        <span>跟随系统</span>
        <template #suffix v-if="mode === 'auto'"><SunnyIcon icon="lucide:check" class="text-[rgb(var(--primary-6))]" /></template>
      </a-doption>
    </template>
  </a-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useColorMode } from '@vueuse/core';
import { SunnyIcon } from '@sunny-base-web/ui';

defineOptions({ name: 'ThemeToggle' });

const mode = useColorMode({
  emitAuto: true,
  onChanged: (mode) => {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.setAttribute('arco-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.removeAttribute('arco-theme');
    }
  }
});

const currentIcon = computed(() => {
  if (mode.value === 'auto') return 'lucide:monitor';
  return mode.value === 'dark' ? 'lucide:moon' : 'lucide:sun';
});

const handleSelect = (val: string | number | Record<string, any>) => {
  mode.value = val as 'light' | 'dark' | 'auto';
};
</script>
