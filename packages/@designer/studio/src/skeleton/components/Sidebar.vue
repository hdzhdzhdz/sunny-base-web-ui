<script setup lang="ts">
import { computed } from 'vue'
import Brand from './Brand.vue'
import MaskMenu from './Menu.vue'
import type { MaskMenu as MaskMenuType } from '../types'

defineOptions({ name: 'Sidebar' })

const props = withDefaults(defineProps<{
  title?: string
  logo?: any
  menus?: MaskMenuType[]
  collapsed?: boolean
  selectedKey?: string
}>(), {
  menus: () => [],
  collapsed: false,
})

const emit = defineEmits<{
  (e: 'update:collapsed', value: boolean): void
  (e: 'menuClick', menu: MaskMenuType): void
}>()

const siderWidth = computed(() => props.collapsed ? '48px' : '220px')
</script>

<template>
  <aside
    class="h-full flex flex-col border-r border-[var(--color-border-2)] bg-[var(--color-bg-2)] transition-[width] duration-200 shrink-0 overflow-hidden"
    :style="{ width: siderWidth }"
  >
    <!-- Logo + Title -->
    <Brand :title="title" :logo="logo" :collapsed="collapsed" />

    <!-- 菜单 -->
    <MaskMenu
      :menus="menus"
      :collapsed="collapsed"
      :selected-key="selectedKey"
      @menu-click="emit('menuClick', $event)"
    />

    <!-- 底部折叠按钮 -->
    <div class="shrink-0 flex items-center justify-center h-[40px] border-t border-[var(--color-border-2)]">
      <span
        class="flex items-center justify-center w-8 h-8 rounded cursor-pointer hover:bg-[var(--color-fill-2)] transition-colors"
        @click="emit('update:collapsed', !collapsed)"
      >
        <icon-menu-fold v-if="!collapsed" :size="16" />
        <icon-menu-unfold v-else :size="16" />
      </span>
    </div>
  </aside>
</template>
