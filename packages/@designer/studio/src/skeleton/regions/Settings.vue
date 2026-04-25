<!--
  Settings - 右侧属性面板区域

  固定 350px 宽度的右侧面板，包含面板标题和 SetterPanel。
  SetterPanel 根据 Engine 的选中状态自动展示对应组件的属性编辑器。
-->
<script setup lang="ts">
import SetterPanel from './SetterPanel.vue'

defineOptions({ name: 'DesignerSettings' })
</script>

<template>
  <div class="w-[350px] border-l border-[var(--color-border-2)] bg-[var(--color-bg-2)] shrink-0 flex flex-col overflow-hidden">
    <!-- 面板标题 -->
    <div class="flex items-center h-[40px] px-4 border-b border-[var(--color-border-2)] shrink-0">
      <span class="text-sm font-medium text-[var(--color-text-1)]">属性设置</span>
    </div>
    <!-- Setter 面板 -->
    <div class="flex-1 overflow-y-auto">
      <SetterPanel />
    </div>
  </div>
</template>
