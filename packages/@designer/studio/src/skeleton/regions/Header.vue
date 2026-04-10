<!--
  Header - 顶栏区域

  Brand(Logo+切换) | Toolbar(工具栏) | Actions(操作)
-->
<script setup lang="ts">
import type { Component } from 'vue'

defineOptions({ name: 'DesignerHeader' })

defineProps<{
  /** 应用标题 */
  title?: string
  /** Logo */
  logo?: string | Component
}>()

defineEmits<{
  (e: 'togglePreview', value: boolean): void
}>()
</script>

<template>
  <header class="flex items-center justify-between h-[48px] px-4 border-b border-[var(--color-border-2)] bg-[var(--color-bg-2)] shrink-0">
    <!-- 左侧：Brand -->
    <div class="flex items-center gap-2">
      <component :is="logo" v-if="logo" :size="24" />
      <span class="text-sm font-semibold text-[var(--color-text-1)]">{{ title }}</span>
    </div>

    <!-- 中间：Toolbar（插槽） -->
    <div class="flex items-center gap-2">
      <slot name="toolbar" />
    </div>

    <!-- 右侧：Actions（插槽） -->
    <div class="flex items-center gap-2">
      <slot name="actions" />
    </div>
  </header>
</template>
