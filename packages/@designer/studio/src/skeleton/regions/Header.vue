<!--
  Header - 顶栏区域

  固定 48px 高度的顶部栏，三段式布局：
  - 左侧：Brand（Logo + 标题）
  - 中间：Toolbar 插槽（撤销/重做等工具按钮）
  - 右侧：Actions 插槽（预览/保存/发布等操作按钮）
-->
<script setup lang="ts">
import type { Component } from 'vue'

defineOptions({ name: 'DesignerHeader' })

defineProps<{
  /** 应用标题（显示在左侧 Brand 区域） */
  title?: string
  /** Logo 组件（显示在标题左侧） */
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
