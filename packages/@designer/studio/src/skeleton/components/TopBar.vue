<script setup lang="ts">
import Tabs from './Tabs.vue'
import Toolbar from './Toolbar.vue'
import type { MaskTab, MaskAction } from '../types'

defineOptions({ name: 'TopBar' })

defineProps<{
  tabs?: MaskTab[]
  activeTab?: string
  actions?: MaskAction[]
}>()

const emit = defineEmits<{
  (e: 'tabClick', tab: MaskTab): void
  (e: 'tabClose', key: string): void
}>()
</script>

<template>
  <div class="flex items-center justify-between h-[40px] px-2 border-b border-[var(--color-border-2)] bg-[var(--color-bg-2)] shrink-0">
    <!-- 左侧：标签页 -->
    <Tabs
      :tabs="tabs"
      :active-tab="activeTab"
      @tab-click="emit('tabClick', $event)"
      @tab-close="emit('tabClose', $event)"
    />

    <!-- 右侧：工具栏 -->
    <Toolbar :actions="actions">
      <slot name="toolbar" />
    </Toolbar>
  </div>
</template>
