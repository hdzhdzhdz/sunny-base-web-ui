<script setup lang="ts">
import type { MaskTab } from '../types'

defineOptions({ name: 'MaskTabs' })

const props = withDefaults(defineProps<{
  tabs?: MaskTab[]
  activeTab?: string
}>(), {
  tabs: () => [],
})

const emit = defineEmits<{
  (e: 'tabClick', tab: MaskTab): void
  (e: 'tabClose', key: string): void
}>()
</script>

<template>
  <div v-if="tabs.length" class="flex items-end h-full overflow-x-auto gap-0.5 px-2">
    <div
      v-for="tab in tabs"
      :key="tab.key"
      class="group relative flex items-center gap-1 px-3 h-[32px] rounded-t-md text-sm cursor-pointer shrink-0 transition-colors"
      :class="[
        tab.key === activeTab
          ? 'bg-[var(--color-bg-2)] text-[rgb(var(--primary-6))] font-medium'
          : 'text-[var(--color-text-2)] hover:text-[var(--color-text-1)] hover:bg-[var(--color-fill-2)]',
      ]"
      @click="emit('tabClick', tab)"
    >
      <span class="truncate max-w-[120px]">{{ tab.label }}</span>
      <span
        v-if="tab.closable !== false && tabs.length > 1"
        class="ml-1 opacity-0 group-hover:opacity-100 text-[var(--color-text-3)] hover:text-[var(--color-text-1)] transition-opacity"
        @click.stop="emit('tabClose', tab.key)"
      >
        <icon-close :size="12" />
      </span>
    </div>
  </div>
</template>
