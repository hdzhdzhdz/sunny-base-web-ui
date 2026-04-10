<!--
  Footer - 底栏区域

  NodePath(左) | Devtools + Hotkeys + Themer(右)
-->
<script setup lang="ts">
defineOptions({ name: 'DesignerFooter' })
</script>

<template>
  <footer class="flex items-center justify-between h-[28px] px-4 border-t border-[var(--color-border-2)] bg-[var(--color-bg-2)] text-xs text-[var(--color-text-3)] shrink-0">
    <!-- 左侧：NodePath -->
    <div class="flex items-center gap-1">
      <slot name="node-path" />
    </div>

    <!-- 右侧：Devtools -->
    <div class="flex items-center gap-3">
      <slot name="devtools" />
    </div>
  </footer>
</template>
